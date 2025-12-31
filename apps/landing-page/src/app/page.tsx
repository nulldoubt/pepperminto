import Link from "next/link";

const highlights = [
  {
    title: "Unified command center",
    description:
      "Keep tickets, notes, and knowledge base updates in one calm workspace. No context switching required.",
  },
  {
    title: "Public knowledge base",
    description:
      "Publish verified answers instantly so customers resolve issues before they even open a ticket.",
  },
  {
    title: "Role-first access",
    description:
      "Define what every teammate can do with clean, auditable permissions and workflows.",
  },
];

const metrics = [
  { label: "Default roles ready", value: "RBAC" },
  { label: "Knowledge base ready", value: "Public" },
  { label: "Deploy options", value: "Docker" },
];

const steps = [
  {
    title: "Connect your channels",
    description: "Route email, portal, and internal requests into one inbox.",
  },
  {
    title: "Triage with confidence",
    description: "Use focused views, filters, and statuses to keep momentum.",
  },
  {
    title: "Publish trusted answers",
    description: "Turn resolved issues into public knowledge base articles.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900/90 text-xl text-emerald-100">
            🍵
          </div>
          <div>
            <p className="text-lg font-semibold">Pepperminto</p>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-900/70">
              Helpdesk OS
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-emerald-900/80 md:flex">
          <Link href="#features" className="hover:text-emerald-900">
            Features
          </Link>
          <Link href="#fork" className="hover:text-emerald-900">
            Fork
          </Link>
          <Link href="#workflow" className="hover:text-emerald-900">
            Workflow
          </Link>
          <Link href="#faq" className="hover:text-emerald-900">
            FAQ
          </Link>
          <Link
            href="https://github.com/nulldoubt/Pepperminto"
            className="hover:text-emerald-900"
          >
            GitHub
          </Link>
        </nav>
        <div className="hidden md:flex">
          <Link
            href="https://docs.pepperminto.sh"
            className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Read the docs
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-900/70">
              Fork of Peppermint · 100% FOSS
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-emerald-950 md:text-5xl">
              A calm, modern helpdesk for teams who care about clarity.
            </h1>
            <p className="text-base text-emerald-900/80 md:text-lg" style={{ fontFamily: "var(--font-body)" }}>
              Pepperminto is a community-driven fork of Peppermint, built to help businesses run support operations with
              predictable workflows, a polished admin dashboard, and a public knowledge base that stays in sync with every
              resolved ticket.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="https://github.com/nulldoubt/Pepperminto"
                className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-soft transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                View the repo
              </Link>
              <Link
                href="https://docs.pepperminto.sh"
                className="inline-flex items-center justify-center rounded-full border border-emerald-900/30 px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                Get deployment steps
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-emerald-900/10 bg-[linear-gradient(135deg,#0f172a,rgba(15,118,110,0.15))] p-8 text-emerald-50 shadow-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
              Production ready
            </p>
            <h2 className="mt-4 text-2xl font-semibold">Support cockpit</h2>
            <p className="mt-3 text-sm text-emerald-100/80" style={{ fontFamily: "var(--font-body)" }}>
              Assign tickets, track queues, and publish fixes as knowledge base entries without leaving the dashboard.
            </p>
            <div className="mt-6 grid gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between rounded-2xl bg-emerald-900/30 px-4 py-3"
                >
                  <span className="text-sm text-emerald-50/80">{metric.label}</span>
                  <span className="text-lg font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="space-y-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-3xl font-semibold text-emerald-950">Built for the calmest support teams.</h2>
            <p
              className="max-w-xl text-sm text-emerald-900/70"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Everything ships with accessible, polished UI and a clean information architecture so the team can move fast.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-emerald-900/10 bg-[var(--surface)] p-6 shadow-soft"
              >
                <h3 className="text-lg font-semibold text-emerald-950">{item.title}</h3>
                <p
                  className="mt-3 text-sm text-emerald-900/70"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="fork" className="py-10">
          <div className="rounded-3xl border border-emerald-900/10 bg-[var(--surface)] p-8 shadow-soft">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-900/60">
                  Fork details
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-emerald-950">
                  Built on Peppermint, maintained by the community.
                </h2>
                <p className="mt-3 text-sm text-emerald-900/70" style={{ fontFamily: "var(--font-body)" }}>
                  Pepperminto is a transparent, FOSS fork of Peppermint with a refined UI, public knowledge base, and
                  modern deployment workflow. We keep the core mission intact while improving the experience for teams
                  who depend on it every day.
                </p>
              </div>
              <Link
                href="https://github.com/Peppermint-Lab/peppermint"
                className="inline-flex items-center justify-center rounded-full border border-emerald-900/30 px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                View original project
              </Link>
            </div>
          </div>
        </section>

        <section id="workflow" className="grid gap-8 rounded-3xl border border-emerald-900/10 bg-[var(--surface-strong)] p-8 shadow-soft md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900/60">
              Workflow
            </p>
            <h2 className="text-3xl font-semibold text-emerald-950">
              Every ticket becomes a knowledge asset.
            </h2>
            <p className="text-sm text-emerald-900/70" style={{ fontFamily: "var(--font-body)" }}>
              The admin dashboard, notes, and knowledge base editor stay in sync. Resolve issues once, then publish once.
            </p>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-emerald-900/10 bg-[var(--surface)] p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 text-emerald-50">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-emerald-950">
                      {step.title}
                    </h3>
                    <p
                      className="text-sm text-emerald-900/70"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-900/10 bg-white/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-900/60">
              Accessibility first
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-emerald-950">
              Keyboard-friendly, readable, and calm.
            </h3>
            <p className="mt-4 text-sm text-emerald-900/70" style={{ fontFamily: "var(--font-body)" }}>
              The UI follows shadcn accessibility conventions: visible focus states, high contrast, and scalable typography.
            </p>
            <div className="mt-6 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4">
              <p className="text-sm font-semibold text-emerald-900">Audit-ready permissions</p>
              <p className="text-xs text-emerald-900/60" style={{ fontFamily: "var(--font-body)" }}>
                Assign roles and see exactly who has access to each workflow.
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="py-12">
          <div className="rounded-3xl border border-emerald-900/10 bg-[var(--surface)] p-8 shadow-soft">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-900/60">
                  FAQ
                </p>
            <h2 className="mt-3 text-2xl font-semibold text-emerald-950">
              Ready to roll Pepperminto out?
            </h2>
              </div>
              <Link
                href="https://docs.pepperminto.sh"
                className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                Read the docs
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-base font-semibold text-emerald-950">
                  Does Pepperminto replace our current helpdesk?
                </h3>
                <p className="mt-2 text-sm text-emerald-900/70" style={{ fontFamily: "var(--font-body)" }}>
                  Yes. Pepperminto is a full-stack helpdesk with authentication, ticketing, and a public knowledge base.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-950">
                  Can I self-host and customize it?
                </h3>
                <p className="mt-2 text-sm text-emerald-900/70" style={{ fontFamily: "var(--font-body)" }}>
                  Absolutely. Pepperminto is open-source and ships as a multi-app monorepo with Docker support.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-900/10 bg-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-emerald-900/70" style={{ fontFamily: "var(--font-body)" }}>
            © 2025 Pepperminto. Built in the open for teams who value clarity.
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-emerald-900/70">
            <Link href="https://github.com/nulldoubt/Pepperminto" className="hover:text-emerald-900">
              GitHub
            </Link>
            <Link href="https://docs.pepperminto.sh" className="hover:text-emerald-900">
              Documentation
            </Link>
            <Link href="https://pepperminto.sh" className="hover:text-emerald-900">
              Website
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
