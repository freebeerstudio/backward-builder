'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ShareLinkDisplayProps {
  shareCode: string;
}

function ShareLinkDisplay({ shareCode }: ShareLinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/quiz/${shareCode}`
      : `/quiz/${shareCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div>
      {/* Share code display */}
      <div className="mb-4">
        <p className="text-xs font-body text-text-light uppercase tracking-wide mb-1.5">
          Share Code
        </p>
        <p className="text-3xl font-heading font-bold text-forest tracking-widest">
          {shareCode}
        </p>
      </div>

      {/* Share URL with copy button */}
      <div className="flex items-center gap-2 rounded-lg bg-warmwhite border border-border p-2 mb-4">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 bg-transparent text-sm font-body text-text px-2 py-1.5 focus:outline-none select-all"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button variant="primary" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Link
            </>
          )}
        </Button>
      </div>

      <p className="text-xs font-body text-text-light">
        Students can enter this code or use the full URL to access the assessment.
      </p>
    </div>
  );
}

export { ShareLinkDisplay };
