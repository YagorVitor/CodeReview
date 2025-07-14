from models.notification import Notification
from extensions import db

def create_notification(user_id, type, message, actor_id=None):
    notification = Notification(
        user_id=user_id,
        type=type,
        message=message,
        actor_id=actor_id
    )
    db.session.add(notification)
    db.session.commit()
    return notification

def get_notifications_by_user(user_id, limit=50):
    return Notification.query.filter_by(user_id=user_id)\
        .order_by(Notification.created_at.desc())\
        .limit(limit).all()

def get_notification_by_id(notification_id):
    return Notification.query.get(notification_id)


def get_unread_count(user_id):
    return Notification.query.filter_by(user_id=user_id, read=False).count()

def mark_notification_as_read(notification_id):
    notification = Notification.query.get(notification_id)
    if notification:
        notification.read = True
        db.session.commit()
        return True
    return False

def delete_notification(notification_id):
    notification = Notification.query.get(notification_id)
    if notification:
        db.session.delete(notification)
        db.session.commit()
        return True
    return False

def delete_all_notifications_by_user(user_id):
    Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()