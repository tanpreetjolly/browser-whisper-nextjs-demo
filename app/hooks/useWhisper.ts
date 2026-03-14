'use client';

import { useEffect, useRef, useState } from 'react';
import type { BrowserWhisper, TranscriptSegment } from 'browser-whisper';

export type Status = 'idle' | 'transcribing' | 'done';

export interface UseWhisperReturn {
  segments: TranscriptSegment[];
  status: Status;
  transcribe: (file: File) => Promise<void>;
}

export function useWhisper(): UseWhisperReturn {
  const whisperRef = useRef<BrowserWhisper | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    import('browser-whisper').then(({ BrowserWhisper }) => {
      whisperRef.current = new BrowserWhisper({ model: 'whisper-base' });
    });
  }, []);

  async function transcribe(file: File) {
    if (!whisperRef.current) return;

    setSegments([]);
    setStatus('transcribing');

    for await (const segment of whisperRef.current.transcribe(file)) {
      setSegments((prev) => [...prev, segment]);
    }

    setStatus('done');
  }

  return { segments, status, transcribe };
}
