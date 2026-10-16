import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy | OpsTruth" },
      {
        name: "description",
        content:
          "How the OpsTruth website, local tools and support process handle data, with links to the hosted ChatGPT plugin policy.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="Privacy policy"
      introduction="The OpsTruth website and local CLI/skills have different data flows from the separately hosted ChatGPT plugin."
    >
      <PolicySection title="Publisher and scope">
        <p>
          OpsTruth is published by Ayobami Haastrup. This policy covers the
          OpsTruth website, local CLI/skills and support requests submitted
          through the linked GitHub repository. The hosted ChatGPT plugin has
          its own{" "}
          <a href="https://mcp.opstruth.io/privacy" className="underline">
            privacy policy
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection title="Local tools and the hosted ChatGPT plugin">
        <p>
          The local CLI and repository skills do not send prompts, repository
          files, command output or evidence packs to an OpsTruth-operated
          analytics service. The separate hosted ChatGPT plugin provides
          read-only MCP tools and records bounded operational categories such as
          tool outcomes, latency and evidence signals. Its analytics excludes
          prompts, repository subjects, URLs, receipts, graphs, free text and
          user identifiers. Consult its own policy for the hosted service's
          processing and retention details.
        </p>
        <p>
          ChatGPT or Codex may process the files and instructions you
          deliberately provide inside your OpenAI environment. That processing
          is governed by your agreement with OpenAI, not by an
          OpsTruth-controlled service. OpsTruth instructs the agent to stay
          within the declared project boundary, avoid secret-bearing files and
          report secret risks without reproducing values.
        </p>
      </PolicySection>

      <PolicySection title="Website and support data">
        <p>
          The website has no user accounts or contact form. With your
          permission, Google Analytics measures public-page visits, 90% scrolls
          and clicks to fixed OpsTruth destinations such as the npm package,
          GitHub source, GitHub Marketplace, hosted MCP and ChatGPT listing. It
          does not measure installs or activity inside those services. Analytics
          is blocked until you allow it; declining leaves the website usable.
          You can withdraw permission using Analytics preferences on the page.
          Browser Do Not Track and Global Privacy Control signals keep this
          optional measurement disabled.
        </p>
        <p>
          We send fixed event labels, public page paths, the fixed product label
          <code>opstruth</code>, fixed page/interaction categories and
          allowlisted campaign/source labels. We exclude URL queries, fragments,
          prompts, repository contents, form answers, account details and
          referrers. Google Analytics uses cookies after permission is granted
          and processes associated technical data under its own privacy terms.
          Google Signals and advertising personalisation are disabled, the
          property has no Google Ads links, email and query redaction are
          enabled, and event/user retention is configured to two months.
          Withdrawal removes this site's Google Analytics cookies and reloads
          the page to stop its tag.
        </p>
        <p>
          To learn whether public AI/search crawlers can discover OpsTruth, the
          Cloudflare Worker records aggregate counters for fixed crawler
          families and public/machine-readable surfaces such as{" "}
          <code>agents.txt</code>, <code>llms.txt</code>,{" "}
          <code>robots.txt</code> and the sitemap. Those counters contain only a
          fixed crawler category, fixed surface category, product label, request
          method and HTTP status. They do not contain IP addresses, raw
          user-agent strings, query strings or referrers. Cloudflare may
          separately process standard request metadata needed to deliver and
          protect the site under its own terms and retention controls.
        </p>
        <p>
          If you open a GitHub issue, GitHub provides the publisher with the
          profile information and content you choose to submit. That content
          remains on GitHub until it is removed through GitHub's controls or by
          a repository maintainer. Do not include credentials, private source
          code or unredacted evidence in a public issue.
        </p>
      </PolicySection>

      <PolicySection title="Purposes and recipients">
        <p>
          Data deliberately submitted through GitHub is used only to reproduce
          problems, answer support questions, improve documentation and maintain
          OpsTruth. The publisher does not sell personal data or use support
          content for advertising or behavioural profiling.
        </p>
        <p>
          The relevant service providers are OpenAI for the ChatGPT or Codex
          environment, Cloudflare for website delivery, aggregate
          crawler-discovery measurement and the separate hosted plugin, GitHub
          for source hosting and support, and Google for optional website
          analytics after consent.
        </p>
      </PolicySection>

      <PolicySection title="Retention and your choices">
        <p>
          Local CLI/skills do not automatically send usage data to an OpsTruth
          service. Hosted ChatGPT plugin aggregates follow its separate policy.
          Support data follows the GitHub retention described above. You can
          edit or remove your GitHub content using GitHub's controls and can ask
          the maintainer to remove content that you cannot remove yourself.
        </p>
        <p>
          You control which repositories, files and evidence you provide to
          ChatGPT or Codex. Stop the workflow if its requested scope is broader
          than you intended. For privacy questions, use the OpsTruth support
          page.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}