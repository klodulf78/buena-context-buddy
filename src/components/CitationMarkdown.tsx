import { Fragment, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type CitationMap = Record<string, string>;

const CITATION_REGEX = /\[\^([a-zA-Z0-9_-]+)\]/g;

const CitationPill = ({ id, source }: { id: string; source?: string }) => (
  <Tooltip delayDuration={120}>
    <TooltipTrigger asChild>
      <button
        type="button"
        className="mx-0.5 inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 align-middle font-mono text-[0.72em] font-medium leading-none text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {id}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-sm font-mono text-xs leading-relaxed">
      {source ?? id}
    </TooltipContent>
  </Tooltip>
);

/**
 * Walks a string and replaces [^key] tokens with <CitationPill> nodes,
 * returning a ReactNode array safe to drop inside a <p>, <li>, etc.
 */
function renderWithCitations(text: string, citations: CitationMap): ReactNode[] {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CITATION_REGEX.lastIndex = 0;
  while ((match = CITATION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push(text.slice(lastIndex, match.index));
    }
    const key = match[1];
    out.push(
      <CitationPill key={`${key}-${match.index}`} id={key} source={citations[key]} />,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out;
}

/**
 * Recursively transforms ReactMarkdown's children, replacing citation tokens
 * inside any text node with pill components.
 */
function transformChildren(children: ReactNode, citations: CitationMap): ReactNode {
  if (typeof children === "string") {
    if (!CITATION_REGEX.test(children)) return children;
    return <Fragment>{renderWithCitations(children, citations)}</Fragment>;
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <Fragment key={i}>{transformChildren(child, citations)}</Fragment>
    ));
  }
  return children;
}

export const CitationMarkdown = ({
  children,
  citations,
}: {
  children: string;
  citations: CitationMap;
}) => {
  // Strip any literal footnote definitions like "[^bank]: foo" so they don't
  // render as orphan text — they're surfaced through tooltips instead.
  const cleaned = children
    .split("\n")
    .filter((line) => !/^\s*\[\^[a-zA-Z0-9_-]+\]:/.test(line))
    .join("\n");

  const wrap = (Tag: keyof JSX.IntrinsicElements) =>
    ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) => {
      const TagAny = Tag as unknown as React.ElementType;
      return <TagAny {...props}>{transformChildren(children, citations)}</TagAny>;
    };

  const components: Components = {
    p: wrap("p"),
    li: wrap("li"),
    strong: wrap("strong"),
    em: wrap("em"),
    h1: wrap("h1"),
    h2: wrap("h2"),
    h3: wrap("h3"),
    h4: wrap("h4"),
  };

  return <ReactMarkdown components={components}>{cleaned}</ReactMarkdown>;
};

export default CitationMarkdown;