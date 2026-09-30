"use client";

import { useRef, useState } from "react";
import { Camera, FileUp, FolderOpen } from "lucide-react";
import { useCoarsePointer } from "@/lib/use-coarse-pointer";

type FileDropProps = {
  accept: string;
  multiple?: boolean;
  busy?: boolean;
  dropTitle: string;
  tapTitle: string;
  hint: string;
  busyHint?: string;
  cta: string;
  cameraCta?: string;
  /** Adds a second button that opens the folder picker (all files inside are passed to onFiles). */
  folderCta?: string;
  onFiles: (files: File[]) => void;
};

export function FileDrop({
  accept,
  multiple,
  busy,
  dropTitle,
  tapTitle,
  hint,
  busyHint = "Un momento. Un archivo grande tarda.",
  cta,
  cameraCta,
  folderCta,
  onFiles,
}: FileDropProps) {
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const folder = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const coarse = useCoarsePointer();

  function take(list: File[]) {
    if (list.length === 0) return;
    onFiles(list);
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          take([...(event.target.files ?? [])]);
          event.target.value = "";
        }}
      />
      {cameraCta ? (
        <input
          ref={camera}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            take([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
      ) : null}
      {folderCta ? (
        <input
          ref={folder}
          type="file"
          multiple
          className="sr-only"
          // Non-standard but supported by every desktop browser; React types omit it.
          {...{ webkitdirectory: "" }}
          onChange={(event) => {
            take([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          take([...event.dataTransfer.files]);
        }}
        className={`flex min-h-44 w-full flex-col items-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors sm:min-h-52 sm:px-6 sm:py-12 ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-foreground/20 bg-card hover:border-primary/50 hover:bg-muted/40"
        }`}
      >
        <FileUp className="size-10 text-primary" />
        <p className="mt-4 font-heading text-2xl leading-tight sm:text-3xl">
          {busy ? "Abriendo…" : coarse ? tapTitle : dropTitle}
        </p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {busy ? busyHint : hint}
        </p>
        {!busy ? (
          <span className="mt-6 inline-flex h-12 min-w-[12rem] items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground">
            {cta}
          </span>
        ) : null}
      </button>
      {folderCta && !busy ? (
        <button
          type="button"
          className="mt-3 hidden h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium sm:flex"
          onClick={() => folder.current?.click()}
        >
          <FolderOpen className="size-4" />
          {folderCta}
        </button>
      ) : null}
      {cameraCta && !busy ? (
        <button
          type="button"
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium sm:hidden"
          onClick={() => camera.current?.click()}
        >
          <Camera className="size-4" />
          {cameraCta}
        </button>
      ) : null}
    </div>
  );
}
