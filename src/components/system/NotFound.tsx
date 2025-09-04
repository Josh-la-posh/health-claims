export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <a href="/" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground">Go home</a>
      </div>
    </div>
  );
}
