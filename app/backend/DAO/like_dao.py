from models.like import Like
from extensions import db

def create_like(data):
    """
    Cria um like para user_id e post_id, se ainda não existir.
    Retorna o like criado ou None se já existir.
    """
    user_id = data['user_id']
    post_id = data['post_id']
    existing = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
    if existing:
        return None

    like = Like(user_id=user_id, post_id=post_id)
    db.session.add(like)
    db.session.commit()
    return like

def delete_like(like_id):
    """
    Deleta like pelo ID.
    Retorna True se deletado, False se não encontrado.
    """
    like = Like.query.get(like_id)
    if not like:
        return False
    db.session.delete(like)
    db.session.commit()
    return True

def get_like_by_user_and_post(user_id, post_id):
    """Retorna o like existente para user_id e post_id ou None."""
    return Like.query.filter_by(user_id=user_id, post_id=post_id).first()

def get_like_by_id(like_id):
    """Retorna like pelo ID ou None."""
    return Like.query.get(like_id)

def get_likes_by_user(user_id):
    """Retorna todos os likes feitos pelo usuário."""
    return Like.query.filter_by(user_id=user_id).all()

def get_likes_by_post(post_id):
    return Like.query.filter_by(post_id=post_id).all()
