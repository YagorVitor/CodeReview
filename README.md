# Documentação da Aplicação CodeReview_aux

## Visão Geral

A aplicação é composta por um backend em Flask (Python) e um frontend em React, organizados nas pastas `app/backend` e `app/frontend`, respectivamente. O sistema implementa uma rede social simplificada, com funcionalidades de autenticação, postagens, comentários, curtidas, seguidores e notificações.

---

## Estrutura de Pastas

```
app/
  backend/
    app.py                # Inicialização do Flask e registro dos blueprints
    config.py             # Configurações da aplicação (banco, secret, etc)
    extensions.py         # Extensões do Flask (SQLAlchemy)
    manage.py             # CLI para comandos administrativos
    requirements.txt      # Dependências Python
    DAO/                  # Camada de acesso a dados (Data Access Objects)
    database/             # Banco SQLite
    middleware/           # Utilitários de autenticação JWT
    migrations/           # Migrações do banco de dados (Alembic)
    models/               # Modelos ORM (User, Post, Comment, etc)
    router/               # Blueprints das rotas da API REST
    uploads/              # Imagens de perfil e posts
  frontend/
    src/                  # Código-fonte React
    public/               # Arquivos estáticos
    package.json          # Dependências e scripts do frontend
    vite.config.js        # Configuração do Vite
```

---

## Backend (Flask)

### Principais Tecnologias

- **Flask**: Framework web principal
- **Flask-SQLAlchemy**: ORM para banco de dados SQLite
- **Flask-Migrate**: Migrações de banco de dados
- **Flask-CORS**: Suporte a CORS
- **bcrypt**: Hash de senhas
- **PyJWT**: Autenticação via JWT

### Modelos

- **User**: Usuários da plataforma (nome, username, email, senha, bio, foto, admin)
- **Post**: Postagens (texto, imagem, autor, respostas, likes, comentários)
- **Comment**: Comentários em posts (suporte a replies)
- **Like**: Curtidas em posts
- **Follow**: Relação de seguidores/seguidos
- **Notification**: Notificações de ações (like, comentário, etc)

### Rotas Principais

- **/api/login**: Autenticação de usuário (JWT)
- **/api/users**: CRUD de usuários, busca, upload de foto, seguidores/seguidos
- **/api/posts**: CRUD de posts, upload de imagem, feed paginado, respostas
- **/api/comments**: Adicionar/remover comentários
- **/api/likes**: Curtir/descurtir posts, contagem de likes
- **/api/notifications**: Listar, marcar como lida, deletar notificações

### Autenticação

- JWT via header `Authorization: Bearer <token>`
- Middleware para proteger rotas sensíveis

### Uploads

- Imagens de perfil e posts são salvas em `backend/uploads/`
- URLs de imagens são retornadas para uso no frontend

---

## Frontend (React + Vite)

### Principais Tecnologias

- **React 19**: Biblioteca principal de UI
- **Vite**: Bundler e servidor de desenvolvimento
- **React Router**: Rotas SPA
- **Framer Motion**: Animações
- **i18next**: Internacionalização
- **Dayjs**: Datas
- **Lucide-react**: Ícones

### Estrutura de Componentes

- **App.jsx**: Define rotas públicas e protegidas, providers de contexto
- **components/**: Componentes de UI (Feed, Perfil, Post, Login, Signup, etc)
- **context/**: Contextos globais (autenticação, feed, notificações)

### Funcionalidades

- Cadastro, login e logout de usuários
- Feed de posts (com texto e imagem)
- Perfil de usuário (com edição de bio e foto)
- Seguir/deixar de seguir usuários
- Curtir/descurtir posts
- Comentar e responder comentários
- Notificações em tempo real (likes, comentários)
- Busca de usuários
- Páginas institucionais (termos, privacidade, contato)

---

## Como Executar

### Backend

1. Instale as dependências:
   ```
   pip install -r app/backend/requirements.txt
   ```
2. Execute as migrações:
   ```
   cd app/backend
   flask db upgrade
   ```
3. Inicie o servidor:
   ```
   python app.py
   ```

### Frontend

1. Instale as dependências:
   ```
   cd app/frontend
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

---

## Observações

- O backend utiliza SQLite por padrão, mas pode ser adaptado para outros bancos.
- O frontend espera que a API esteja disponível em `/api`.
- O sistema é modular e pode ser expandido facilmente com novos recursos.

Se precisar de exemplos de uso da API ou detalhes de endpoints específicos, posso detalhar conforme necessário!
