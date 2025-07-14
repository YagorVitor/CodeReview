from flask import Blueprint, request, jsonify
from DAO import like_dao, post_dao, notification_dao
from middleware.jwt_util import token_required

like_bp = Blueprint('like_bp', __name__)

@like_bp.route('/likes', methods=['GET'])
@token_required
def get_all_likes():
    """Retorna todos likes - somente admins podem acessar."""
    user = request.user
    if not user.admin:
        return jsonify({'error': 'Unauthorized access'}), 403
    likes = like_dao.get_all_likes()
    return jsonify([like.to_dict() for like in likes]), 200

@like_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@token_required
def like_post(post_id):
    user = request.user
    existing_like = like_dao.get_like_by_user_and_post(user.id, post_id)
    if existing_like:
        return jsonify({'error': 'Like already exists'}), 400

    like = like_dao.create_like({'user_id': user.id, 'post_id': post_id})

    # Cria notificação para o autor do post
    post = post_dao.get_post_by_id(post_id)
    if post and post.user_id != user.id:
        notification_dao.create_notification(
            user_id=post.user_id,
            type="like",
            message=f"{user.username} curtiu seu post."
        )

    return jsonify(like.to_dict()), 201

@like_bp.route('/posts/<int:post_id>/like', methods=['DELETE'])
@token_required
def unlike_post(post_id):
    """Usuário remove like do post."""
    user = request.user
    like = like_dao.get_like_by_user_and_post(user.id, post_id)
    if not like:
        return jsonify({'error': 'Like not found'}), 404

    success = like_dao.delete_like(like.id)
    if success:
        return jsonify({'message': 'Like deleted'}), 200
    return jsonify({'error': 'Delete failed'}), 500

@like_bp.route('/likes/<int:like_id>', methods=['GET'])
@token_required
def get_like(like_id):
    """Busca like pelo id, com controle de acesso."""
    user = request.user
    like = like_dao.get_like_by_id(like_id)
    if not like:
        return jsonify({'error': 'Like not found'}), 404

    if user.id != like.user_id and not user.admin:
        return jsonify({'error': 'Unauthorized access'}), 403

    return jsonify(like.to_dict()), 200

@like_bp.route('/likes/user/<int:user_id>', methods=['GET'])
@token_required
def get_likes_by_user_id(user_id):
    """Retorna likes feitos por usuário. Só o próprio usuário ou admin podem acessar."""
    user = request.user
    if user.id != user_id and not user.admin:
        return jsonify({'error': 'Unauthorized access'}), 403

    likes = like_dao.get_likes_by_user(user_id)
    return jsonify([like.to_dict() for like in likes]), 200

@like_bp.route('/likes/post/<int:post_id>', methods=['GET'])
def get_likes_by_post_id(post_id):
    """Retorna likes de um post — público."""
    post = post_dao.get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    likes = like_dao.get_likes_by_post(post_id)
    return jsonify([like.user.to_dict() for like in likes]), 200


@like_bp.route('/likes/count/post/<int:post_id>', methods=['GET'])
def get_like_count_by_post_id(post_id):
    """Contagem pública de likes por post."""
    count = len(like_dao.get_likes_by_post(post_id))
    return jsonify({'like_count': count}), 200
