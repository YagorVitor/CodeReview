from models.comment import Comment
from extensions import db

def create_comment(post_id, user_id, content, parent_id=None):
    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=content,
        parent_id=parent_id
    )
    db.session.add(comment)
    db.session.commit()
    return comment

def get_comment_by_id(comment_id):
    return Comment.query.get(comment_id)

def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if comment:
        db.session.delete(comment)
        db.session.commit()
        return True
    return False
