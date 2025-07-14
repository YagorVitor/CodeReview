from models.user import User
from models.follow import Follow
from extensions import db
from sqlalchemy import or_

def get_all_users():
    """Retorna todos os usuários."""
    return User.query.all()

def get_user_by_email(email):
    """Retorna o usuário pelo email."""
    return User.query.filter_by(email=email).first()

def get_user_by_id(user_id):
    """Retorna usuário pelo ID."""
    return User.query.get(user_id)

def get_user_by_username(username):
    """Retorna usuário pelo username (único)."""
    return User.query.filter_by(username=username).first()

def create_user(data):
    """Cria um usuário novo com os dados fornecidos."""
    user = User(
        name=data['name'],
        username=data['username'],  # username obrigatório
        email=data['email'],
        password=data['password'],  # senha já deve estar hasheada
        admin=data.get('admin', False),
        bio=data.get('bio', ""),
        profile_picture=data.get('profile_picture')
    )
    db.session.add(user)
    db.session.commit()
    return user

def update_user(user_id, data):
    """
    Atualiza os campos do usuário identificado por user_id.
    data é um dict com os campos que deseja atualizar.
    """
    user = get_user_by_id(user_id)
    if not user:
        return None
    for key in ['bio', 'profile_picture', 'name', 'username', 'email', 'password', 'admin']:
        if key in data:
            setattr(user, key, data[key])
    db.session.commit()
    return user

def delete_user(user_id):
    """Deleta usuário pelo ID."""
    user = get_user_by_id(user_id)
    if not user:
        return False
    db.session.delete(user)
    db.session.commit()
    return True

def count_followers(user_id):
    """Retorna a quantidade de seguidores do usuário."""
    return Follow.query.filter_by(followed_id=user_id).count()

def follow_user(follower_id, followed_id):
    """
    Cria uma relação de follow.
    Retorna o objeto Follow ou None se inválido.
    """
    if follower_id == followed_id:
        return None  # Não pode seguir a si mesmo

    existing = Follow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if existing:
        return None  # Já segue

    follow = Follow(follower_id=follower_id, followed_id=followed_id)
    db.session.add(follow)
    db.session.commit()
    return follow

def unfollow_user(follower_id, followed_id):
    """Remove a relação de follow. Retorna True se sucesso."""
    follow = Follow.query.filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
        return True
    return False

def get_followers(user_id):
    """Retorna lista de usuários que seguem o usuário especificado."""
    follows = Follow.query.filter_by(followed_id=user_id).all()
    return [follow.follower for follow in follows]

def get_following(user_id):
    """Retorna lista de usuários que o usuário especificado está seguindo."""
    follows = Follow.query.filter_by(follower_id=user_id).all()
    return [follow.followed for follow in follows]

def search_users_by_name_or_username(query):
    return User.query.filter(
        or_(
            User.name.ilike(f"%{query}%"),
            User.username.ilike(f"%{query}%")
        )
    ).all()

def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

def get_users_by_usernames(usernames):
    return User.query.filter(User.username.in_(usernames)).all()
