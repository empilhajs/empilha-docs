import { defineConfig } from 'vitepress';

const sidebar = [
  {
    text: 'Comece',
    collapsed: false,
    items: [
      { text: '01 · Primeiro endpoint', link: '/' },
      { text: '02 · Organize o projeto', link: '/project' },
      { text: '03 · Entenda o Framework', link: '/mental-model' },
    ],
  },
  {
    text: 'Construa o HTTP',
    collapsed: true,
    items: [
      { text: '04 · Controllers e rotas', link: '/routes' },
      { text: '05 · Dados da requisição', link: '/request-data' },
      { text: '06 · Validação', link: '/validation' },
      { text: '07 · Respostas', link: '/responses' },
    ],
  },
  {
    text: 'Organize a aplicação',
    collapsed: true,
    items: [
      { text: '08 · Services e DI', link: '/services' },
      { text: '09 · Escopos e contexto', link: '/scopes' },
      { text: '10 · Erros', link: '/errors' },
      { text: '11 · Middleware', link: '/middleware' },
      { text: '12 · Autenticação', link: '/authentication' },
    ],
  },
  {
    text: 'Persista os dados',
    collapsed: true,
    items: [
      { text: '13 · Queries nomeadas', link: '/sql' },
      { text: '14 · Bindings SQL', link: '/sql-bindings' },
      { text: '15 · Resultados e transações', link: '/transactions' },
      { text: '16 · PostgreSQL', link: '/postgres' },
    ],
  },
  {
    text: 'Publique com confiança',
    collapsed: true,
    items: [
      { text: '17 · Configuração', link: '/configuration' },
      { text: '18 · OpenAPI', link: '/openapi' },
      { text: '19 · Testes', link: '/testing' },
      { text: '20 · Ciclo de vida', link: '/lifecycle' },
    ],
  },
  {
    text: 'Consulte quando precisar',
    collapsed: true,
    items: [
      { text: 'Ordem de execução', link: '/execution-model' },
      { text: 'Decorators', link: '/decorators' },
      { text: 'Plugins', link: '/plugins' },
    ],
  },
];

export default defineConfig({
  lang: 'pt-BR',
  base: '/empilha-docs/',
  title: 'Empilha',
  titleTemplate: ':title · Empilha',
  description:
    'Aprenda Empilha do primeiro endpoint à produção — Bun, TypeScript, SQL e APIs previsíveis.',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#3451b2' }],
    ['meta', { property: 'og:locale', content: 'pt_BR' }],
  ],
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    siteTitle: '🧱 Empilha',
    nav: [
      { text: 'Guia', link: '/', activeMatch: '^/(project|mental-model|routes|request-data|validation|responses)?$' },
      {
        text: 'Tópicos',
        items: [
          { text: 'Fundamentos', link: '/routes' },
          { text: 'Aplicação', link: '/services' },
          { text: 'Banco de dados', link: '/sql' },
          { text: 'Produção', link: '/configuration' },
          { text: 'Referência', link: '/decorators' },
        ],
      },
      { text: 'GitHub', link: 'https://github.com/empilhajs/empilha' },
    ],
    sidebar,
    outline: 'deep',
    outlineTitle: 'Nesta página',
    docFooter: {
      prev: 'Anterior',
      next: 'Próxima etapa',
    },
    returnToTopLabel: 'Voltar ao topo',
    sidebarMenuLabel: 'Trilha de aprendizado',
    darkModeSwitchLabel: 'Aparência',
    lightModeSwitchTitle: 'Usar tema claro',
    darkModeSwitchTitle: 'Usar tema escuro',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Buscar',
            buttonAriaLabel: 'Buscar na documentação',
          },
          modal: {
            displayDetails: 'Exibir detalhes',
            resetButtonTitle: 'Limpar busca',
            backButtonTitle: 'Fechar busca',
            noResultsText: 'Nenhum resultado para',
            footer: {
              selectText: 'selecionar',
              navigateText: 'navegar',
              closeText: 'fechar',
            },
          },
        },
      },
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/empilhajs/empilha' }],
    footer: {
      message: 'Feito para APIs que continuam simples quando crescem.',
      copyright: 'Empilha · MIT',
    },
  },
});
