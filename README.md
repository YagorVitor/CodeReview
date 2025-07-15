## CodeReview

### Visão Geral

O **CodeReview** é uma rede social web fullstack em desenvolvimento, com backend em **Flask** e frontend em **React**. O sistema implementa funcionalidades completas de cadastro e login de usuários, postagens com imagens e textos, comentários com suporte a respostas aninhadas, sistema de curtidas, seguidores, notificações e busca de usuários. Ainda estamos refinando a experiência e ajustando alguns detalhes, mas a estrutura principal já está funcional.

---

### Estrutura de Pastas

```
app/
  backend/
    app.py           # Inicialização da aplicação Flask
    config.py        # Configurações globais (secret key, banco etc.)
    extensions.py    # Extensões do Flask como SQLAlchemy, Migrate, etc.
    manage.py        # CLI para tarefas administrativas
    requirements.txt # Dependências do backend
    DAO/             # Camada de acesso a dados
    database/        # Banco SQLite
    middleware/      # Autenticação via JWT
    migrations/      # Migrações de banco com Alembic
    models/          # Modelos ORM (User, Post, Comment...)
    router/          # Rotas REST (Blueprints)
    uploads/         # Imagens de perfil e posts

  frontend/
    src/             # Código-fonte React
    public/          # Arquivos públicos
    package.json     # Dependências e scripts do frontend
    vite.config.js   # Configurações do Vite
```

---

### Backend — Flask (Python)

#### Tecnologias

* Flask
* Flask-SQLAlchemy
* Flask-Migrate
* Flask-CORS
* PyJWT
* bcrypt

#### Modelos

* **User**: nome, username, email, senha (hash), bio, foto, admin
* **Post**: conteúdo textual e/ou imagem, autor, comentários, curtidas
* **Comment**: comentários em posts com suporte a respostas encadeadas
* **Like**: registros de curtidas por usuário e post
* **Follow**: relacionamentos entre usuários (seguir/seguido)
* **Notification**: notificações sobre interações (curtidas, comentários, etc.)

#### Endpoints REST

```http
POST   /api/login                 # Autenticação (retorna JWT)
GET    /api/users                 # Lista de usuários
POST   /api/users                 # Cadastro de usuário
GET    /api/users/<id>            # Detalhes de usuário
PUT    /api/users/<id>            # Atualização de dados do usuário
DELETE /api/users/<id>            # Deletar conta
PUT    /api/users/<id>/profile    # Atualizar foto e bio

GET    /api/posts                 # Feed paginado
POST   /api/posts                 # Criar post
GET    /api/posts/<id>            # Detalhes de um post
PUT    /api/posts/<id>            # Editar post
DELETE /api/posts/<id>            # Deletar post

POST   /api/comments/<post_id>    # Comentar post
DELETE /api/comments/<id>         # Remover comentário

POST   /api/posts/<id>/like       # Curtir post
DELETE /api/posts/<id>/like       # Descurtir post

GET    /api/notifications         # Ver notificações
```

> Obs: rotas protegidas exigem header `Authorization: Bearer <token>`.

#### Uploads

* Imagens (perfil e post) são salvas localmente em `backend/uploads/`
* A API retorna URLs públicas e privadas para serem usadas no frontend

---

### Frontend — React + Vite

#### Tecnologias

* React
* Vite
* React Router
* Framer Motion
* i18next
* Dayjs
* Lucide-react

#### Organização

* **App.jsx**: ponto de entrada com rotas e providers
* **components/**: componentes reutilizáveis (Feed, Post, Perfil, etc.)
* **context/**: gerenciamento global (auth, feed, notificações)

#### Funcionalidades

* Autenticação com persistência via JWT
* Edição de perfil com foto e bio
* Feed de posts com imagens e texto
* Ordenação por Relevância, com margem para melhorias.
* Comentários e respostas em árvore
* Curtidas em posts
* Sistema de seguidores
* Notificações em tempo real
* Busca por usuários
* Páginas institucionais

---

### Executando Localmente

#### Backend (Windows)

```bash
cd app/backend
python3 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
flask db upgrade
python app.py
```

#### Backend (Linux/MacOS)

```bash
cd app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
python app.py
```

#### Frontend(Windows/Linux/MacOS)

```bash
cd app/frontend
npm install
npm run dev
```

---

### Observações Finais

* Banco padrão é SQLite, mas a arquitetura é compatível com PostgreSQL.
* A API é acessada pelo frontend via `/api`.
* O projeto foi estruturado para ser facilmente escalável e modular.