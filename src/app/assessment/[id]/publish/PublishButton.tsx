'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface PublishButtonProps {
  assessmentId: string;
}

function PublishButton({ assessmentId }: PublishButtonProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setPublishing(true);
    setError(null);

    try {
      const res = await fetch('/api/assessment/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to publish assessment.');
      }

      // Refresh the page to show the published state with share link
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish assessment.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-body">
          {error}
        </div>
      )}
      <Button
        variant="accent"
        size="lg"
        fullWidth
        loading={publishing}
        onClick={handlePublish}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Publish Assessment
      </Button>
    </div>
  );
}

export { PublishButton };
