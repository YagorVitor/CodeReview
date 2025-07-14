from extensions import db
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, backref
from datetime import datetime

class Comment(db.Model):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    parent_id = Column(Integer, ForeignKey('comments.id'), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", backref="comments")
    replies = relationship(
        "Comment",
        backref=backref("parent", remote_side=[id]),
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "user_id": self.user_id,
            "parent_id": self.parent_id,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "name": self.author.name,
                "profile_picture": self.author.profile_picture
            } if self.author else None,
            "replies": [reply.to_dict() for reply in self.replies]
        }
