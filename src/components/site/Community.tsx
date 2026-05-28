import { CommandBlock } from "./CommandBlock";

export function Community() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="rounded-xl border border-border bg-surface p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Community testing
              </div>
              <h2 className="mt-3 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                Bring messy repos. File false positives. Request probes.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                opstruth is local, open, and inspectable. The probe catalogue grows with real
                operational pain — not with what sounds impressive on a homepage.
              </p>
            </div>

            <div className="space-y-3">
              <CommandBlock command="opstruth" />
              <CommandBlock command="opstruth --evidence ./out.md" prompt="$" />
              <p className="font-mono text-[11px] text-muted-foreground">
                runs locally · writes one file · changes nothing
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
