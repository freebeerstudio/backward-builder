'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

function QRCodeDisplay({ url, size = 200 }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function generateQR() {
      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#1B4332',  // forest green
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        setDataUrl(qrDataUrl);
        setError(false);
      } catch {
        setError(true);
      }
    }
    generateQR();
  }, [url, size]);

  function handleDownload() {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-code-${url.split('/').pop() || 'assessment'}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-white p-4 text-center">
        <p className="text-sm text-text-light font-body">
          Unable to generate QR code
        </p>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-white p-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-white p-5">
      <img
        src={dataUrl}
        alt={`QR code for ${url}`}
        width={size}
        height={size}
        className="rounded"
      />
      <p className="max-w-[200px] truncate text-center font-mono text-xs text-text-light">
        {url}
      </p>
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-warmwhite px-3 py-1.5 font-heading text-xs font-medium text-forest transition-colors hover:bg-forest hover:text-white"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
    </div>
  );
}

export { QRCodeDisplay };
