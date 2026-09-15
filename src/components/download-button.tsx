"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadSlug } from "@/lib/downloads";

export function DownloadButton({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <Button
      variant="outline"
      className="h-10 justify-start px-3"
      onClick={() => {
        downloadSlug(slug);
        setDone(true);
      }}
    >
      <Download />
      {done ? "Descargado" : label}
    </Button>
  );
}
