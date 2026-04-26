/**
 * Shared page header used on every route. Renders an accent "eyebrow"
 * with a leading inline rule, followed by a large action title.
 */
export const PageHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <header className="flex flex-col gap-3 pb-8 lg:pb-12">
    <div className="flex items-center">
      <span aria-hidden="true" className="mr-3 h-px w-10 bg-primary" />
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </span>
    </div>
    <h1 className="max-w-[800px] text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
      {title}
    </h1>
  </header>
);

export default PageHeader;