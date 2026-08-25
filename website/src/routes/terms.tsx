import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service | OpsTruth" },
      {
        name: "description",
        content: "Terms for using the OpsTruth skills-only ChatGPT plugin and open-source tools.",
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title="Terms of service"
      introduction="These terms set the boundary for using OpsTruth as an evidence tool. OpsTruth helps verify claims, but it does not guarantee that software is secure or production-ready."
    >
      <PolicySection title="The service">
        <p>
          OpsTruth is published by Ayobami Haastrup. The ChatGPT plugin packages skills that guide
          evidence-led repository inspection, validation and reporting. It does not include an
          OpsTruth-operated MCP server, deployment service or production write capability.
        </p>
        <p>
          The open-source OpsTruth software is also available under the MIT licence in its public
          GitHub repository. Where the MIT licence applies to source code, it remains controlling.
        </p>
      </PolicySection>

      <PolicySection title="Authorised use">
        <p>
          Use OpsTruth only with repositories, files, local services and systems you own or are
          authorised to inspect. You are responsible for choosing the scope and ensuring that any
          commands permitted by the surrounding ChatGPT or Codex environment are appropriate for
          that project.
        </p>
        <p>
          Do not use OpsTruth to obtain credentials, expose private data, bypass access controls or
          inspect third-party systems without permission.
        </p>
      </PolicySection>

      <PolicySection title="Evidence limitations">
        <p>
          An OpsTruth result reflects only the evidence available in the declared scope at the time
          of the check. A passing command does not prove production behaviour. A static review does
          not prove runtime state. Skipped or unavailable checks remain proof gaps.
        </p>
        <p>
          OpsTruth is not a substitute for a security audit, legal review, professional assurance
          engagement or the user's own release judgement. Do not represent an incomplete evidence
          pack as a guarantee of safety, correctness or availability.
        </p>
      </PolicySection>

      <PolicySection title="No production authority">
        <p>
          The plugin must stop before deployment, publication, database mutation, credential
          rotation, infrastructure changes, queue or job triggers, or other production writes. Those
          actions require a separate workflow and explicit human authorisation.
        </p>
      </PolicySection>

      <PolicySection title="Availability and liability">
        <p>
          OpsTruth is provided on an "as is" and "as available" basis without warranties of
          uninterrupted availability, completeness, fitness for a particular purpose or error-free
          operation. To the extent permitted by law, the publisher is not liable for indirect or
          consequential losses arising from reliance on incomplete evidence or use outside the
          stated boundaries.
        </p>
        <p>
          Nothing in these terms limits rights or liabilities that cannot legally be limited. These
          terms are governed by the laws of England and Wales, without limiting mandatory consumer
          protections that apply where you live.
        </p>
      </PolicySection>

      <PolicySection title="Changes and contact">
        <p>
          Material changes will be reflected on this page with a revised effective date. Continued
          use after a change means you accept the updated terms. Questions can be raised through the
          OpsTruth support page.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
