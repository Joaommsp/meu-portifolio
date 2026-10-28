import { TECH_COLORS, TECH_ICONS } from "@/components/icons/tech-icons"
import { SKILL_GROUPS } from "@/lib/skills-content"
import { SECAO_SOBRE, TITULO_SOBRE } from "@/components/sobre/secao"

/**
 * Stack do /sobre: uma linha por grupo, com a ferramenta em chip. Os cards
 * com texto e nível de cada uma ocupavam quase duas mil linhas de pixel pra
 * dizer o que um chip diz.
 */
export function StackEmLinhas() {
  return (
    <section className={SECAO_SOBRE}>
      <h2 className={TITULO_SOBRE}>
        Com o que eu construo
      </h2>

      <div className="mt-8 border-t border-border">
        {SKILL_GROUPS.map(({ label, skills }) => (
          <div
            key={label}
            className="grid gap-3 border-b border-border py-4 md:grid-cols-[180px_1fr] md:gap-5"
          >
            <div>
              <h3 className="font-semibold">{label}</h3>
              <p className="text-xs text-muted-foreground">
                {skills.length} {skills.length === 1 ? "ferramenta" : "ferramentas"}
              </p>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {skills.map(({ name, icon, color }) => {
                const Icone = icon ? TECH_ICONS[icon] : null
                return (
                  <li
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-lg vidro-leve px-2.5 py-1 text-[13px] font-medium"
                  >
                    {Icone ? (
                      <Icone colored className="size-3.5" />
                    ) : (
                      <span
                        aria-hidden
                        className="size-2 rounded-[2px]"
                        style={{ background: color ?? (icon ? TECH_COLORS[icon] : "var(--brand)") }}
                      />
                    )}
                    {name}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
