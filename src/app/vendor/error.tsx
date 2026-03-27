'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-[#F57224] text-white rounded-lg">Try again</button>
    </div>
  );
}
