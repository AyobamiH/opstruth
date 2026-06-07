const currentTruthFilmSrc = "/demo/opstruth-current-runtime-truth.mp4";

const proofPoints = [
  { label: "Package", value: "opstruth@0.1.2" },
  { label: "Release", value: "GitHub v0.1.2" },
  { label: "Production", value: "Cloudflare HTTP 200" },
  { label: "Catalogue", value: "30 safe read-only probes" },
];

export function CurrentTruthFilm() {
  return (
    <section id="film" className="border-b border-border/60 bg-surface/20">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Current product proof film
            </p>
            <h2 className="mt-4 max-w-xl text-2xl font-medium tracking-tight text-foreground md:text-4xl">
              The hero loop shows the surface.
              <span className="block text-muted-foreground">
                This film shows the system underneath.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              opstruth was rebuilt through the same operational truth loops it now gives to other
              projects: repo truth, package truth, release truth, production truth, and proof gaps.
              What can we prove?
            </p>
            <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              {proofPoints.map((point) => (
                <div key={point.label} className="min-w-0 bg-surface px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {point.label}
                  </dt>
                  <dd className="mt-1 break-words font-mono text-sm text-foreground">
                    {point.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_30px_80px_-30px_oklch(0_0_0/0.6)]">
            <div className="flex flex-col gap-1 border-b border-border bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Runtime truth film
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                /demo/opstruth-current-runtime-truth.mp4
              </p>
            </div>
            <video
              className="block aspect-video w-full"
              src={currentTruthFilmSrc}
              controls
              preload="metadata"
              playsInline
              aria-label="opstruth current runtime truth product film"
            >
              <a href={currentTruthFilmSrc}>
                Watch the opstruth current runtime truth product film.
              </a>
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
