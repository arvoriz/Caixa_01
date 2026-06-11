# Caixa Pro

_Última atualização: 11/06/2026_

---

## Visão geral

**Caixa Pro** é uma aplicação web para gestão de fluxo de caixa de pequenos e médios
empreendedores que administram **um ou mais de um CNPJ**. O usuário cadastra suas empresas, controla
entradas e saídas (lançamentos), categoriza movimentações, acompanha empréstimos/mútuos entre
empresas e convida sócios e contadores para colaborar — cada um com permissões diferentes.

### Objetivos

- Centralizar o controle financeiro de várias empresas em um único lugar, com troca rápida entre elas.
- Dar visibilidade clara de entradas, saídas, saldos e pendências (lançamentos atrasados, parcelamentos).
- Permitir colaboração multiusuário por empresa, com papéis (**dono**, **sócio**, **contador**) e
  permissões adequadas a cada um (ex: contador tem acesso somente leitura).
- Registrar empréstimos/mútuos entre empresas do mesmo grupo, com controle de saldo devedor.
- Manter um histórico de auditoria das ações relevantes (criação/edição/exclusão de dados sensíveis).
- Funcionar bem em desktop e mobile (responsivo, instalável como PWA).

### Principais funcionalidades

- **Autenticação** via Supabase (e-mail/senha, login com Google, MFA/TOTP, recuperação de senha).
- **Multi-empresa**: cada usuário pode ter várias empresas, com seleção da "empresa ativa" persistida.
- **Lançamentos**: entradas e saídas com categoria, vencimento, status (pendente/pago/atrasado/cancelado)
  e suporte a parcelamento.
- **Categorias**: padrão do sistema ou personalizadas por empresa.
- **Empréstimos/mútuos**: transferências de saldo entre empresas, com cancelamento que reverte o saldo.
- **Convites**: dono/sócio convidam novos sócios ou contadores por link.
- **Permissões por papel (RBAC)**: dono, sócio e contador têm acessos diferentes a cada área.
- **Dissolução de empresa**: o dono pode excluir permanentemente uma empresa e todos os dados
  relacionados (com confirmação digitando o CNPJ).
- **Relatórios** e dashboard com visão consolidada do caixa.
- **PWA**: instalável, com service worker e cache offline básico.

---

## Como subir o ambiente

> Pré-requisito: ter apenas **Docker Desktop** instalado. Não precisa de Ruby, Node ou qualquer outra coisa.

```bash
# 1. Clone o repositório
git clone https://github.com/arvoriz/Caixa_01
cd Caixa_01

# 2. Crie o arquivo de variáveis de ambiente (tem valores padrão de exemplo, ajuste para produção)
cp .env.example .env

# 3. Suba tudo (primeira vez demora ~5 minutos — baixa imagens e inicializa os projetos)
docker compose up --build
```

Pronto. A partir daí:

- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend (API): [http://localhost:3000](http://localhost:3000)
- Banco/Auth: Supabase (configurado via variáveis de ambiente — ver `.env.example`)

### Uso diário

```bash
docker compose up          # sobe os serviços
docker compose down        # para os serviços
```

### O que acontece na primeira execução

O Docker detecta automaticamente que é a primeira vez e:

1. Gera o skeleton do Rails (`rails new`) e do Angular (`ng new`) dentro dos containers
2. Instala todas as dependências (gems e pacotes npm)
3. Roda as migrations pendentes
4. Nas execuções seguintes pula tudo isso e sobe direto

---

## Comandos úteis

```bash
docker compose up --build   # sobe com rebuild
docker compose up           # sobe sem rebuild (uso diário)
docker compose down         # para os containers
docker compose down -v      # apaga volumes e recomeça do zero
docker compose logs -f      # acompanha os logs em tempo real
docker compose exec backend sh        # terminal no backend
docker compose exec frontend sh       # terminal no frontend
docker compose exec backend rails db:migrate    # roda migrations
docker compose exec backend rails console       # Rails console
```

---

## Estrutura do repositório

```
Caixa_01/
  backend/         # API Ruby on Rails
  frontend/        # SPA Angular
  docker-compose.yml
  render.yaml       # configuração de deploy (Render)
  .env.example
```

---

## Stack

| Camada | Tecnologia | Versão |
| --- | --- | --- |
| Backend | Ruby on Rails (API mode) | 7.2 |
| Frontend | Angular (standalone components, signals) | 17 |
| Banco / Auth | Supabase (PostgreSQL gerenciado + autenticação) | — |
| Infra | Docker Compose / Render | — |

---

## Descrição técnica — Backend (Rails API)

A API é construída em Rails 7.2 modo API (sem views HTML). Toda comunicação é via JSON, no formato
padronizado:

```json
{ "data": {}, "meta": {}, "errors": [] }
```

### Autenticação (Backend)

A autenticação é 100% delegada ao **Supabase Auth**. O Rails não gera nem armazena senhas:

1. Frontend autentica via Supabase client (e-mail/senha, Google OAuth ou MFA/TOTP)
2. Supabase retorna um JWT
3. Frontend envia o JWT no header `Authorization: Bearer <token>` em toda requisição ao Rails
4. Rails valida o JWT com `SUPABASE_JWT_SECRET` e localiza o `Usuario` local pelo `supabase_uid` do payload

### Organização (Backend)

```text
backend/
  app/
    controllers/
      concerns/
        autenticavel.rb       # before_action — valida JWT do Supabase
        escopo_empresa.rb      # garante que o recurso pertence à empresa do usuário (multi-tenant)
        resposta_json.rb        # padroniza { data, meta, errors }
      api/v1/
        base_controller.rb
        auth_controller.rb
        empresas_controller.rb
        empresa_acessos_controller.rb
        empresa_convites_controller.rb
        convites_controller.rb
        categorias_controller.rb
        lancamentos_controller.rb
        emprestimos_controller.rb
    models/
      usuario.rb, empresa.rb, acesso_empresa.rb, categoria.rb,
      lancamento.rb, emprestimo.rb, convite.rb, log_auditoria.rb
    serializers/
    services/
      auth/                   # Auth::TokenService — decodifica JWT do Supabase
      lancamentos/            # Lancamentos::CriarService — geração de parcelas
      auditoria/              # Auditoria::Registrador — logs de auditoria
  config/
    routes.rb
    initializers/cors.rb
    locales/pt-BR.yml
  spec/                       # RSpec + FactoryBot + Faker
```

### Endpoints principais

```text
GET    /api/v1/auth/me                                    # dados do usuário logado
PATCH  /api/v1/auth/me                                    # atualiza nome_completo
PATCH  /api/v1/auth/ultima_empresa                        # salva última empresa acessada

GET    /api/v1/empresas                                   # empresas do usuário
POST   /api/v1/empresas                                   # cria empresa
PATCH  /api/v1/empresas/:id                               # atualiza nome_fantasia
DELETE /api/v1/empresas/:id                               # dissolução (somente dono)
POST   /api/v1/empresas/:id/transferir_titularidade       # dono → sócio
GET    /api/v1/empresas/:id/acessos                       # usuários com acesso
DELETE /api/v1/empresas/:id/acessos/:id                   # remove acesso
POST   /api/v1/empresas/:id/convites                      # gera link de convite

GET    /api/v1/convites/:token                            # valida convite (público)
POST   /api/v1/convites/:token/aceitar                    # aceita convite (autenticado)

GET    /api/v1/empresas/:empresa_id/categorias            # categorias (sistema + empresa)
POST   /api/v1/empresas/:empresa_id/categorias            # cria categoria

GET    /api/v1/empresas/:empresa_id/lancamentos           # lista (filtros: tipo, status, busca)
POST   /api/v1/empresas/:empresa_id/lancamentos           # cria (parcelas: N gera parcelado)
PATCH  /api/v1/empresas/:empresa_id/lancamentos/:id       # atualiza
DELETE /api/v1/empresas/:empresa_id/lancamentos/:id       # exclui

# Empréstimos: create, update, registrar_pagamento, cancelar, destroy

GET    /up                                                # health check (Rails)
GET    /healthcheck                                       # health check
```

### Permissões por papel (RBAC)

O papel do usuário na empresa ativa (`dono`, `socio`, `contador`) vem de `acessos_empresas`. A
autorização é feita no controller (não na RLS):

| Área | dono | socio | contador |
| --- | --- | --- | --- |
| Dashboard / Relatórios | ver | ver | ver |
| Lançamentos / Categorias / Empréstimos | mexer | mexer | **somente ver** |
| Empresa — nome_fantasia | editar | editar | somente ver |
| Convidar/remover sócio | sim | não | não |
| Convidar/remover contador | sim | sim | não |
| Transferir titularidade | sim | não | não |
| Excluir empresa (dissolução) | sim | não | não |

### Banco de dados

PostgreSQL gerenciado pelo Supabase (schema mantido via SQL no painel do Supabase, não por
migrations Rails). Tabelas principais:

- **usuarios** — espelha `auth.users` do Supabase, criado via trigger no signup
- **empresas** — CNPJ, razão social, nome fantasia, saldo inicial
- **acessos_empresas** — vínculo usuário ↔ empresa com papel (dono/sócio/contador)
- **categorias** — padrão do sistema ou específicas de uma empresa
- **lancamentos** — entradas/saídas, com status e suporte a parcelamento (`grupo_parcelamento_id`)
- **emprestimos_mutuo** — empréstimos entre empresas, com saldo devedor e status
- **convites** — convites de sócio/contador por link
- **logs_auditoria** — histórico de ações sensíveis (ex: exclusão de empresa)

Ao excluir uma empresa (dissolução), `acessos_empresas`, `categorias`, `convites` e `lancamentos`
são removidos em cascata pelo banco; `emprestimos_mutuo` é destruído pelo Rails (`dependent: :destroy`);
`usuarios.ultima_empresa_id` é zerado; o registro em `logs_auditoria` permanece para histórico.

---

## Descrição técnica — Frontend (Angular)

SPA construída com Angular 17, usando componentes **standalone** e **Signals** para gerenciamento
de estado.

### Organização (Frontend)

```text
frontend/src/app/
  api/                              # camada HTTP pura (uma por recurso da API)
  core/
    guards/auth.guard.ts            # redireciona para /auth/login se sem sessão
    interceptors/auth.interceptor.ts # injeta Bearer token + logout automático em 401
    models/                         # interfaces TypeScript
    services/
      auth.service.ts               # estado da sessão (signals usuarioAtual, estaAutenticado)
      supabase.service.ts           # wrapper do cliente Supabase
      empresa-ativa.service.ts      # empresa selecionada, papel, soLeitura
      layout-ui.service.ts          # estado da UI (sidebar mobile)
      token-storage.service.ts
  features/                         # páginas carregadas sob demanda (lazy)
    auth/login/, auth/redefinir-senha/
    dashboard/, empresas/, lancamentos/, categorias/, emprestimos/, relatorios/
  layout/
    shell.component.ts              # sidebar + navbar + router-outlet (área autenticada)
  shared/
    components/                     # navbar, sidebar
    directives/                     # ex: scroll-to-top-on-change
```

### Autenticação (Frontend)

- `SupabaseService` encapsula o cliente `@supabase/supabase-js` (login, logout, recuperação de
  sessão, recuperação de senha, MFA/TOTP).
- `AuthService` expõe `estaAutenticado` e `usuarioAtual` como signals.
- O interceptor adiciona `Authorization: Bearer <token>` em toda requisição ao Rails e faz logout
  automático em respostas 401.
- `ShellComponent` só renderiza o layout depois que os dados do usuário são carregados (evita
  mostrar a navbar sem informações).

### Multi-empresa e permissões

- `EmpresaAtivaService` mantém a lista de empresas do usuário, a empresa ativa, o papel
  (`dono`/`socio`/`contador`) e `soLeitura()` (true para contador).
- A UI esconde ações de escrita quando `soLeitura()` é true; o backend é a fonte de verdade da
  autorização.
- Ao criar uma empresa, ela é automaticamente selecionada como ativa.
- Dono pode dissolver (excluir permanentemente) uma empresa, com confirmação digitando o CNPJ.

### Rotas (resumo)

```typescript
/auth/login              -> LoginComponent           (público)
/auth/redefinir-senha    -> RedefinirSenhaComponent  (público — recuperação de senha)
/                        -> ShellComponent           (guard: authGuard)
  /dashboard             -> DashboardComponent
  /empresas              -> EmpresasComponent
  /lancamentos           -> LancamentosComponent
  /categorias            -> CategoriasComponent
  /emprestimos           -> EmprestimosComponent
  /relatorios            -> RelatoriosComponent
```

### Responsividade e PWA

- Layout mobile-first com Tailwind: sidebar vira drawer abaixo de `md:`.
- Tabelas de listas/relatórios usam `overflow-x-auto` para rolagem horizontal em telas pequenas.
- Modais com scroll rolam automaticamente para o topo quando uma mensagem de erro aparece.
- PWA via `@angular/service-worker` (manifest, ícone, cache offline básico).

### Environments

| Arquivo | `apiUrl` | `supabaseUrl` |
| --- | --- | --- |
| `environment.ts` | `http://localhost:3000/api/v1` | URL do projeto Supabase |
| `environment.prod.ts` | `/api/v1` (proxy nginx) | URL do projeto Supabase |

---

## Deploy

Configuração de deploy em `render.yaml` (Render.com), com variáveis de ambiente sensíveis
(`SUPABASE_JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`, etc.) marcadas como `sync: false` —
precisam ser configuradas manualmente no dashboard do Render.
