/**
 * Conteúdo da seção "Formação" da página /sobre.
 *
 * Fonte: seção "Licenças e certificados" do LinkedIn + credencial da UniRios.
 * Edita aqui sempre que concluir um curso novo.
 *
 * `credentialUrl` é opcional de propósito: card sem URL não vira link
 * (melhor do que apontar pra uma página que não existe).
 */

export type Degree = {
  title: string
  institution: string
  /** Rótulo curto exibido no card. */
  issued: string
  credentialId: string
  credentialUrl?: string
  /** Hash do registro em blockchain, encurtado pra exibição. */
  registry?: string
  skills: readonly string[]
}

export type Course = {
  title: string
  issuer: string
  issued: string
  /** Ordena a trilha (mais recente primeiro). Formato ISO. */
  date: string
  credentialId?: string
  credentialUrl?: string
  tags: readonly string[]
}

export const DEGREE: Degree = {
  title: "Bacharelado em Sistemas de Informação",
  institution: "Centro Universitário do Rio São Francisco · UniRios",
  issued: "ago 2026",
  credentialId: "109664",
  credentialUrl: "https://view.pok.tech/c/9e80b81b-1441-472b-bbd7-0120ec370042",
  registry: "0x3641…d669",
  skills: [
    "Análise de requisitos",
    "Arquitetura de dados",
    "Gestão de projetos",
    "Governança e segurança",
  ],
}

export const COURSES: readonly Course[] = [
  {
    title: "Formação UX Designer",
    issuer: "DIO",
    issued: "jul 2024",
    date: "2024-07-01",
    credentialId: "1CHKNZSB",
    credentialUrl: "https://www.dio.me/certificate/1CHKNZSB/share",
    tags: ["UX", "Pesquisa"],
  },
  {
    title: "Formação React Developer",
    issuer: "DIO",
    issued: "jul 2024",
    date: "2024-07-01",
    credentialId: "VIZJACAJ",
    credentialUrl: "https://www.dio.me/certificate/VIZJACAJ/share",
    tags: ["React.js", "Next.js"],
  },
  {
    title: "Pro Figma · UI Design",
    issuer: "Udemy",
    issued: "jul 2024",
    date: "2024-07-01",
    credentialId: "UC-fa1cd93f",
    credentialUrl:
      "https://www.udemy.com/certificate/UC-fa1cd93f-6d03-4e11-b384-d60bd8999fb6/",
    tags: ["Figma", "UI"],
  },
  {
    // Sem credentialUrl: no LinkedIn este certificado está com o mesmo código
    // do React (VIZJACAJ), que aponta pra outra credencial.
    title: "Formação CSS Developer",
    issuer: "DIO",
    issued: "jul 2024",
    date: "2024-07-01",
    tags: ["CSS", "Flexbox"],
  },
  {
    title: "Fundamentos de Lógica de Programação",
    issuer: "iTalents",
    issued: "mai 2024",
    date: "2024-05-01",
    credentialId: "485de37a",
    tags: ["Lógica", "Python"],
  },
  {
    title: "Formação Lógica de Programação",
    issuer: "DIO",
    issued: "abr 2024",
    date: "2024-04-01",
    credentialId: "DW0XE1LL",
    credentialUrl: "https://www.dio.me/certificate/DW0XE1LL/share",
    tags: ["Lógica", "Algoritmos"],
  },
  {
    title: "Programação Orientada a Objetos",
    issuer: "Code Plus",
    issued: "mar 2024",
    date: "2024-03-01",
    tags: ["POO", "Java"],
  },
  {
    title: "SQL com MySQL",
    issuer: "Hora de Codar",
    issued: "jan 2024",
    date: "2024-01-01",
    credentialId: "UC-c4263d31",
    credentialUrl:
      "https://www.udemy.com/certificate/UC-c4263d31-2132-4202-a6f9-e8ff766ee681/",
    tags: ["MySQL", "SQL"],
  },
  {
    title: "Formação HTML Web Developer",
    issuer: "DIO",
    issued: "dez 2023",
    date: "2023-12-01",
    credentialId: "FF0AFA7B",
    credentialUrl: "https://www.dio.me/certificate/FF0AFA7B/share",
    tags: ["HTML", "Web"],
  },
] as const

export const COURSE_COUNT = COURSES.length
