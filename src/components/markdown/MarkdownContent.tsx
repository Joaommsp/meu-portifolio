import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

type Props = {
  children: string
  className?: string
}

/**
 * Renderiza Markdown com GFM (tabelas, checkboxes, autolinks).
 * Usa @tailwindcss/typography (`prose prose-invert`) pra estilo base.
 * Estilos customizados aplicados via theme overrides nas classes prose-*.
 */
export function MarkdownContent({ children, className }: Props) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none",
        "prose-headings:font-display prose-headings:tracking-tight",
        "prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4",
        "prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-p:text-muted-foreground prose-p:leading-relaxed",
        "prose-strong:text-foreground",
        "prose-a:text-brand prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto",
        "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        "prose-li:marker:text-brand",
        "prose-blockquote:border-l-brand prose-blockquote:text-foreground/80",
        "prose-hr:border-border",
        "prose-img:rounded-xl prose-img:border prose-img:border-border",
        "prose-table:block prose-table:overflow-x-auto prose-table:border-collapse prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2",
        "prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
