# WEB-III — Visão Geral do Projeto

_Última atualização: 2026-04-26_

---

## Como subir o ambiente (qualquer módulo)

> Pré-requisito: ter apenas **Docker Desktop** instalado. Não precisa de Ruby, Node ou qualquer outra coisa.

```bash
# 1. Clone o repositório
git clone https://github.com/arvoriz/Caixa_01
cd Caixa_01

# 2. Crie o arquivo de variáveis de ambiente(não obrigatorio: tem configuração padrão para exemplo, mas deve ser alterado para produção)
cp .env.example .env

# 3. Suba tudo (primeira vez demora ~5 minutos — baixa imagens e inicializa os projetos)
docker compose up --build
```

Pronto. A partir daí:

- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend (API): [http://localhost:3000](http://localhost:3000)
- Banco (PostgreSQL): `localhost:5432`

### Uso diário

```bash
docker compose up          # sobe os serviços
docker compose down        # para os serviços
```

### O que acontece na primeira execução

O Docker detecta automaticamente que é a primeira vez e:

1. Gera o skeleton do Rails (`rails new`) e do Angular (`ng new`) dentro dos containers
2. Instala todas as dependências (gems e pacotes npm)
3. Cria o banco de dados, roda as migrations e popula com dados iniciais
4. Nas execuções seguintes pula tudo isso e sobe direto

### Usuário de teste (desenvolvimento)

Após o primeiro `docker compose up --build`, um usuário admin é criado automaticamente:

- **E-mail:** `admin@app.com`
- **Senha:** `admin123`

---

## Comandos úteis

Execute dentro da pasta do módulo:

```bash
docker compose up --build   # sobe com rebuild
docker compose up           # sobe sem rebuild (uso diário)
docker compose down         # para os containers
docker compose down -v      # apaga o banco e recomeça do zero
docker compose logs -f      # acompanha os logs em tempo real
docker compose exec backend sh        # terminal no backend
docker compose exec frontend sh       # terminal no frontend
docker compose exec backend rails db:migrate    # roda migrations
docker compose exec backend rails console       # Rails console
docker compose exec db psql -U postgres         # psql direto no banco
```

---

## Estrutura do repositório

Estrutura interna:

```
Caixa_01/
  backend/         # API Ruby on Rails
  frontend/        # SPA Angular
  docker-compose.yml
  Makefile
  .env.example
```

---

## Módulos

### Caixa_01

**Status:** Em desenvolvimento
**Descrição:** Módulo base com autenticação, estrutura completa de backend e frontend prontos para desenvolvimento de features.

---

## Descrição técnica — Backend (Rails API)

O backend é uma API REST construída com Ruby on Rails em modo API (sem HTML). Toda comunicação é via JSON.

### Organização

```
app/
  controllers/api/v1/     # endpoints versionados
  models/                 # regras de negócio e validações
  serializers/            # formata os dados antes de enviar ao frontend
  services/               # lógica complexa separada por domínio
    auth/                 # autenticação e tokens JWT
```

### Autenticação

Baseada em JWT (JSON Web Token). O fluxo é:

1. Frontend envia e-mail e senha para `POST /api/v1/auth/login`
2. Backend valida as credenciais e devolve um token
3. Frontend inclui o token em toda requisição seguinte no header `Authorization: Bearer <token>`
4. Token expira em 24 horas (configurável)

### Endpoints disponíveis

| Método | Rota | Descrição | Auth |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | Login | Não |
| DELETE | `/api/v1/auth/logout` | Logout | Sim |
| GET | `/api/v1/auth/me` | Dados do usuário logado | Sim |
| GET | `/up` | Health check | Não |

### Resposta padrão

Toda resposta da API segue o formato:

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

### Banco de dados

PostgreSQL 16. Tabelas atuais:

- **users** — usuários com roles (`admin` / `user`), senha criptografada com bcrypt

---

## Descrição técnica — Frontend (Angular)

SPA (Single Page Application) construída com Angular 17 usando componentes standalone e a API de Signals para gerenciamento de estado.

### Organização

```
src/app/
  api/            # serviços de comunicação HTTP (um por recurso da API)
  core/
    guards/       # proteção de rotas (verifica se está logado)
    interceptors/ # adiciona token JWT em todas as requisições
    models/       # interfaces TypeScript
    services/     # estado da aplicação (sessão do usuário, etc.)
  features/       # páginas carregadas sob demanda
    auth/login/   # tela de login
    dashboard/    # tela inicial após login
  layout/
    shell/        # estrutura da área logada (sidebar + navbar + conteúdo)
  shared/
    components/   # componentes reutilizáveis (navbar, sidebar)
```

### Fluxo de autenticação

1. Usuário acessa qualquer rota protegida
2. Guard verifica se existe token salvo — se não, redireciona para `/auth/login`
3. Usuário faz login — token é salvo no localStorage
4. Interceptor injeta o token automaticamente em todas as chamadas à API
5. Se a API retornar erro 401 (token expirado), o interceptor faz logout automático

### Rotas

| Rota | Componente | Protegida |
| --- | --- | --- |
| `/auth/login` | LoginComponent | Não |
| `/dashboard` | DashboardComponent | Sim |

### Layout da área autenticada

```
┌──────────────┬────────────────────────────────┐
│              │  Navbar (nome do usuário, sair) │
│   Sidebar    ├────────────────────────────────┤
│   (menu de   │                                │
│   navegação) │   Conteúdo da página atual     │
│              │                                │
└──────────────┴────────────────────────────────┘
```

### Design system

Sem biblioteca de UI externa. Usa CSS puro com variáveis nativas para cores, espaçamentos, bordas e sombras. Classes utilitárias globais para botões, formulários, cards e alertas definidas em `src/styles/`.

---

## Contextos para o assistente de IA

A pasta `WEB-III/claude/` contém arquivos de contexto modularizados para uso com Claude Code.
Consultar [claude/INDEX.md](claude/INDEX.md) para saber qual arquivo ler em cada situação.
