from models.post import Post
from extensions import db
from datetime import datetime, timezone

# 🔍 Recupera todos os posts (paginados), ordenados por data mais recente
def get_all_posts_paginated(page=1, per_page=20):
    return (
        Post.query.order_by(Post.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
        .items
    )

# 🔍 Recupera um post específico pelo ID
def get_post_by_id(post_id):
    return Post.query.get(post_id)

# 📝 Cria um novo post
def create_post(data):
    now = datetime.now(timezone.utc)
    post = Post(
        user_id=data['user_id'],
        reply_id=data.get('reply_id'),
        content=data.get('content'),
        description=data.get('description'),
        image_url=data.get('image_url'),
        created_at=now,
        updated_at=None
    )
    db.session.add(post)
    db.session.commit()
    return post

# ✏️ Atualiza um post existente
def update_post(post_id, data):
    post = get_post_by_id(post_id)
    if not post:
        return None

    post.reply_id = data.get('reply_id', post.reply_id)
    post.content = data.get('content', post.content)
    post.description = data.get('description', post.description)
    post.updated_at = datetime.now(timezone.utc)

    db.session.commit()
    return post

# ❌ Deleta um post
def delete_post(post_id):
    post = get_post_by_id(post_id)
    if not post:
        return False

    db.session.delete(post)
    db.session.commit()
    return True

# 🔍 Recupera posts de um usuário específico, com paginação
def get_posts_by_user_id_paginated(user_id, page=1, per_page=20):
    return (
        Post.query.filter_by(user_id=user_id)
        .order_by(Post.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
        .items
    )
