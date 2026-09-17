export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-14 border-b border-neutral-100" />
      <div className="sm:max-w-5xl sm:mx-auto sm:px-4">
        <div className="h-12" />
        <div className="sm:grid sm:grid-cols-2 sm:gap-8">
          <div className="w-full aspect-square bg-neutral-100 sm:rounded-2xl" />
          <div className="px-4 pt-5 sm:px-0 sm:pt-0 space-y-3">
            <div className="h-6 w-4/5 rounded bg-neutral-100" />
            <div className="h-8 w-1/3 rounded bg-neutral-100" />
            <div className="h-12 w-full rounded-xl bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
