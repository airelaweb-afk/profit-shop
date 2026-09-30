"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSigningKey,
  downloadText,
  getPublicJwkString,
  getSigningKey,
  importSigningKey,
  listMembers,
  replaceSigningKey,
} from "@/lib/admin";
import {
  hasPublicKey,
  publicFromPrivate,
  publicKeyJwk,
  revokedSerials,
  verifyWithJwk,
  type ProKeyInfo,
} from "@/lib/pro-keys";
import { formatDateEs } from "@/lib/use-admin";

function samePublic(a: JsonWebKey | null, b: JsonWebKey | null) {
  return Boolean(a && b && a.x === b.x && a.y === b.y);
}

export function AdminKeys() {
  const priv = getSigningKey();
  const publicString = getPublicJwkString();
  const sitePublic = publicKeyJwk();
  const matches = samePublic(priv ? publicFromPrivate(priv) : null, sitePublic);
  const [importText, setImportText] = useState("");
  const [check, setCheck] = useState("");
  const [result, setResult] = useState<(ProKeyInfo & { expired: boolean }) | null | "idle">("idle");
  const [msg, setMsg] = useState("");
  const revoked = listMembers().filter((m) => m.status === "revocado").map((m) => m.serial);

  async function verify() {
    const jwk = sitePublic ?? (priv ? publicFromPrivate(priv) : null);
    if (!jwk) {
      setMsg("No hay clave con la que verificar.");
      return;
    }
    const info = await verifyWithJwk(check, jwk);
    setResult(info ? { ...info, expired: info.expiresAt.getTime() < Date.now() } : null);
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2px] border-2 border-foreground bg-card p-5">
        <h2 className="font-heading text-2xl">Clave de firma (privada)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vive en este navegador. Con ella se firman las claves Pro. Si la pierdes, las
          claves ya emitidas siguen valiendo, pero para emitir nuevas tendrás que crear
          otra y publicar su pública.
        </p>
        {!priv ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              className="h-12"
              onClick={async () => {
                try {
                  await createSigningKey();
                  setMsg("Clave creada. Publica la pública en la web y guarda una copia de la privada.");
                } catch (caught) {
                  setMsg(caught instanceof Error ? caught.message : "Error.");
                }
              }}
            >
              Crear clave de firma
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              className="h-11"
              onClick={() =>
                downloadText(
                  "luna-oficio-clave-privada.json",
                  JSON.stringify(priv, null, 2),
                  "application/json",
                )
              }
            >
              Descargar copia (privada)
            </Button>
            <Button
              variant="ghost"
              className="h-11 text-destructive"
              onClick={() => {
                if (confirm("¿Quitar la clave privada de este navegador? Solo si tienes copia o vas a crear otra.")) {
                  replaceSigningKey();
                }
              }}
            >
              Quitar de este navegador
            </Button>
          </div>
        )}
        <div className="mt-5 grid gap-1.5">
          <Label htmlFor="import-jwk">Restaurar clave privada (JWK)</Label>
          <Textarea
            id="import-jwk"
            className="font-mono text-xs"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"kty":"EC","crv":"P-256","d":"…","x":"…","y":"…"}'
          />
          <Button
            variant="outline"
            className="h-11 w-fit"
            onClick={() => {
              try {
                importSigningKey(importText);
                setImportText("");
                setMsg("Clave privada restaurada.");
              } catch (caught) {
                setMsg(caught instanceof Error ? caught.message : "Error.");
              }
            }}
          >
            Restaurar
          </Button>
        </div>
        {msg ? <p className="mt-3 text-sm text-muted-foreground">{msg}</p> : null}
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Clave pública (la que va en la web)</h2>
        <ul className="mt-3 text-sm">
          <li className="flex items-center gap-2">
            <span className={`size-3 rounded-full ${hasPublicKey() ? "bg-primary" : "bg-foreground/25"}`} />
            {hasPublicKey() ? "La web tiene una clave pública configurada." : "La web no tiene clave pública: acepta solo la maestra de pruebas."}
          </li>
          {hasPublicKey() && priv ? (
            <li className="mt-1 flex items-center gap-2">
              <span className={`size-3 rounded-full ${matches ? "bg-primary" : "bg-destructive"}`} />
              {matches
                ? "Coincide con tu clave privada: lo que firmes aquí vale en la web."
                : "NO coincide con tu privada. Publica la pública de abajo o restaura la privada correcta."}
            </li>
          ) : null}
        </ul>
        {publicString ? (
          <>
            <Textarea readOnly className="mt-4 font-mono text-xs" value={publicString} rows={4} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                className="h-11"
                onClick={() => void navigator.clipboard.writeText(publicString)}
              >
                Copiar clave pública
              </Button>
            </div>
            <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>
                Hostinger → tu web → Variables de entorno: crea{" "}
                <code>NEXT_PUBLIC_PRO_PUBLIC_KEY</code> con ese JSON tal cual.
              </li>
              <li>Vuelve a desplegar (Redistribuir). La web ya verifica tus claves.</li>
              <li>
                Alternativa: pégalo en <code>PRO_PUBLIC_KEY_MANUAL</code> de{" "}
                <code>src/lib/pro-keys.ts</code> y sube el cambio.
              </li>
            </ol>
          </>
        ) : null}
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Revocaciones</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La web es estática: para que rechace una clave, su serial tiene que ir en{" "}
          <code>NEXT_PUBLIC_PRO_REVOKED</code> (separados por coma) y redesplegar.
        </p>
        <p className="mt-3 text-sm">
          Revocados en tu libro:{" "}
          <code className="rounded-[2px] bg-muted px-2 py-1 font-mono text-xs">
            {revoked.length ? revoked.join(",") : "ninguno"}
          </code>
        </p>
        <p className="mt-2 text-sm">
          Publicados en la web:{" "}
          <code className="rounded-[2px] bg-muted px-2 py-1 font-mono text-xs">
            {revokedSerials().length ? revokedSerials().join(",") : "ninguno"}
          </code>
        </p>
        {revoked.length ? (
          <Button
            variant="outline"
            className="mt-3 h-10"
            onClick={() => void navigator.clipboard.writeText(revoked.join(","))}
          >
            Copiar lista para Hostinger
          </Button>
        ) : null}
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Comprobar una clave</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Un socio dice que no le va: pégala y mira si es válida, de quién es y hasta cuándo.
        </p>
        <Textarea
          className="mt-3 font-mono text-xs"
          value={check}
          onChange={(e) => {
            setCheck(e.target.value);
            setResult("idle");
          }}
          placeholder="LUNA-XXXXXX-20271001-…"
        />
        <Button className="mt-3 h-11" onClick={() => void verify()} disabled={!check.trim()}>
          Verificar
        </Button>
        {result !== "idle" ? (
          result ? (
            <p className="mt-3 rounded-[2px] bg-foreground p-3 text-sm text-background">
              Firma válida · serial <span className="font-mono">{result.serial}</span> · caduca{" "}
              {formatDateEs(result.expires)}
              {result.expired ? " · CADUCADA" : ""}
              {result.revoked ? " · REVOCADA en la web" : ""}
              {(() => {
                const owner = listMembers().find((m) => m.serial === result.serial);
                return owner ? ` · ${owner.name} (${owner.email})` : " · no está en tu libro";
              })()}
            </p>
          ) : (
            <p className="mt-3 rounded-[2px] bg-destructive/10 p-3 text-sm text-destructive">
              Firma no válida con la clave pública disponible.
            </p>
          )
        ) : null}
      </section>
    </div>
  );
}
