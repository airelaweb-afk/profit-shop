"use client";

import { useState } from "react";
import { caps } from "@/lib/limits";
import { markJobDone, quotaBlock } from "@/lib/quota";
import { usePro } from "@/lib/use-consent";

export function useJobGuard() {
  const pro = usePro();
  const limit = caps(pro);
  const [upgrade, setUpgrade] = useState("");

  function beforeRun() {
    const blocked = quotaBlock(pro, limit.jobsPerDay);
    if (blocked) {
      setUpgrade(blocked);
      return false;
    }
    return true;
  }

  function afterRun() {
    markJobDone(pro);
  }

  return { pro, limit, upgrade, setUpgrade, beforeRun, afterRun };
}
