import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy | OpsTruth" },
      {
        name: "description",
        content:
          "How the OpsTruth skills-only ChatGPT plugin, website and support process handle data.",
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
      introduction="OpsTruth is designed to minimise data collection. Its public ChatGPT plugin is a skills-only evidence workflow, not a hosted repository-analysis service."
    >
      <PolicySection title="Publisher and scope">
        <p>
          OpsTruth is published by Ayobami Haastrup. This policy covers the OpsTruth skills-only
          plugin for ChatGPT and Codex, the OpsTruth website and support requests submitted through
          the linked GitHub repository.
        </p>
      </PolicySection>

      <PolicySection title="Plugin data">
        <p>
          The plugin has no OpsTruth-operated MCP server, account system, analytics endpoint or
          remote repository store. The publisher does not receive or retain your prompts, repository
          files, command output or evidence packs through the plugin.
        </p>
        <p>
          ChatGPT or Codex may process the files and instructions you deliberately provide inside
          your OpenAI environment. That processing is governed by your agreement with OpenAI, not by
          an OpsTruth-controlled service. OpsTruth instructs the agent to stay within the declared
          project boundary, avoid secret-bearing files and report secret risks without reproducing
          values.
        </p>
      </PolicySection>

      <PolicySection title="Website and support data">
        <p>
          The website has no user accounts, contact form or first-party behavioural analytics.
          Cloudflare may process standard request metadata needed to deliver and protect the site
          under its own terms and retention controls.
        </p>
        <p>
          If you open a GitHub issue, GitHub provides the publisher with the profile information and
          content you choose to submit. That content remains on GitHub until it is removed through
          GitHub's controls or by a repository maintainer. Do not include credentials, private
          source code or unredacted evidence in a public issue.
        </p>
      </PolicySection>

      <PolicySection title="Purposes and recipients">
        <p>
          Data deliberately submitted through GitHub is used only to reproduce problems, answer
          support questions, improve documentation and maintain OpsTruth. The publisher does not
          sell personal data or use support content for advertising or behavioural profiling.
        </p>
        <p>
          The relevant service providers are OpenAI for the ChatGPT or Codex environment, Cloudflare
          for website delivery and GitHub for source hosting and support. OpsTruth does not add
          another recipient through a publisher-controlled plugin server.
        </p>
      </PolicySection>

      <PolicySection title="Retention and your choices">
        <p>
          The publisher retains no plugin-use data because the skills-only plugin sends none to an
          OpsTruth service. Support data follows the GitHub retention described above. You can edit
          or remove your GitHub content using GitHub's controls and can ask the maintainer to remove
          content that you cannot remove yourself.
        </p>
        <p>
          You control which repositories, files and evidence you provide to ChatGPT or Codex. Stop
          the workflow if its requested scope is broader than you intended. For privacy questions,
          use the OpsTruth support page.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
