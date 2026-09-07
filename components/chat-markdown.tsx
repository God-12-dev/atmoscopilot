"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders AI chat markdown (bold, italics, headings, lists, links, code
 * blocks) instead of showing raw "**" characters. Kept intentionally
 * compact/chat-bubble-sized rather than a full article layout, and themed
 * with the app's existing CSS variables so it matches dark/light mode
 * automatically.
 */
export function ChatMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("chat-markdown text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => <h1 className="mt-2 mb-1.5 text-base font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-2 mb-1.5 text-[0.95rem] font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-2 mb-1 text-sm font-semibold">{children}</h3>,
          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-primary hover:opacity-80">
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <pre className="mb-2 overflow-x-auto rounded-lg bg-muted/70 p-3 text-xs last:mb-0">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code className="rounded bg-muted/70 px-1 py-0.5 text-[0.85em]" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-primary/40 pl-3 italic text-muted-foreground last:mb-0">{children}</blockquote>
          ),
          hr: () => <hr className="my-2 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
