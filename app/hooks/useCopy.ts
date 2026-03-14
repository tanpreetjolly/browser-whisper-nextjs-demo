'use client';

import { useState } from 'react';

export function useCopy(resetAfterMs = 1500) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(label: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), resetAfterMs);
    });
  }

  return { copied, copy };
}
