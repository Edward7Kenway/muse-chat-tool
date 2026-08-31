import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";

import { CodeBlock } from "./CodeBlock";

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  const el = node as { props?: { children?: React.ReactNode } };
  return el?.props ? textOf(el.props.children) : "";
}

const components: Components = {
  h1: (p) => <h1 className="mt-6 mb-3 text-xl font-semibold tracking-tight" {...p} />,
  h2: (p) => <h2 className="mt-6 mb-2.5 text-lg font-semibold tracking-tight" {...p} />,
  h3: (p) => <h3 className="mt-5 mb-2 text-base font-semibold" {...p} />,
  p: (p) => <p className="my-3 leading-7" {...p} />,
  ul: (p) => <ul className="my-3 list-disc space-y-1.5 pl-5" {...p} />,
  ol: (p) => <ol className="my-3 list-decimal space-y-1.5 pl-5" {...p} />,
  li: (p) => <li className="leading-7" {...p} />,
  a: (p) => (
    <a
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
      target="_blank"
      rel="noreferrer noopener"
      {...p}
    />
  ),
  blockquote: (p) => (
    <blockquote
      className="my-4 border-l-2 border-primary/40 bg-muted/50 py-1 pl-4 text-muted-foreground italic"
      {...p}
    />
  ),
  hr: () => <hr className="my-6 border-border" />,
  table: (p) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  thead: (p) => <thead className="bg-muted/70" {...p} />,
  th: (p) => (
    <th className="border-b border-border px-3 py-2 text-left font-medium" {...p} />
  ),
  td: (p) => <td className="border-b border-border/60 px-3 py-2 align-top" {...p} />,
  pre: ({ children }) => {
    const child = Array.isArray(children) ? children[0] : children;
    const props = (child as { props?: { className?: string; children?: React.ReactNode } })
      ?.props;
    const language = /language-([\w-]+)/.exec(props?.className ?? "")?.[1] ?? "";
    return (
      <CodeBlock language={language} code={textOf(props?.children)}>
        {children}
      </CodeBlock>
    );
  },
  code: ({ className, children, ...rest }) => {
    const isBlock = (className ?? "").includes("language-") || (className ?? "").includes("hljs");
    if (isBlock) {
      return (
        <code className={`${className ?? ""} font-mono`} {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-[5px] border border-border/70 bg-muted px-[0.35em] py-[0.15em] font-mono text-[0.85em] text-foreground"
        {...rest}
      >
        {children}
      </code>
    );
  },
};

export function Markdown({ content }: { content: string }) {
  const plugins = useMemo(() => ({ remark: [remarkGfm], rehype: [rehypeHighlight] }), []);
  return (
    <div className="text-[15px] text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={plugins.remark} rehypePlugins={plugins.rehype} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
