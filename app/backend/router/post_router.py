from flask import Blueprint, request, jsonify
from DAO import post_dao
from middleware.jwt_util import token_required
import os
import uuid
from flask import current_app

post_bp = Blueprint('post_bp', __name__)

@post_bp.route('/posts', methods=['GET'])
@token_required
def get_all_posts():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    current_user = request.user

    posts = post_dao.get_all_posts_paginated(page, per_page)
    posts_dict = [post.to_dict(current_user) for post in posts]

    return jsonify(posts_dict), 200

@post_bp.route('/posts', methods=['POST'])
@token_required
def create_post():
    """
    Cria um novo post com suporte a texto e imagem.
    Espera `multipart/form-data` com campos:
      - content: texto opcional
      - description: descrição opcional
      - reply_id: id opcional (inteiro)
      - image: arquivo de imagem (opcional)
    """
    user = request.user

    if not request.content_type.startswith("multipart/form-data"):
        return jsonify({'error': 'Content-Type must be multipart/form-data'}), 400

    content = request.form.get('content', '').strip()
    description = request.form.get('description', '').strip()
    reply_id = request.form.get('reply_id')
    image_file = request.files.get('image')

    if not content and not image_file:
        return jsonify({'error': 'Content or image is required'}), 400

    image_url = None

    # Se houver imagem, salvar
    if image_file:
        ext = image_file.filename.rsplit('.', 1)[-1].lower()
        if ext not in {'jpg', 'jpeg', 'png', 'gif'}:
            return jsonify({'error': 'Unsupported image type'}), 400

        filename = f"{uuid.uuid4().hex}.{ext}"
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)

        try:
            image_file.save(filepath)
        except Exception:
            return jsonify({'error': 'Failed to save image'}), 500

        image_url = f"uploads/{filename}"  # ✅ salva no campo separado

    # Processar reply_id
    if reply_id:
        try:
            reply_id = int(reply_id)
        except ValueError:
            return jsonify({'error': 'reply_id must be an integer'}), 400
    else:
        reply_id = None

    post_data = {
        'user_id': user.id,
        'content': content,
        'description': description,
        'reply_id': reply_id,
        'image_url': image_url  # ✅ incluído no post_data
    }

    post = post_dao.create_post(post_data)
    return jsonify(post.to_dict(current_user=user)), 201


@post_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = post_dao.get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    return jsonify(post.to_dict()), 200

@post_bp.route('/posts/<int:post_id>', methods=['PUT'])
@token_required
def update_post(post_id):
    """Atualiza um post se o usuário for autor ou admin."""
    user = request.user
    post = post_dao.get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    if user.id != post.user_id and not user.admin:
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    allowed_fields = {'content', 'description', 'reply_id'}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    post = post_dao.update_post(post_id, update_data)
    return jsonify(post.to_dict()), 200

@post_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@token_required
def delete_post(post_id):
    """Deleta post se o usuário for autor ou admin."""
    user = request.user
    post = post_dao.get_post_by_id(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    if user.id != post.user_id and not user.admin:
        return jsonify({'error': 'Unauthorized access'}), 403

    success = post_dao.delete_post(post_id)
    if success:
        return jsonify({'message': 'Post deleted'}), 200
    return jsonify({'error': 'Delete failed'}), 500

@post_bp.route('/posts/user/<int:user_id>', methods=['GET'])
def get_posts_by_user_id(user_id):
    """Retorna posts do usuário, paginados."""
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    posts = post_dao.get_posts_by_user_id_paginated(user_id, page, per_page)
    return jsonify([post.to_dict() for post in posts]), 200

@post_bp.route('/posts/reply/<int:reply_id>', methods=['GET'])
def get_posts_by_reply_id(reply_id):
    """Retorna posts que são respostas a outro post."""
    posts = post_dao.get_posts_by_reply_id(reply_id)
    return jsonify([post.to_dict() for post in posts]), 200
