'use client';

import { useEffect, useRef } from 'react';
import { useWhisper, type Status } from '../hooks/useWhisper';
import { useCopy } from '../hooks/useCopy';
import type { TranscriptSegment } from 'browser-whisper';

// ── helpers ──────────────────────────────────────────────────────────────────

function toTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function toPlainText(segments: TranscriptSegment[]): string {
  return segments.map((s) => `[${toTimestamp(s.start)}] ${s.text}`).join('\n');
}

function toJson(segments: TranscriptSegment[]): string {
  return JSON.stringify(
    segments.map((s) => ({ timestamp: toTimestamp(s.start), text: s.text })),
    null,
    2
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function FileInput({ onFile }: { onFile: (file: File) => void }) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="mb-8">
      <p className="mb-2 text-xs text-zinc-400 tracking-widest">$ load_audio</p>
      <label className="flex cursor-pointer items-center gap-3 border border-zinc-200 bg-white px-5 py-3.5 text-sm text-zinc-500 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600">
        <span className="text-indigo-400">▶</span>
        <span>select audio or video file</span>
        <input type="file" accept="audio/*,video/*" className="hidden" onChange={handleChange} />
      </label>
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  const label =
    status === 'transcribing' ? 'transcribing...' :
    status === 'done'         ? 'done' :
                                'idle';

  return (
    <div className="mb-8 flex items-center gap-2 text-xs tracking-widest text-zinc-400">
      <span>status</span>
      <span className="text-zinc-300">/</span>
      <span className={
        status === 'transcribing' ? 'animate-pulse text-indigo-500' :
        status === 'done'         ? 'text-zinc-800' :
                                    'text-zinc-400'
      }>
        {label}
      </span>
      {status === 'transcribing' && (
        <span className="inline-block h-3.5 w-1.5 animate-pulse bg-indigo-400" />
      )}
    </div>
  );
}

function TranscriptPanel({ segments }: { segments: TranscriptSegment[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopy();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments]);

  return (
    <div className="border border-zinc-200 bg-white shadow-sm">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
        <span className="text-xs text-zinc-400 tracking-widest">
          // output &mdash; {segments.length} segment{segments.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => copy('plain', toPlainText(segments))}
            className="border border-zinc-200 px-3 py-1 text-xs text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            {copied === 'plain' ? 'copied!' : 'copy text'}
          </button>
          <button
            onClick={() => copy('json', toJson(segments))}
            className="border border-zinc-200 px-3 py-1 text-xs text-zinc-500 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            {copied === 'json' ? 'copied!' : 'copy json'}
          </button>
        </div>
      </div>

      {/* Segments */}
      <div className="h-80 overflow-y-auto divide-y divide-zinc-50 px-5 py-2">
        {segments.map((s, i) => (
          <div key={i} className="flex gap-5 py-2.5 text-sm">
            <span className="w-10 shrink-0 pt-px text-xs text-indigo-400">
              {toTimestamp(s.start)}
            </span>
            <span className="leading-relaxed text-zinc-700">{s.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function Transcriber() {
  const { segments, status, transcribe } = useWhisper();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-14 font-mono text-zinc-800">
      <div className="mx-auto max-w-2xl">

        <div className="mb-10 border-b border-zinc-200 pb-5">
          <p className="text-xs text-indigo-400 tracking-widest">// browser-whisper — local inference</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
            browser-whisper<span className="text-indigo-500">_</span>
          </h1>
        </div>

        <FileInput onFile={transcribe} />
        <StatusLine status={status} />
        {segments.length > 0 && <TranscriptPanel segments={segments} />}

      </div>
    </div>
  );
}
