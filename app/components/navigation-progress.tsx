export const NavigationProgress = ({ isNavigating }: { isNavigating: boolean }) => (
  <div role="status" aria-live="polite" className="fixed right-5 bottom-5 z-50">
    {isNavigating && (
      <span className="flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink shadow-lg">
        <span
          aria-hidden="true"
          className="size-4 rounded-full border-2 border-line border-t-accent motion-safe:animate-spin"
        />
        ページを読み込んでいます…
      </span>
    )}
  </div>
);
