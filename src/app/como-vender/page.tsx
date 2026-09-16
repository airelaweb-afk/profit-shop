"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComoVenderRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/como-funciona/");
  }, [router]);
  return (
    <p className="px-4 py-10 text-sm text-muted-foreground">
      Redirigiendo…
    </p>
  );
}
