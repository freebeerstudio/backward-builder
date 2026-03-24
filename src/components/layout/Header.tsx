import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1024px] items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="text-xl font-heading font-bold text-forest hover:text-forest-light">
          Backward Builder
        </Link>
        <Link href="/create">
          <Button variant="accent" size="sm">
            Create Assessment
          </Button>
        </Link>
      </div>
    </header>
  );
}

export { Header };
