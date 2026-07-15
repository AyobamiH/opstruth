const videos = {
  main: {
    src: "/demo/opstruth-main-product-video.mp4",
    title: "Product proof demo",
    meta: "56 seconds · 16:9 · sound",
    description:
      "Explains the problem, the read-only safety model, and the current 0.2.0 proof surfaces.",
  },
  tour: {
    src: "/demo/opstruth-product-tour.mp4",
    title: "Product tour",
    meta: "96 seconds · 16:9 · sound",
    description:
      "Walks through the real CLI flow: install, welcome, init, probes, secrets, routes, local checks, CI, Supabase evidence, and JSON output.",
  },
  short: {
    src: "/demo/opstruth-proof-short-vertical.mp4",
    title: "Mobile proof short",
    meta: "26 seconds · 9:16 · sound",
    description:
      "A portrait cut for phone screens and social previews, using the same evidence-first product truth.",
  },
};

const proofPoints = [
  { label: "Package", value: "opstruth@0.2.0" },
  { label: "Release", value: "GitHub v0.2.0" },
  { label: "Video set", value: "Product demo · tour · mobile short" },
  { label: "Proof model", value: "Exact-commit CI + explicit live evidence" },
];

type VideoCardProps = {
  title: string;
  meta: string;
  src: string;
  description: string;
  vertical?: boolean;
  className?: string;
};

function VideoCard({
  title,
  meta,
  src,
  description,
  vertical = false,
  className = "",
}: VideoCardProps) {
  return (
    <article
      className={`min-w-0 overflow-hidden rounded-xl border border-border bg-background shadow-[0_30px_80px_-30px_oklch(0_0_0/0.55)] ${className}`}
    >
      <div className="flex flex-col gap-1 border-b border-border bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{title}</h3>
        <p className="font-mono text-xs text-muted-foreground">{meta}</p>
      </div>
      <video
        className={`block w-full bg-background ${vertical ? "aspect-[9/16] object-cover" : "aspect-video"}`}
        src={src}
        controls
        preload="metadata"
        playsInline
        aria-label={`OpsTruth ${title.toLowerCase()}`}
      >
        <a href={src}>Watch the OpsTruth {title.toLowerCase()}.</a>
      </video>
      <p className="border-t border-border bg-surface/40 px-4 py-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

export function CurrentTruthFilm() {
  return (
    <section id="film" className="border-b border-border/60 bg-surface/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              Current product video set
            </p>
            <h2 className="mt-4 max-w-xl text-2xl font-medium tracking-tight text-foreground md:text-4xl">
              One product truth.
              <span className="block text-muted-foreground">
                Three formats for the screen in front of you.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              The current videos are grounded in the 0.2.0 repo, package, release, website, and CLI
              truth. The landscape cuts explain the product and workflow; the portrait cut is sized
              for mobile screens without squeezing a desktop frame.
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

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.42fr)]">
            <VideoCard {...videos.main} className="min-w-0" />
            <VideoCard
              {...videos.short}
              vertical
              className="order-first mx-auto w-full max-w-[23rem] md:order-none lg:max-w-none"
            />
            <VideoCard {...videos.tour} className="min-w-0 lg:col-span-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
