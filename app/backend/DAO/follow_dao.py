from models.follow import Follow
from extensions import db

def follow_user(follower_id, followed_id):
    """
    Cria um follow de follower_id para followed_id.
    Retorna o objeto Follow criado ou None se inválido ou já existir.
    """
    if follower_id == followed_id:
        return None  # Não pode seguir a si mesmo

    existing = Follow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if existing:
        return None  # Já está seguindo

    follow = Follow(follower_id=follower_id, followed_id=followed_id)
    db.session.add(follow)
    db.session.commit()
    return follow

def unfollow_user(follower_id, followed_id):
    """
    Remove o follow entre follower_id e followed_id.
    Retorna True se removido, False se não existia.
    """
    follow = Follow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
        return True
    return False

def is_following(follower_id, followed_id):
    """
    Verifica se follower_id está seguindo followed_id.
    Retorna True ou False.
    """
    return Follow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first() is not None

def get_followers(user_id):
    """
    Retorna lista de usuários que seguem o usuário com user_id.
    """
    follows = Follow.query.filter_by(followed_id=user_id).all()
    return [follow.follower for follow in follows]


def get_following(user_id):
    """
    Retorna lista de usuários que o usuário está seguindo.
    """
    follows = Follow.query.filter_by(follower_id=user_id).all()
    return [follow.followed for follow in follows]