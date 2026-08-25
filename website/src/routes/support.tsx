import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PolicyPage, PolicySection } from "@/components/site/PolicyPage";

const issueUrl = "https://github.com/AyobamiH/opstruth/issues/new";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support | OpsTruth" },
      {
        name: "description",
        content: "Get help with the OpsTruth ChatGPT plugin and open-source verification tools.",
      },
    ],
  }),
  component: Support,
});

function Support() {
  return (
    <PolicyPage
      eyebrow="Support"
      title="OpsTruth support"
      introduction="Bring the narrow problem and redacted evidence. Do not place credentials, private source code or customer data in a public support request."
    >
      <PolicySection title="Open a support request">
        <p>
          Use GitHub Issues for installation problems, incorrect activation, confusing evidence,
          false positives, missing proof signals and documentation questions.
        </p>
        <a
          href={issueUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open a GitHub issue
          <ExternalLink className="h-4 w-4" />
        </a>
      </PolicySection>

      <PolicySection title="Include enough evidence">
        <ul className="list-disc space-y-2 pl-5">
          <li>The exact prompt or command that produced the problem.</li>
          <li>The ChatGPT or Codex surface and the OpsTruth plugin or CLI version.</li>
          <li>What you expected and what happened instead.</li>
          <li>
            A minimal synthetic fixture or redacted evidence pack when reproduction needs files.
          </li>
          <li>Which checks were skipped, failed or remained unverified.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Sensitive reports">
        <p>
          Do not open a public issue containing a possible live credential, private key, customer
          data or confidential vulnerability detail. Use GitHub's private vulnerability-reporting
          option from the repository Security tab when it is available. Otherwise open a minimal
          public issue asking for a private reporting channel without including the sensitive
          detail.
        </p>
      </PolicySection>

      <PolicySection title="Support boundary">
        <p>
          Community support is provided without a guaranteed response time. OpsTruth can help
          interpret evidence and identify the next safe check. It does not provide emergency
          incident response, credential recovery, deployment operation or a guarantee that a system
          is secure.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
