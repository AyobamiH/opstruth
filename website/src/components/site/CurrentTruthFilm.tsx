const currentTruthFilmSrc = "/demo/opstruth-current-runtime-truth.mp4";

const proofPoints = [
  { label: "Package", value: "opstruth@0.1.3" },
  { label: "Release", value: "GitHub v0.1.3" },
  { label: "Production", value: "Cloudflare HTTP 200" },
  { label: "Catalogue", value: "30 safe read-only probes" },
];

export function CurrentTruthFilm() {
  return (
    <section id="film" className="border-b border-border/60 bg-surface/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Current product proof demo
            </p>
            <h2 className="mt-4 max-w-xl text-2xl font-medium tracking-tight text-foreground md:text-4xl">
              The hero loop shows the surface.
              <span className="block text-muted-foreground">
                This demo shows the system underneath.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              OpsTruth was rebuilt through the same operational truth loops it now gives to other
              projects: repo truth, package truth, release truth, production truth, and proof gaps.
              What can we prove?
            </p>
            <dl className="mt-8 grid min-w-0 grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              {proofPoints.map((point) => (
                <div key={point.label} className="min-w-0 bg-surface px-4 py-3">
                  <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {point.label}
                  </dt>
                  <dd className="mt-1 break-words font-mono text-sm leading-6 text-foreground">
                    {point.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-background shadow-[0_30px_80px_-30px_oklch(0_0_0/0.6)]">
            <div className="flex flex-col gap-1 border-b border-border bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Runtime truth walkthrough
              </p>
              <p className="font-mono text-xs text-muted-foreground">56-second product demo</p>
            </div>
            <video
              className="block aspect-video w-full bg-background"
              src={currentTruthFilmSrc}
              controls
              preload="metadata"
              playsInline
              aria-label="OpsTruth runtime truth product demo"
            >
              <a href={currentTruthFilmSrc}>Watch the OpsTruth runtime truth product demo.</a>
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
