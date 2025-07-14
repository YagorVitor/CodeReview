from flask import Blueprint, request, jsonify
from middleware.jwt_util import token_required
from DAO import comment_dao, post_dao, notification_dao

comment_bp = Blueprint('comment_bp', __name__)

@comment_bp.route('/comments/<int:post_id>', methods=['POST'])
@token_required
def add_comment(post_id):
    current_user = request.user
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Conteúdo do comentário ausente'}), 400

    content = data['content'].strip()
    if not content:
        return jsonify({'error': 'Comentário vazio'}), 400

    parent_id = data.get('parent_id')  # pode ser None

    comment = comment_dao.create_comment(
        post_id=post_id,
        user_id=current_user.id,
        content=content,
        parent_id=parent_id
    )

    # Notifica o autor do post, se não for o próprio usuário
    post = post_dao.get_post_by_id(post_id)
    if post and post.user_id != current_user.id:
        notification_dao.create_notification(
            user_id=post.user_id,
            type="comment",
            message=f"{current_user.username} comentou no seu post."
        )

    return jsonify(comment.to_dict()), 201


@comment_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(comment_id):
    current_user = request.user
    comment = comment_dao.get_comment_by_id(comment_id)

    if not comment:
        return jsonify({'error': 'Comentário não encontrado'}), 404

    if comment.user_id != current_user.id and not current_user.admin:
        return jsonify({'error': 'Permissão negada'}), 403

    success = comment_dao.delete_comment(comment_id)
    if success:
        return jsonify({'message': 'Comentário deletado'}), 200
    return jsonify({'error': 'Falha ao deletar'}), 500
