import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from DAO import user_dao, follow_dao
from bcrypt import hashpw, gensalt
from middleware.jwt_util import token_required

user_bp = Blueprint('user_bp', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Verifica se o arquivo tem extensão permitida."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Rotas Usuário ---

@user_bp.route('/users', methods=['GET'])
def get_all_users():
    users = user_dao.get_all_users()
    return jsonify([user.to_dict() for user in users]), 200

@user_bp.route('/users/search', methods=['GET'])
def search_users():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'Missing search query'}), 400
    users = user_dao.search_users_by_name_or_username(query)
    return jsonify([u.to_dict() for u in users]), 200


@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    required_fields = ['name', 'email', 'username', 'password']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    if user_dao.get_user_by_email(data['email']):
        return jsonify({'error': 'Email already exists'}), 400
    if user_dao.get_user_by_username(data['username']):
        return jsonify({'error': 'Username already exists'}), 400

    # Hash da senha
    data['password'] = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')
    data['admin'] = False

    user = user_dao.create_user(data)
    user_dict = user.to_dict()
    user_dict.pop('password', None)
    return jsonify(user_dict), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = user_dao.get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_data = user.to_dict()

    # Verifica se o usuário atual está seguindo
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        from middleware.jwt_util import decode_token
        token = auth_header.split(' ')[1]
        payload = decode_token(token)
        if payload:
            current_user_id = payload['user_id']
            if current_user_id != user.id:
                user_data['is_following'] = follow_dao.is_following(current_user_id, user.id)

    return jsonify(user_data), 200


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    current_user = request.user
    if current_user.id != user_id and not current_user.admin:
        return jsonify({'error': 'Permission denied'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validar unicidade de email e username se estiverem sendo alterados
    if 'email' in data and data['email'] != current_user.email:
        if user_dao.get_user_by_email(data['email']):
            return jsonify({'error': 'Email already exists'}), 400
    if 'username' in data and data['username'] != current_user.username:
        if user_dao.get_user_by_username(data['username']):
            return jsonify({'error': 'Username already exists'}), 400

    # Só admin pode alterar admin ou id
    if not current_user.admin:
        data.pop('admin', None)
        data.pop('id', None)

    # Hash senha nova se enviada
    if 'password' in data:
        data['password'] = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')

    if 'bio' in data and not isinstance(data['bio'], str):
        return jsonify({'error': 'Bio must be a string'}), 400

    user = user_dao.update_user(user_id, data)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    current_user = request.user
    if current_user.id != user_id and not current_user.admin:
        return jsonify({'error': 'Permission denied'}), 403

    success = user_dao.delete_user(user_id)
    if not success:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'message': 'User deleted'}), 200

@user_bp.route('/users/<int:user_id>/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    current_user = request.user
    if current_user.id != user_id and not current_user.admin:
        return jsonify({'error': 'Permission denied'}), 403

    bio = request.form.get('bio')
    file = request.files.get('profile_picture')

    update_data = {}

    if bio is not None:
        if not isinstance(bio, str):
            return jsonify({'error': 'Bio must be a string'}), 400
        update_data['bio'] = bio

    if file:
        if not allowed_file(file.filename):
            return jsonify({'error': 'File extension not allowed'}), 400

        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, unique_filename)

        try:
            file.save(filepath)
        except Exception as e:
            return jsonify({'error': 'Failed to save file'}), 500

        # Remove imagem anterior
        existing_user = user_dao.get_user_by_id(user_id)
        if existing_user and existing_user.profile_picture:
            old_path = os.path.join(current_app.root_path, existing_user.profile_picture.split('?')[0])
            try:
                if os.path.exists(old_path):
                    os.remove(old_path)
            except Exception:
                pass

        update_data['profile_picture'] = f'uploads/{unique_filename}'

    if not update_data:
        return jsonify({'error': 'No data provided'}), 400

    user = user_dao.update_user(user_id, update_data)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200

@user_bp.route('/users/<int:user_id>/followers', methods=['GET'])
def get_followers(user_id):
    followers = follow_dao.get_followers(user_id)
    return jsonify({
        'count': len(followers),
        'followers': [f.to_dict() for f in followers]
    }), 200



@user_bp.route('/users/<int:user_id>/following', methods=['GET'])
def get_following(user_id):
    following = follow_dao.get_following(user_id)
    return jsonify([user.to_dict() for user in following]), 200

@user_bp.route('/users/by_username/<string:username>', methods=['GET'])
def get_user_by_username(username):
    user = user_dao.get_user_by_username(username)
    if not user:
        return {"error": "Usuário não encontrado"}, 404

    user_data = user.to_dict()

    # Verifica se o usuário atual está seguindo
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        from middleware.jwt_util import decode_token
        token = auth_header.split(' ')[1]
        payload = decode_token(token)
        if payload:
            current_user_id = payload['user_id']
            if current_user_id != user.id:
                user_data['is_following'] = follow_dao.is_following(current_user_id, user.id)

    return jsonify(user_data), 200


@user_bp.route('/users/by_usernames', methods=['POST', 'OPTIONS'])
def get_users_by_usernames():
    if request.method == 'OPTIONS':
        return '', 200  # Resposta para preflight CORS

    data = request.get_json()
    if not data or 'usernames' not in data or not isinstance(data['usernames'], list):
        return jsonify({'error': 'Payload inválido, esperado JSON com lista "usernames"'}), 400

    usernames = [u.lower() for u in data['usernames']]
    users = user_dao.get_users_by_usernames(usernames)

    return jsonify([user.to_dict() for user in users]), 200

@user_bp.route('/users/<int:user_id>/followers/list', methods=['GET'])
def get_followers_list(user_id):
    followers = follow_dao.get_followers(user_id)
    result = []
    for user in followers:
        result.append({
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'profile_picture': user.profile_picture
        })
    return jsonify(result), 200
