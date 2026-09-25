import type { Components } from "react-markdown"

/**
 * Títulos do markdown rebaixados um nível.
 *
 * O conteúdo do CMS e o README do GitHub entram numa página que já tem o seu
 * h1. Um `#` no texto virava um SEGUNDO h1, às vezes com o mesmo título
 * ("A Cor dos Dados" duas vezes em /livros/[slug]).
 *
 * O react-markdown manda também o `node` da árvore, que não pode cair num
 * elemento do DOM; o resto dos atributos passa (o `align` que o README usa
 * pra centralizar, por exemplo).
 */
export const H1_VIRA_H2: Components = {
  h1: ({ node, ...props }) => {
    void node
    return <h2 {...props} />
  },
}

/** Rebaixa todos os níveis. Pra conteúdo embutido numa seção da página. */
export const TITULOS_UM_NIVEL_ABAIXO: Components = {
  ...H1_VIRA_H2,
  h2: ({ node, ...props }) => {
    void node
    return <h3 {...props} />
  },
  h3: ({ node, ...props }) => {
    void node
    return <h4 {...props} />
  },
  h4: ({ node, ...props }) => {
    void node
    return <h5 {...props} />
  },
  h5: ({ node, ...props }) => {
    void node
    return <h6 {...props} />
  },
}
