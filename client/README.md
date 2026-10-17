# Frontend | Português (Brasil) / English (United States)

## Português (Brasil)

### Visão geral

O frontend do Flexa é uma aplicação React com TypeScript e Vite. Ele permite criar e gerenciar apps internos baseados em telas e componentes de formulário, visualizar os dados enviados e disponibilizar apps publicados por um link público.

### Tecnologias principais

- React 18 e TypeScript
- Vite 7
- Wouter para roteamento
- TanStack Query para cache e sincronização de dados
- Supabase Auth para autenticação
- Axios para comunicação com a API
- Tailwind CSS, Radix UI e componentes locais em `src/components/ui`
- React Hook Form para formulários dinâmicos

### Requisitos

- Node.js e npm
- API do Flexa disponível em `http://localhost:5000` durante o desenvolvimento local
- Projeto Supabase configurado para autenticação

### Configuração local

Na raiz do repositório, crie ou atualize o arquivo `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
# Opcional. No desenvolvimento, por padrão a API usa a origem do Vite.
VITE_API_BASE_URL=http://localhost:5000
```

Use somente a chave pública/anon do Supabase no frontend. Nunca exponha uma chave `service_role` em variáveis `VITE_`.

Instale as dependências a partir da raiz do repositório:

```bash
npm install
```

Inicie o backend e o frontend em terminais separados, também a partir da raiz:

```bash
npm run dev
```

```bash
npm run dev:frontend
```

O Vite estará disponível em `http://localhost:3000`. A configuração do Vite encaminha chamadas `/api` para `http://localhost:5000`. O frontend precisa da API e das credenciais Supabase para que autenticação e operações de dados funcionem.

### Scripts úteis

| Comando | Descrição |
| --- | --- |
| `npm run dev:frontend` | Inicia somente o servidor de desenvolvimento Vite. |
| `npm run dev` | Inicia o servidor da API em modo de desenvolvimento. |
| `npm run check` | Executa a verificação de tipos TypeScript do projeto. |
| `npm run build` | Gera os artefatos de produção do cliente e do servidor. |

### Estrutura do cliente

```text
client/
├── index.html
└── src/
    ├── api/          # Serviços HTTP da aplicação
    ├── components/   # Componentes compartilhados e biblioteca de UI
    ├── hooks/        # Autenticação e hooks de dados com React Query
    ├── lib/          # Cliente Supabase, configuração do React Query e utilitários
    ├── pages/        # Páginas e fluxos principais
    └── types/        # Tipos dos DTOs da API
```

### Páginas e rotas

- `/` — landing page para visitantes e dashboard para usuários autenticados.
- `/templates` — navegação de templates (autenticada).
- `/published` — apps publicados do usuário (autenticada).
- `/app/:id/editor` — editor visual de um app (autenticada).
- `/app/:id/preview` — preview autenticado do formulário.
- `/app/:id/data` — tabela de dados do app, com criação, edição e remoção de linhas e edição de células.
- `/app/:id/data-table/:screenId` — gerenciamento de registros de uma tela (autenticada).
- `/app/public/:publicLink` e `/:publicLink` — formulário público de um app publicado.

As rotas protegidas redirecionam visitantes não autenticados para `/`. Os links públicos de apps publicados não exigem sessão no frontend.

### Fluxo de dados

Os serviços em `src/api` chamam a API usando o cliente Axios de `src/api/api-client.ts`. O cliente anexa o token de sessão Supabase como `Authorization: Bearer <token>` quando houver uma sessão. Os hooks em `src/hooks` integram consultas e mutações com TanStack Query.

O `DynamicForm` constrói os campos a partir dos componentes configurados para uma tela. Cada envio grava um registro por componente, contendo o ID da tela, o ID do componente e os dados do campo. A página Data agrupa registros próximos no tempo para exibir cada envio como uma linha e persiste as alterações pelo serviço de registros.

### Build

```bash
npm run check
npm run build
```

O build salva os arquivos estáticos do cliente em `dist/public` e também gera o bundle do servidor.

---

## English (United States)

### Overview

The Flexa frontend is a React application built with TypeScript and Vite. It lets users create and manage internal apps made of screens and form components, review submitted data, and share published apps through a public link.

### Main technologies

- React 18 and TypeScript
- Vite 7
- Wouter for routing
- TanStack Query for data caching and synchronization
- Supabase Auth for authentication
- Axios for API requests
- Tailwind CSS, Radix UI, and local components in `src/components/ui`
- React Hook Form for dynamic forms

### Requirements

- Node.js and npm
- The Flexa API available at `http://localhost:5000` during local development
- A Supabase project configured for authentication

### Local setup

Create or update `.env.local` in the repository root:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
# Optional. In development, the API defaults to the Vite origin.
VITE_API_BASE_URL=http://localhost:5000
```

Only use the public/anon Supabase key in the frontend. Never expose a `service_role` key through a `VITE_` variable.

Install dependencies from the repository root:

```bash
npm install
```

Start the backend and frontend in separate terminals, both from the repository root:

```bash
npm run dev
```

```bash
npm run dev:frontend
```

Vite will be available at `http://localhost:3000`. The Vite configuration proxies `/api` requests to `http://localhost:5000`. The frontend needs the API and Supabase credentials for authentication and data operations to work.

### Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev:frontend` | Starts only the Vite development server. |
| `npm run dev` | Starts the API server in development mode. |
| `npm run check` | Runs the project's TypeScript type check. |
| `npm run build` | Builds the client and server production artifacts. |

### Client structure

```text
client/
├── index.html
└── src/
    ├── api/          # HTTP services used by the application
    ├── components/   # Shared components and UI library
    ├── hooks/        # Authentication and React Query data hooks
    ├── lib/          # Supabase client, React Query setup, and utilities
    ├── pages/        # Main pages and workflows
    └── types/        # API DTO types
```

### Pages and routes

- `/` — landing page for visitors and dashboard for signed-in users.
- `/templates` — template browsing (authenticated).
- `/published` — the user's published apps (authenticated).
- `/app/:id/editor` — visual app editor (authenticated).
- `/app/:id/preview` — authenticated form preview.
- `/app/:id/data` — app data table, with row creation, editing, and deletion plus inline cell editing.
- `/app/:id/data-table/:screenId` — record management for a screen (authenticated).
- `/app/public/:publicLink` and `/:publicLink` — public form for a published app.

Protected routes redirect signed-out visitors to `/`. Public app links do not require a frontend session.

### Data flow

Services in `src/api` call the API through the Axios client in `src/api/api-client.ts`. When a Supabase session exists, the client attaches its token as `Authorization: Bearer <token>`. Hooks in `src/hooks` connect queries and mutations to TanStack Query.

`DynamicForm` builds fields from the components configured for a screen. Each form submission stores one record per component, including the screen ID, component ID, and field data. The Data page groups records created close together into a displayed row and persists edits through the data-entry service.

### Build

```bash
npm run check
npm run build
```

The build writes the client's static files to `dist/public` and also creates the server bundle.
