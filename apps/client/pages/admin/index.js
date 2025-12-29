export default function BlankPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <img className="h-6 w-6" src="/logo.svg" alt="logo" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Admin Console
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              Welcome to Peppermint
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage teams, tickets, and settings while keeping the support
              experience smooth.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Manage Knowledge Base",
            detail: "Publish help articles and keep customers informed.",
          },
          {
            title: "Audit Activity",
            detail: "Review logs and security events in one place.",
          },
          {
            title: "Update Settings",
            detail: "Tune email, authentication, and webhook integrations.",
          },
          {
            title: "Invite Your Team",
            detail: "Add agents, assign roles, and organize workflows.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
