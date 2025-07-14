from flask import Blueprint, request, jsonify, make_response
from DAO import follow_dao, user_dao, notification_dao
from middleware.jwt_util import token_required, decode_token

follow_bp = Blueprint('follow_bp', __name__)

@follow_bp.route('/follow/<int:user_id>', methods=['POST'])
@token_required
def follow(user_id):
    current_user = request.user
    if current_user.id == user_id:
        return jsonify({"error": "Você não pode seguir a si mesmo"}), 400

    follow = follow_dao.follow_user(current_user.id, user_id)
    if not follow:
        return jsonify({"error": "Você já está seguindo este usuário"}), 400

    # Cria notificação para o usuário seguido
    notification_dao.create_notification(
        user_id=user_id,
        type="follow",
        message=f"{current_user.username} começou a te seguir."
    )

    return jsonify({"message": "Seguido com sucesso"}), 200


@follow_bp.route('/unfollow/<int:user_id>', methods=['DELETE'])
@token_required
def unfollow(user_id):
    current_user = request.user
    success = follow_dao.unfollow_user(current_user.id, user_id)
    if not success:
        return jsonify({"error": "Você não estava seguindo este usuário"}), 400

    return jsonify({"message": "Deixou de seguir com sucesso"}), 200

@follow_bp.route('/followers/<int:user_id>', methods=['GET'])
def get_followers(user_id):
    followers = follow_dao.get_followers(user_id)
    return jsonify([follower.to_dict() for follower in followers]), 200

@follow_bp.route('/following/<int:user_id>', methods=['GET'])
def get_following(user_id):
    following = follow_dao.get_following(user_id)
    return jsonify([user.to_dict() for user in following]), 200

@follow_bp.route('/is_following/<int:user_id>', methods=['GET', 'OPTIONS'])
def check_is_following(user_id):
    if request.method == 'OPTIONS':
        # Resposta para preflight CORS
        response = make_response('', 200)
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        return response

    # Autenticação manual
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token is missing'}), 401

    token = auth_header.split(' ')[1]
    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Token is invalid or expired'}), 401

    user = user_dao.get_user_by_id(payload['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 401

    if user.id == user_id:
        return jsonify({'is_following': False}), 200

    result = follow_dao.is_following(user.id, user_id)
    return jsonify({'is_following': result}), 200
