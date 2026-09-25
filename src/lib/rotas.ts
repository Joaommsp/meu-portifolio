/**
 * Rotas e âncoras que mais de um módulo precisa montar.
 *
 * Mora fora do `servicos-content.ts` de propósito: a navegação (Header,
 * MobileNav, Footer, CommandPalette) só precisa desta constante, e importar o
 * catálogo de serviços inteiro por ela levaria o texto e os ícones das quatro
 * páginas pro bundle do cliente.
 */

/** O `id` da seção de serviços na home. */
export const ANCORA_SERVICOS = "services"

/**
 * Onde o visitante escolhe a frente: a seção da home. É o destino do
 * breadcrumb das páginas de serviço e do item "Serviços" do menu.
 */
export const ROTA_SERVICOS = `/#${ANCORA_SERVICOS}`
