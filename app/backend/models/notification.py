from extensions import db
from datetime import datetime

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)  # quem recebe
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"))  # quem causou
    type = db.Column(db.String(20), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    actor_user = db.relationship("User", foreign_keys=[actor_id])

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "message": self.message,
            "read": self.read,
            "created_at": self.created_at.isoformat(),
            "actor": {
                "id": self.actor_user.id,
                "username": self.actor_user.username,
                "name": self.actor_user.name,
                "profile_picture": self.actor_user.profile_picture
            } if self.actor_user else None
        }
