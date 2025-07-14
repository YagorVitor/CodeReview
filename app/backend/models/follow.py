from datetime import datetime
from extensions import db
from sqlalchemy import Column, Integer, DateTime, ForeignKey

class Follow(db.Model):
    __tablename__ = 'follows'

    id = Column(Integer, primary_key=True)
    follower_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    followed_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relação para acessar o usuário que segue
    follower = db.relationship(
        "User",
        foreign_keys=[follower_id],
        back_populates="following"
    )
    # Relação para acessar o usuário que é seguido
    followed = db.relationship(
        "User",
        foreign_keys=[followed_id],
        back_populates="followers"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "follower_id": self.follower_id,
            "followed_id": self.followed_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Follow id={self.id} follower_id={self.follower_id} followed_id={self.followed_id}>"
