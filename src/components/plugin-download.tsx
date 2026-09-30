"use client";

import { Download } from "lucide-react";
import { ProGate } from "@/components/pro-gate";
import { Button } from "@/components/ui/button";

export const PLUGIN_ZIP = "/downloads/luna-oficio-webp.zip";
export const PLUGIN_VERSION = "1.0.0";

export function PluginDownload() {
  return (
      <ProGate pitch="El plugin va incluido en Pro (7 €/mes o 40 €/año), junto con WebP en lote y la marca de agua. Lo instalas en los WordPress que administres.">
        <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
          <p className="text-sm tracking-wide text-primary uppercase">Descarga · Pro</p>
          <h2 className="mt-2 font-heading text-3xl tracking-tight">
            luna-oficio-webp.zip
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Versión {PLUGIN_VERSION}. WordPress 5.8 o superior, PHP 7.4 o
            superior. Sin claves de licencia ni llamadas a nuestros servidores:
            el plugin funciona solo en tu WordPress.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 w-full px-6 sm:w-auto"
              render={<a href={PLUGIN_ZIP} download="luna-oficio-webp.zip" />}
              nativeButton={false}
            >
              <Download />
              Descargar el plugin
            </Button>
          </div>
          <ol className="mt-6 grid gap-2 text-sm text-muted-foreground">
            <li>1. En WordPress: Plugins → Añadir nuevo → Subir plugin → elige el zip → Instalar → Activar.</li>
            <li>2. Ve a Medios → WebP y comprueba que pone «Puede escribir WebP: Sí».</li>
            <li>3. Haz una copia de seguridad y pulsa «Convertir pendientes». A partir de ahí, lo que subas sale en WebP solo.</li>
          </ol>
        </div>
      </ProGate>
  );
}
