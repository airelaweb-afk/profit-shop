"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onFileSaved } from "@/lib/bookmark-prompt";
import { useLocale } from "@/lib/locale-context";
import { useConsent } from "@/lib/use-consent";

const KEY = "luna-bookmark-prompt";
const SESSION = "luna-bookmark-shown";

type Memory = { done: boolean; saves: number; seen: number };

function read(): Memory {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { done: false, saves: 0, seen: 0 };
    const parsed = JSON.parse(raw) as Partial<Memory>;
    return {
      done: Boolean(parsed.done),
      saves: Number(parsed.saves) || 0,
      seen: Number(parsed.seen) || 0,
    };
  } catch {
    return { done: false, saves: 0, seen: 0 };
  }
}

function write(memory: Memory) {
  localStorage.setItem(KEY, JSON.stringify(memory));
}

function alreadyInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function BookmarkPrompt() {
  const consent = useConsent();
  const english = useLocale() === "en";
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return onFileSaved(() => {
      if (alreadyInstalled()) return;
      const memory = read();
      if (memory.done) return;
      if (sessionStorage.getItem(SESSION)) return;
      memory.saves += 1;
      const due = memory.seen === 0 || memory.saves >= memory.seen + 3;
      if (!due) {
        write(memory);
        return;
      }
      memory.seen = memory.saves;
      write(memory);
      sessionStorage.setItem(SESSION, "1");
      setPending(true);
    });
  }, []);

  if (!pending || !consent.decidedAt || pathname.startsWith("/admin")) return null;

  function keep() {
    const memory = read();
    memory.done = true;
    write(memory);
    setPending(false);
  }

  return (
    <div className="no-print fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-50 xl:inset-x-0 xl:bottom-6 xl:px-4">
      <div className="mx-auto flex max-w-lg flex-col gap-4 border-2 border-accent bg-foreground p-4 text-background shadow-[6px_6px_0_0_#ff4b1a]">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-accent text-accent-foreground">
            <Bookmark className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl leading-tight">
              {english ? "Save it for next time" : "Guárdala para la próxima vez"}
            </p>
            <p className="mt-1 text-sm text-background/75">
              {english ? (
                <>
                  On a computer, press{" "}
                  <kbd className="border border-accent px-1.5 py-0.5 font-mono text-xs text-accent">
                    Ctrl + D
                  </kbd>{" "}
                  (on a Mac, ⌘ + D). On a phone, open the browser menu and tap the
                  star. If you use it often, Add to Home Screen keeps the icon.
                </>
              ) : (
                <>
                  En el ordenador pulsa{" "}
                  <kbd className="border border-accent px-1.5 py-0.5 font-mono text-xs text-accent">
                    Ctrl + D
                  </kbd>{" "}
                  (en Mac, ⌘ + D). En el móvil, abre el menú del navegador y pulsa
                  la estrella. Si la usas a menudo, Añadir a pantalla de inicio la
                  deja con su icono.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="h-10 px-3 text-sm text-background/70 hover:text-accent"
            onClick={() => setPending(false)}
          >
            {english ? "Not now" : "Ahora no"}
          </button>
          <Button type="button" className="h-10" onClick={keep}>
            {english ? "I've saved it" : "Ya la he guardado"}
          </Button>
        </div>
      </div>
    </div>
  );
}

