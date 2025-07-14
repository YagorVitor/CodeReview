from extensions import db
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

class Like(db.Model):
    __tablename__ = 'likes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)

    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'post_id': self.post_id
        }

    def __repr__(self):
        return f"<Like {self.id} user_id={self.user_id} post_id={self.post_id}>"
