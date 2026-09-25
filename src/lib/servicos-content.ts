import {
  Compass,
  Globe,
  LayoutTemplate,
  Network,
  Palette,
  PanelsTopLeft,
  PenTool,
  Ruler,
  ScanEye,
  ShieldCheck,
  Smartphone,
  Store,
  Table2,
  Users,
  Wrench,
  WifiOff,
} from "lucide-react"
import type * as React from "react"

import type { ProjectCategory } from "@/types/project"

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

/** Efeito animado do card, reaproveitado como fundo do hero da página. */
export type EfeitoServico = "ondas" | "feixes" | "meteoros" | "blobs"

export type Servico = {
  slug: string
  /** Índice, o mesmo do card na home. */
  numero: string
  /** Nome da frente, o que o cliente procura. */
  categoria: string
  /** Versão curta, pro rail vertical e pro breadcrumb. */
  rotulo: string
  /** Título do hero, quebrado pra uma parte sair no accent. */
  titulo: { antes: string; destaque: string; depois?: string }
  /** Parágrafo do hero. */
  resumo: string
  /** Frase do card na home, a promessa curta. */
  promessa: string
  /** O que cabe dentro da frente (as tags do card). */
  tags: readonly string[]
  /**
   * Fundo do hero. `sites` tem vídeo 3D; as outras herdam o efeito do card,
   * que é o que liga visualmente o card clicado à página que abre.
   */
  efeito: EfeitoServico
  /**
   * Vídeo do hero. `opacidade` existe pra vídeo com cor e tipografia própria,
   * que atrás do título da página compete com a leitura. Sem ela, cheio.
   */
  video?: { src: string; poster: string; opacidade?: number }
  entregaveis: readonly { icone: IconComponent; titulo: string; texto: string }[]
  processo: readonly { numero: string; titulo: string; texto: string }[]
  escopo: { incluso: readonly string[]; tambem: readonly string[] }
  faq: readonly { pergunta: string; resposta: string }[]
  /**
   * Prova da frente. `projetos` nomeia os slugs exatos quando a categoria é
   * ampla demais; sem ele, vale o filtro por `categorias`.
   */
  provas: { categorias: readonly ProjectCategory[]; projetos?: readonly string[] }
}

/**
 * Conteúdo das quatro páginas de serviço.
 *
 * Mora em `lib/` como o `now-content.ts`: é texto que muda sem deploy de
 * lógica, não dado de banco.
 *
 * SEM PRAZO E SEM PREÇO fora da seção de dúvidas, de propósito. Número de
 * prazo ou de valor numa página de venda é promessa que alguém vai cobrar, e
 * quem fecha isso é a conversa.
 */
