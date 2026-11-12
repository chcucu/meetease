export default function Loading() {
  return (
    <div className="container-page py-10 md:py-14" role="status" aria-label="页面加载中">
      <div className="animate-pulse">
        <div className="h-3 w-24 bg-paper-deep" />
        <div className="mt-5 h-10 w-[72%] max-w-[360px] bg-paper-deep" />
        <div className="mt-3 h-3 w-[84%] max-w-[460px] bg-paper-deep" />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse bg-surface p-5 md:p-6">
            <div className="h-3 w-16 bg-paper-deep" />
            <div className="mt-4 h-8 w-14 bg-paper-deep" />
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="animate-pulse border border-line bg-surface p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="w-full max-w-md space-y-3">
                <div className="h-4 w-2/3 bg-paper-deep" />
                <div className="h-3 w-full bg-paper-deep" />
                <div className="h-3 w-4/5 bg-paper-deep" />
              </div>
              <div className="h-8 w-20 shrink-0 bg-paper-deep" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
