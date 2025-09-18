// ErrorPage.tsx
import { Link } from "react-router-dom";

export default function ErrorPage({
  error,
  stack,
  onReset,
}: {
  error?: Error;
  stack?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-600">{error?.message ?? "Unknown error"}</p>

      {import.meta.env.DEV && stack && (
        <pre className="bg-gray-100 p-2 text-xs text-left max-w-lg overflow-x-auto">
          {stack}
        </pre>
      )}

      <div className="flex gap-4">
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Try Again
          </button>
        )}
        <Link to="/" className="text-blue-600 underline">
          Go Home
        </Link>
      </div>
    </div>
  );
}
