/**
 * A página como uma folha por cima do rodapé: cantos arredondados embaixo e
 * sombra. O rodapé fica atrás (sticky no desktop) e aparece quando a folha
 * sobe no fim da rolagem.
 *
 * Fundo opaco obrigatório. Sem padding embaixo: a borda da folha de conteúdo
 * aparecia como uma linha cortando a página antes da curva. `overflow-clip`
 * (não `hidden`) recorta na curva sem quebrar os `sticky` lá dentro.
 *
 * Toda página que monta o `Footer` passa por aqui (layout público e 404);
 * sem a folha, o rodapé sobe por cima do conteúdo.
 */
export function FolhaDaPagina({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex flex-1 flex-col overflow-clip rounded-b-[2rem] bg-background shadow-[0_24px_50px_-10px_oklch(0.2_0.02_330/0.35)] md:rounded-b-[3rem]">
      {children}
    </div>
  )
}
