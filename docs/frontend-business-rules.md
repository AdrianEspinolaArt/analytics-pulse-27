# Regras de Negócio do Frontend

Este documento descreve as regras de negócio, contratos e convenções que o frontend do projeto Analytics Pulse deve seguir. O objetivo é centralizar decisões que impactam comportamento, UX, formatação, consumo da API e limites operacionais.

## Visão geral

- Aplicação: Dashboard de analytics (métricas de vendas, conversão, cadastros, recorrência e registros).
- Público alvo: time de produto, desenvolvedores frontend, designers e analistas que consomem o dashboard.
- Localização padrão: pt-BR.

## Contrato dos componentes (inputs / outputs)

- Componentes de apresentação (cards, tabelas, listas) devem ser controlados por props tipadas em TypeScript.
  - Input: dados que representam o DTO da API (ex.: `CadastroMetricsDto`, `SalesChartDto`, `RegistersResponse`).
  - Saída: eventos (callbacks) como `onRetry`, `onExport`, `onPageChange` com tipos explícitos.
- Não fazer fetch direto dentro de componentes de apresentação; use hooks (ex.: `useRegistrations`, `useSales`, `useRegisters`) para separar responsabilidade.

Contrato mínimo de um componente de lista paginada (ex.: `RegistersTable`):
- Props:
  - `data?: RegistersResponse`
  - `isLoading: boolean`
  - `onExport?: (format: 'csv' | 'xlsx') => void`
  - `onPageChange?: (page: number) => void`
- Comportamento esperado:
  - Mostra `Skeleton` quando `isLoading` for true.
  - Mostra estado vazio quando `data.rows` for vazio.
  - Paginação interna deve chamar `onPageChange` quando o usuário muda de página.

## Regras de consumo de API e cache

- Toda chamada a `/analytics/*` deve usar o cliente central `analyticsApi` (arquivo `src/lib/api.ts`).
- Usar React Query via hooks em `src/hooks/use-analytics.ts`.
- Chaves de cache padronizadas (exemplos):
  - `['analytics','registrations', period]`
  - `['analytics','sales', period]`
  - `['analytics','registers', limit, skip]`
- TTL (heurística):
  - Períodos curtos (7d, daily): 60s
  - Períodos médios (15d, 30d): 120s
  - Períodos longos (3m, 6m): 300s
- Revalidação automática: refetch a cada 5 minutos em background (configuração global do React Query), exceto para rotas muito custosas onde o TTL local é menor.
- Quando fizer export (CSV/XLSX) de tabelas grandes, usar paginação no backend (limitar a 500 por запрос por lote) e mostrar progresso ao usuário.

## Formatação e localidade

- Locale padrão: pt-BR
- Datas: `DD/MM/YYYY` para exibição e ISO (UTC/ISO 8601) internamente ao enviar queries ao backend quando necessário.
- Moeda: Real Brasileiro (BRL) com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Números: separador de milhares `.` e decimais `,` conforme PT-BR.
- Exemplo de função utilitária: `formatCurrency(value: number): string` no `src/utils/formatters.ts`.

## Estados da interface (UX)

- Loading: `Skeleton` com animação e placeholders nos gráficos e tabelas.
- Erro: `Alert` informativo com `title`, `description` e botão `Tentar novamente` que dispara `refetch` do hook.
- Vazio: mensagem contextual com ícone e breve orientação (ex.: "Nenhuma venda no período selecionado").
- Sucesso: mostrar dados com transição suave (fade/slide) para evitar saltos bruscos.

## Limites e regras de exportação

- Exportação em massa (Export All) deve ter um limite superior para não travar o navegador:
  - Recomendado: máximo 50k registros por export. Se houver mais, ofertar export via processamento assíncrono no backend.
- Export por lote: buscar em lotes de 500 registros (implementação atual em `RegistersTable`).
- Formatos suportados: CSV, XLSX. Nome dos arquivos: `analytics-registrations-<YYYYMMDD>-<hhmmss>.csv`.

## Paginação e ordenação

- Paginação preferida: server-side. Frontend apenas controla `page` e `pageSize`.
- Padrão de `PAGE_SIZE` na UI: 10 (constante `PAGE_SIZE = 10` no `RegistersTable`).
- Ordenação: enviar parâmetros `sortBy` e `sortDir` para a API. UI deve indicar coluna ordenada e direção.

## Acessibilidade (A11y)

- Todos os elementos interativos devem ter labels acessíveis (`aria-label`, `aria-labelledby`).
- Tabelas: cabeçalho `<th>` semânticos; células com roles apropriadas.
- Contraste: garantir contraste mínimo AA para textos importantes.
- Keyboard: navegação por teclado em componentes interativos (paginador, filtros, botões).

## Privacidade e segurança

- Nunca exibir dados sensíveis completos (ex.: PAN de cartão, CPF) sem mascaramento. Exibir apenas último 4 dígitos quando aplicável.
- Telefone e e-mail podem ser truncados/mascarados em exports públicos se a política exigir.
- Não incluir tokens ou segredos em payloads/URL. Usar cabeçalhos autorizados via cliente `analyticsApi`.

## Testes e critérios de aceitação

- Cada hook em `src/hooks` deve ter testes unitários que validem:
  - keys de cache corretas
  - tratamento de erros e loading
  - transformação mínima dos dados (ex.: formatação de moeda não feita no hook, apenas no componente)
- Componentes principais devem ter testes de snapshot e testes de comportamento (ex.: clicar em "Exportar" chama API corretamente).

Critérios de aceitação para uma história de frontend:
- Unit tests: 1 teste de unidade (happy path) + 1 teste de erro.
- Linter/TypeScript: sem erros.
- Smoke: página principal do dashboard carrega e exibe cards de métricas com dados fictícios.

## Observações sobre performance

- Evitar re-renders desnecessários: usar `React.memo` em componentes puros e `useMemo`/`useCallback` quando apropriado.
- Charts: limitar número de pontos renderizados. Para séries longas, agregar no backend (daily -> weekly) ou usar downsampling.

## Edge cases conhecidos

- Dados parcialmente faltantes (null/undefined) devem ser tratados e mostrados como `—` na UI.
- Timezones: backend retorna datas em UTC; frontend converte para `America/Sao_Paulo` apenas para exibição quando necessário.
- Dados inconsistentes entre endpoints (ex.: total vs soma de páginas): usar `metadata.lastUpdated` para explicar discrepância ao usuário.

## Logs e monitoramento

- Erros de fetch devem ser reportados ao Sentry (ou serviço similar) com contexto (endpoint, params, cacheKey).
- Eventos de export e downloads devem gerar um evento analítico (ex.: `export_initiated`, `export_completed`).

## Perguntas abertas / melhorias futuras

- Export assíncrono via backend com notificação por e-mail/arquivo disponível para download.
- Paginação infinita (infinite scroll) em views com muitos resultados; precisa de avaliação UX.

---

Documento gerado para orientar a implementação frontend. Para atualizações, edite `docs/frontend-business-rules.md` e abra um PR com o motivo e os testes relacionados.
