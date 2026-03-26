export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ruled border-t-forest" />
        <p className="mt-4 text-sm text-pencil">Loading...</p>
      </div>
    </div>
  );
}
