/** Marca, na sessão, que a abertura já rodou: navegar não repete. */
export const CHAVE_ABERTURA = "portfolio:abertura-vista"

/*
  Roda antes da hidratação, inline no layout: quem já viu a abertura nesta
  sessão e quem pede menos movimento não veem o anel nem por um quadro.
*/
export const SCRIPT_ABERTURA = `try{if(sessionStorage.getItem("${CHAVE_ABERTURA}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("sem-abertura")}catch(e){}`
