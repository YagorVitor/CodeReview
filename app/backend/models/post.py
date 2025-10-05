from extensions import db
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

class Post(db.Model):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id  = Column(Integer, ForeignKey('users.id'), nullable=False)
    reply_id = Column(Integer, ForeignKey('posts.id'), nullable=True)
    content  = Column(Text, nullable=True)
    description  = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)

    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

    user = relationship("User", back_populates="posts")
    reply = relationship("Post", remote_side=[id], back_populates="replies")
    replies = relationship("Post", back_populates="reply", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", backref="post", cascade="all, delete-orphan")

    def to_dict(self, current_user=None, include_comments=True):
        is_following = False
        if current_user and self.user:
            is_following = self.user.followers.filter_by(follower_id=current_user.id).count() > 0

        liked_by_user = False
        if current_user:
            liked_by_user = any(like.user_id == current_user.id for like in self.likes)

        data = {
            'id': self.id,
            'user_id': self.user_id,
            'reply_id': self.reply_id,
            'content': self.content,
            'description': self.description,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'likes_count': len(self.likes),
            'liked_by_user': liked_by_user,
            'author': {
                'id': self.user.id,
                'name': self.user.name,
                'username': self.user.username,
                'profile_picture': self.user.profile_picture or None,
                'is_following': is_following
            } if self.user else None,
        }

        if include_comments:
            data['comments'] = [
                comment.to_dict()
                for comment in self.comments
                if comment.parent_id is None
            ]


        return data

    def __repr__(self):
        return f"<Post {self.id} by User {self.user_id}>"
