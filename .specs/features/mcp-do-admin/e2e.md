# MCP do admin e2e (T41)

## Parte 1: MCP de ponta a ponta (11/11/2026)

Dev em `localhost:3001` com a service account; Firestore real. Dois acessos de teste criados direto pela service account (pessoal e único com `jogando` + `criar`), apagados ao fim junto com itens, auditoria e contadores. Roteiro: `C:\Users\joao2\AppData\Local\Temp\claude\0df8f77d74fd5199\314290e1-2e17-4a19-b725-b4cf14a1242e\scratchpad\e2e-mcp.mjs`.

| Passo | Resultado |
| ----- | --------- |
| `initialize` 200 com `instructions` (MCP-04, MCP-15) | ok |
| Resposta sem `mcp-session-id` (stateless) | ok |
| Pessoal lista as 7 ferramentas (MCP-05) | ok |
| `descrever_recurso jogando` | ok |
| `criar` grava no Firestore real (MCP-06) | ok |
| Dado inválido vira `isError` com `VALIDACAO` (MCP-07) | ok |
| `atualizar` parcial | ok |
| `apagar` e `obter` dá `NAO_ENCONTRADO` (MCP-08) | ok |
| Único lista só o concedido, sem `apagar` (UNICO-03) | ok |
| Único chamando `listar` não concedido: `Tool listar not found` | ok |
| Único em outro recurso: `FORA_DO_ESCOPO` (UNICO-04) | ok |
| Único cria no recurso concedido | ok |
| `concluir_tarefa` encerra; próxima chamada 401 (UNICO-05) | ok |
| Revogada dá 401 com a mesma mensagem da inexistente (MCP-11) | ok |
| Auditoria de criar, atualizar, apagar e encerrado (AUDIT-01) | ok |
| Auditoria sem segredo nem dados (AUDIT-03) | ok |
| `ultimoUsoEm` gravado (MCP-13) | ok |
| Claude Code 2.1.319: `claude mcp add --transport http ... --header "Authorization: Bearer ..."` + `claude mcp list` = `✔ Connected` (sem OAuth; o 401 sem `WWW-Authenticate` não atrapalha) | ok |

Resultado: 18/18. Limpeza conferida (sobras 0; registro local do Claude Code removido).

## Parte 2: tela `/admin/mcp` (11/11/2026)

João logado no navegador do Playwright; dev em `localhost:3001`; Firestore real. Capturas em `C:\GFI\playwright-output\mcp-e2e-0{1,2,3,4}-*.png`. Tudo o que foi criado foi apagado pela própria tela.

| Passo | Resultado |
| ----- | --------- |
| Item "MCP" na sidebar, ativo em `/admin/mcp` (ACESSOS-08) | ok |
| Vazio: "Nenhuma chave criada", "Nenhum acesso único criado", "Nenhuma ação ainda", cada um com a ação de criar | ok |
| Gerar chave sem nome: erro do servidor ao lado do campo, "Informe o nome da chave" | ok |
| Contador do nome (8/60) e "Vence em" muda com a validade (30 dias = 11/12/2026) | ok |
| Chave criada: dialog com o comando pronto do Claude Code, aviso "não será mostrada de novo", Copiar vira "Copiado" (CHAVE-01) | ok |
| Ao fechar o dialog o segredo some da página | ok |
| Linha na tabela: nome, prefixo, datas, "Nunca usado", selo Ativo (ACESSOS-01) | ok |
| Uso único: recurso Jogando agora, só Criar, "Apagar" desabilitado; prompt com URL, Bearer, `claude mcp add`, `curl`, escopo e tarefa (UNICO-01) | ok |
| Busca sem resultado: "Nada encontrado para "macbook"" + "Limpar busca" volta a lista | ok |
| Encerrar, Apagar e Revogar pedem confirmação em dialog antes de enviar (ACESSOS-07, UNICO-06) | ok |
| Revogar: selo vira "Revogado" em 675 ms e só então aparece a lixeira; apagar esvazia a tabela (ACESSOS-02, ACESSOS-04) | ok |
| Atividade recente lista criou chave, criou acesso único, encerrou, revogou, apagou acesso (AUDIT-02) | ok |
| Celular (390 px): sem rolagem horizontal, mas a sidebar do admin não recolhe e espreme o conteúdo numa coluna de ~60 px | FALHOU (layout do admin, anterior à feature) |

Observações:
- A causa do celular é o shell compartilhado do admin (`src/app/admin/layout.tsx:27-30` e `AdminSidebar.tsx:107`, `w-64` fixa), igual em todas as páginas do admin; a feature só acrescentou o item MCP na sidebar.
- O botão de fechar dos dialogs tem texto de leitor de tela "Close" em inglês (`src/components/ui/dialog.tsx:89`, padrão do shadcn, anterior à feature).
- Leituras feitas 3 s após as primeiras ações mostravam a tabela antiga: as rotas de revogar e encerrar compilam na primeira chamada do dev. Na segunda rodada o selo atualizou em 675 ms.
