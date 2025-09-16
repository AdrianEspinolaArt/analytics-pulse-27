# Analytics Dashboard

Um dashboard completo de analytics integrado à API `/analytics`, construído com React, TypeScript, Tailwind CSS e React Query.

## 🚀 Recursos

- **Dashboard Interativo**: Visualização completa de métricas de negócio
- **Gráficos Dinâmicos**: Vendas diárias e mensais com Recharts  
- **Filtros Avançados**: Períodos personalizáveis (7d, 15d, 30d, 3m, 6m)
- **Tabelas Paginadas**: Listagem de registros com navegação
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Estados de Loading**: Skeletons elegantes durante carregamento
- **Tratamento de Erros**: Mensagens amigáveis para usuários

## 📊 Métricas Disponíveis

### Cards Principais
- Total de usuários cadastrados
- Vendas confirmadas e valor total
- Taxa de conversão geral e diária
- Ticket médio e tendências

### Gráficos
- Vendas diárias (últimos 7-30 dias)
- Vendas mensais (últimos 3-6 meses)
- Visualização com tooltips interativos

### Tabelas
- Lista paginada de registros de usuários
- Status de compra e planos
- Streaks de usuários ativos

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Tailwind CSS** para styling
- **React Query** para gerenciamento de estado
- **Recharts** para gráficos
- **Shadcn/UI** para componentes base
- **Lucide React** para ícones

## 🎨 Design System

O projeto utiliza um design system completo com:
- Paleta de cores profissional (azul, verde, laranja, ciano)
- Gradientes sutis para cards de métricas
- Animações de transição suaves
- Tokens semânticos para consistência
- Suporte nativo a dark/light mode

## 📁 Estrutura do Projeto

```
src/
├── components/analytics/          # Componentes do dashboard
│   ├── AnalyticsDashboard.tsx    # Componente principal
│   ├── MetricCard.tsx            # Cards de métricas
│   ├── SalesChart.tsx            # Gráficos de vendas
│   ├── RegistersTable.tsx        # Tabela de registros
│   └── UserStreaksList.tsx       # Lista de streaks
├── hooks/
│   └── use-analytics.ts          # Hooks do React Query
├── lib/
│   └── api.ts                    # Cliente HTTP centralizado
├── types/
│   └── analytics.ts              # Tipos TypeScript
├── utils/
│   └── formatters.ts             # Formatadores PT-BR
└── docs/
    └── analytics-api.md          # Documentação da API
```

## 🔧 Configuração

1. **Variáveis de Ambiente**
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://sua-api.com
   ```

2. **Cache Strategy**
   - Dados de curto prazo (7d): 1 minuto
   - Dados de longo prazo (30d+): 5 minutos
   - Refetch automático a cada 5 minutos

3. **Formatação**
   - Moeda: Real Brasileiro (R$)
   - Datas: Formato DD/MM/AAAA
   - Números: Separadores PT-BR

## 📱 Responsividade

O dashboard é totalmente responsivo:
- **Desktop**: Grid de 4 colunas para métricas principais
- **Tablet**: Grid adaptativo de 2 colunas
- **Mobile**: Layout em coluna única com navegação otimizada

## 🚦 Estados da Aplicação

- **Loading**: Skeletons elegantes com animação
- **Erro**: Alerts informativos com opções de retry
- **Vazio**: Estados vazios com orientações claras
- **Sucesso**: Dados carregados com transições suaves

## 📖 Uso

O dashboard carrega automaticamente ao abrir a aplicação. Use os filtros no cabeçalho para:

1. **Período de Métricas**: 7d, 15d, 30d
2. **Período de Vendas**: Diário (7d-30d) ou Mensal (3m-6m)
3. **Navegação**: Tabelas com paginação integrada

## 🔄 Atualizações

- **Automáticas**: A cada 5 minutos via React Query
- **Manuais**: Refresh da página ou mudança de filtros
- **Cache**: Otimizado para reduzir requisições desnecessárias

## 🎯 Performance

- **React Query**: Cache inteligente e deduplicação
- **Lazy Loading**: Componentes carregados sob demanda
- **Otimização**: Memoização de componentes pesados
- **Bundle**: Code splitting automático

---

Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento frontend.