export const SERVICOS: readonly Servico[] = [
  {
    slug: "sites",
    numero: "01",
    categoria: "Desenvolvimento de sites",
    rotulo: "Sites",
    titulo: { antes: "Seu site construído", destaque: "peça por peça" },
    resumo:
      "Landing page, site institucional ou redesign. Projeto a interface antes de escrever a primeira linha e construo em Next.js, do protótipo até o site no ar.",
    promessa: "Construo do zero e cuido do seu site",
    tags: ["Landing page", "Redesign", "Institucional", "Blog"],
    efeito: "ondas",
    video: {
      src: "/videos/site-montando.mp4",
      poster: "/videos/site-montando.jpg",
      opacidade: 0.45,
    },
    entregaveis: [
      {
        icone: Globe,
        titulo: "Site no ar, no seu domínio",
        texto: "Publicado, com HTTPS e domínio apontado.",
      },
      {
        icone: PenTool,
        titulo: "Design feito pro seu caso",
        texto: "Protótipo aprovado antes do código.",
      },
      {
        icone: PanelsTopLeft,
        titulo: "Painel Gerencial",
        texto:
          "Trocar e atualizar elementos do site, como textos, fotos e preços sem precisar me chamar.",
      },
      {
        icone: Wrench,
        titulo: "Manutenções e atualizações",
        texto: "Correções, ajustes de conteúdo e melhorias.",
      },
    ],
    processo: [
      {
        numero: "01",
        titulo: "Conversa",
        texto:
          "Entender o negócio e quem compra, não receber uma lista de páginas. Saio daqui com o escopo escrito.",
      },
      {
        numero: "02",
        titulo: "Protótipo",
        texto:
          "Navegável, no celular e no desktop. Você clica e percorre o site inteiro antes de existir uma linha de código.",
      },
      {
        numero: "03",
        titulo: "Construção",
        texto:
          "Next.js e TypeScript, com um link de preview que atualiza a cada mudança. Você acompanha, não espera.",
      },
      {
        numero: "04",
        titulo: "No ar, e depois",
        texto:
          "Deploy, domínio apontado e uma chamada mostrando como mexer no painel.",
      },
    ],
    escopo: {
      incluso: [
        "Protótipo, aprovado antes do código",
        "Responsivo de verdade, testado no celular",
        "Redação de texto e copy",
        "SEO técnico: títulos, meta, sitemap, dados estruturados",
        "Performance e acessibilidade auditadas antes de entregar",
        "Deploy, domínio apontado e repositório no seu nome",
      ],
      tambem: ["Identidade visual do zero", "Tráfego pago"],
    },
    faq: [
      {
        pergunta: "Quanto tempo leva?",
        resposta:
          "Landing page fica pronta em 48h. Site institucional com banco de dados leva acima de 2 semanas.",
      },
      {
        pergunta: "Quem paga domínio e hospedagem?",
        resposta:
          "Configuro tudo, mas a conta é sua: se um dia a gente não trabalhar mais junto, o site continua seu.",
      },
      {
        pergunta: "Consigo editar sozinho depois?",
        resposta:
          "Depende do seu pedido, se vai conter um painel gerencial ou não.",
      },
      {
        pergunta: "E se eu não gostar do layout?",
        resposta:
          "É pra isso que o protótipo vem antes. Mudar tela no protótipo custa uma tarde; mudar depois de construído custa a etapa inteira. Só passo pro código com o seu aval.",
      },
      {
        pergunta: "Você trabalha com WordPress?",
        resposta:
          "Não. Construo em Next.js, que é mais rápido e não depende de plugin que quebra em atualização. Se você já tem um WordPress, dá pra migrar.",
      },
      {
        pergunta: "Dá pra fazer só o design?",
        resposta:
          "Sim, é possível. Entrego o protótipo pronto pro seu time construir.",
      },
    ],
    provas: { categorias: ["web"], projetos: ["keylla-melo"] },
  },

  {
    slug: "sistemas",
    numero: "02",
    categoria: "Desenvolvimento de sistemas",
    rotulo: "Sistemas",
    titulo: { antes: "O sistema que sua operação", destaque: "usa todo dia" },
    resumo:
      "Painel de gestão, dashboard e relatório. Trabalho com dado que precisa ser lido rápido: KPI, gráfico e tabela que informam em vez de virar ruído.",
    promessa: "Sistema de gestão feito pro uso diário",
    tags: ["Dashboard", "Painel admin", "Relatórios", "API"],
    efeito: "feixes",
    video: {
      src: "/videos/painel-montando.mp4",
      poster: "/videos/painel-montando.jpg",
      opacidade: 0.45,
    },
    entregaveis: [
      {
        icone: LayoutTemplate,
        titulo: "Painel sob medida",
        texto:
          "Construído em cima do seu processo, não de um template genérico que você tem que contornar.",
      },
      {
        icone: Table2,
        titulo: "Número que se lê de relance",
        texto:
          "KPI, gráfico e tabela pensados pra decisão. Quem abre entende sem manual.",
      },
      {
        icone: Users,
        titulo: "Acesso por perfil",
        texto:
          "Cada pessoa vê o que é dela. Permissão é regra do sistema, não combinado verbal.",
      },
      {
        icone: Network,
        titulo: "Conversa com o que você já usa",
        texto: "API pra integrar com os sistemas que já rodam na sua operação.",
      },
    ],
    processo: [
      {
        numero: "01",
        titulo: "Levantamento",
        texto:
          "Sento com quem vai usar, não só com quem contrata. É onde aparece a regra que ninguém tinha escrito.",
      },
      {
        numero: "02",
        titulo: "Telas críticas",
        texto:
          "Protótipo das três ou quatro telas que concentram o trabalho do dia. Se essas funcionam, o resto segue.",
      },
      {
        numero: "03",
        titulo: "Construção em módulos",
        texto:
          "Entrego por parte, em ambiente de homologação. Você usa e corrige o rumo antes do módulo seguinte.",
      },
      {
        numero: "04",
        titulo: "Implantação e treino",
        texto:
          "Vai pro ar com acompanhamento, e a equipe é treinada. Sistema que ninguém sabe usar não foi entregue.",
      },
    ],
    escopo: {
      incluso: [
        "Modelagem dos dados e das regras de negócio",
        "Perfis de acesso e controle de permissão",
        "Relatórios com exportação",
        "Ambiente de homologação separado do de produção",
        "Treino da equipe e documentação de uso",
        "Manutenção e evolução depois da implantação",
      ],
      tambem: ["Migração da base que você já tem", "Identidade visual do zero"],
    },
    faq: [
      {
        pergunta: "Roda no navegador ou precisa instalar?",
        resposta:
          "No navegador, em qualquer computador da empresa. Sem instalação, sem máquina específica, e funciona no celular pro que faz sentido usar no celular.",
      },
      {
        pergunta: "Onde meus dados ficam?",
        resposta:
          "Em banco na nuvem, com backup automático, na conta que fica no seu nome. Você nunca depende de eu estar disponível pra acessar o que é seu.",
      },
      {
        pergunta: "Dá pra integrar com o sistema que já uso?",
        resposta:
          "Se ele tiver API, sim. Se não tiver, dá pra fazer importação por planilha. O que não dá é raspar tela de sistema fechado, porque quebra na primeira atualização deles.",
      },
      {
        pergunta: "E quando a operação crescer?",
        resposta:
          "O banco e a hospedagem escalam sem reescrever nada. O que costuma mudar é regra de negócio, e é por isso que entrego em módulos.",
      },
      {
        pergunta: "Preciso parar o que uso hoje pra implantar?",
        resposta:
          "Não. A implantação roda em paralelo, e a virada só acontece quando a equipe já está treinada no novo.",
      },
      {
        pergunta: "Quem dá suporte depois?",
        resposta:
          "Eu. E se um dia o seu time quiser assumir, assume: o código está documentado e é seu.",
      },
    ],
    provas: { categorias: ["web", "api"] },
  },

  {
    slug: "aplicativos",
    numero: "03",
    categoria: "Desenvolvimento de aplicativos",
    rotulo: "Apps",
    titulo: { antes: "Um app para", destaque: "Android e iOS" },
    resumo:
      "React Native: um código, as duas lojas. Do protótipo à publicação, incluindo a papelada de conta de desenvolvedor e o processo de revisão.",
    promessa: "Android e iOS a partir de um código só",
    tags: ["React Native", "iOS", "Android", "Publicação nas lojas"],
    efeito: "meteoros",
    video: {
      src: "/videos/app-montando.mp4",
      poster: "/videos/app-montando.jpg",
      opacidade: 0.45,
    },
    entregaveis: [
      {
        icone: Store,
        titulo: "Publicado nas duas lojas",
        texto:
          "App Store e Google Play, com ficha, print e descrição prontos. Acompanho a revisão até aprovar.",
      },
      {
        icone: Smartphone,
        titulo: "Um código, duas plataformas",
        texto:
          "React Native. Correção feita uma vez chega nos dois lados no mesmo dia.",
      },
      {
        icone: WifiOff,
        titulo: "Notificação e uso offline",
        texto:
          "Push quando faz sentido, e as telas que dá pra usar sem sinal continuam funcionando.",
      },
      {
        icone: ShieldCheck,
        titulo: "Contas no seu nome",
        texto:
          "As contas de desenvolvedor são da sua empresa. O app nunca fica preso a mim.",
      },
    ],
    processo: [
      {
        numero: "01",
        titulo: "Conversa",
        texto:
          "O que o app faz que o site não faria. Essa pergunta economiza muito dinheiro logo no começo.",
      },
      {
        numero: "02",
        titulo: "Protótipo no celular",
        texto:
          "Navegável, aberto no seu próprio aparelho e não só na tela do computador. Gesto e tamanho de toque mudam tudo.",
      },
      {
        numero: "03",
        titulo: "Build de teste",
        texto:
          "TestFlight no iOS e faixa interna no Android. Você e sua equipe instalam e usam de verdade antes de publicar.",
      },
      {
        numero: "04",
        titulo: "Publicação",
        texto:
          "Envio às lojas, resposta à revisão e acompanhamento até o app aparecer na busca.",
      },
    ],
    escopo: {
      incluso: [
        "Protótipo navegável testado no aparelho",
        "Build assinado pra iOS e Android",
        "Ícone, splash e as artes da ficha da loja",
        "Publicação nas duas lojas e resposta à revisão",
        "Política de privacidade e formulário de dados das lojas",
        "Manutenção e atualização depois de publicado",
      ],
      tambem: ["Identidade visual da marca", "Campanha de instalação"],
    },
    faq: [
      {
        pergunta: "Precisa de Mac pra publicar no iOS?",
        resposta:
          "Do seu lado, não. O build assinado da Apple é problema meu. Você só precisa da conta de desenvolvedor no nome da empresa.",
      },
      {
        pergunta: "E se a Apple reprovar?",
        resposta:
          "Reprovação na primeira tentativa é comum e faz parte do processo. Respondo à revisão, ajusto o que foi apontado e reenvio.",
      },
      {
        pergunta: "Meu site não poderia virar app?",
        resposta:
          "Empacotar site em app costuma ser reprovado pela Apple e entrega uma experiência pior. Se a ideia é só ter ícone na tela, um PWA resolve e sai bem mais barato. Eu falo isso antes de vender o app.",
      },
      {
        pergunta: "Funciona sem internet?",
        resposta:
          "As telas que fazem sentido offline, sim: consulta e leitura. O que depende de dado ao vivo mostra um estado claro em vez de travar.",
      },
      {
        pergunta: "Quem paga as contas das lojas?",
        resposta:
          "Você, e ficam no seu nome. Faço o cadastro junto com você logo no começo, porque a aprovação da conta também demora.",
      },
      {
        pergunta: "E as atualizações depois?",
        resposta:
          "Correção eu resolvo. Funcionalidade nova é combinada à parte, e cada envio passa de novo pela revisão das lojas.",
      },
    ],
    provas: { categorias: ["mobile"] },
  },

  {
    slug: "design",
    numero: "04",
    categoria: "Design de software",
    rotulo: "Design",
    titulo: { antes: "A interface desenhada", destaque: "antes do código" },
    resumo:
      "UI/UX, design system e protótipo navegável. Entrego pronto pro seu time construir, ou construo eu mesmo, que é o que faço no resto do tempo.",
    promessa: "Desenho a interface antes da primeira linha",
    tags: ["UI/UX", "Design system", "Protótipo", "Figma"],
    efeito: "blobs",
    entregaveis: [
      {
        icone: Compass,
        titulo: "Protótipo navegável",
        texto:
          "Clicável no celular e no desktop. Dá pra testar com gente de verdade antes de gastar uma hora de desenvolvimento.",
      },
      {
        icone: Palette,
        titulo: "Design system em tokens",
        texto:
          "Cor, espaçamento e tipografia como token, não como print. É o que faz a segunda tela sair no mesmo padrão da primeira.",
      },
      {
        icone: Ruler,
        titulo: "Handoff que o dev entende",
        texto:
          "Espaçamento, estado e comportamento especificados. Escrevo como quem vai implementar, porque também implemento.",
      },
      {
        icone: ScanEye,
        titulo: "Revisão do que já existe",
        texto:
          "Se o produto já está no ar, aponto o que atrapalha e priorizo por impacto, sem exigir refazer tudo.",
      },
    ],
    processo: [
      {
        numero: "01",
        titulo: "Entender o problema",
        texto:
          "Quem usa, em que situação, e o que dá errado hoje. Design que começa pelo layout resolve a tela errada.",
      },
      {
        numero: "02",
        titulo: "Fluxo e wireframe",
        texto:
          "O caminho antes da beleza. Aqui é barato mudar de ideia, e é onde a maioria das decisões boas acontece.",
      },
      {
        numero: "03",
        titulo: "Interface e sistema",
        texto:
          "Telas finais em cima de um design system, para o que vier depois já nascer consistente.",
      },
      {
        numero: "04",
        titulo: "Handoff",
        texto:
          "Entrega ao time de desenvolvimento, com uma chamada pra tirar dúvida. Fico disponível durante a implementação.",
      },
    ],
    escopo: {
      incluso: [
        "Análise do produto atual e de concorrentes diretos",
        "Fluxos e wireframes das jornadas principais",
        "Protótipo clicável, no desktop e no celular",
        "Design system: tokens, componentes e estados",
        "Especificação de espaçamento, estado e comportamento",
        "Revisão de contraste e acessibilidade",
      ],
      tambem: ["Implementação em código", "Identidade visual completa"],
    },
    faq: [
      {
        pergunta: "Você entrega só o protótipo?",
        resposta:
          "Entrego. E como também desenvolvo, o arquivo sai pensado pra ser construído: componente, token e estado no lugar, não só telas bonitas.",
      },
      {
        pergunta: "Meu time de dev consegue implementar?",
        resposta:
          "É o objetivo. A especificação usa a linguagem de quem programa, e fico disponível durante a implementação pra tirar dúvida.",
      },
      {
        pergunta: "Preciso ter um produto pronto?",
        resposta:
          "Não. Dá pra começar da ideia, e nesse caso o wireframe vale mais que a tela final: é o que evita construir a coisa errada.",
      },
      {
        pergunta: "Quantas rodadas de ajuste?",
        resposta:
          "As que couberem no que foi combinado, e elas acontecem no wireframe, onde mudar é barato.",
      },
      {
        pergunta: "Faz design de marca também?",
        resposta:
          "Sim, faço design de marca. E como também desenho a interface, a identidade já nasce pensada pra tela.",
      },
      {
        pergunta: "E se eu quiser que você construa depois?",
        resposta:
          "Melhor ainda: o design já nasce sabendo como vai ser implementado. Aí o serviço vira desenvolvimento de sites ou de sistemas.",
      },
    ],
    provas: { categorias: ["design"] },
  },
]

export function acharServico(slug: string): Servico | undefined {
  return SERVICOS.find((s) => s.slug === slug)
}

/** Caminho da página de um serviço. Fonte única, não montar à mão. */
export function rotaServico(slug: string): string {
  return `/servicos/${slug}`
}
