from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from extensions import db
from models.follow import Follow

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    admin = Column(Boolean, default=False)

    bio = Column(Text, default="")
    profile_picture = Column(String(255), nullable=True)

    posts = relationship("Post", back_populates="user", lazy="dynamic")
    followers = relationship(
        "Follow",
        foreign_keys=[Follow.followed_id],
        back_populates="followed",
        lazy='dynamic',
        cascade="all, delete-orphan"
    )
    following = relationship(
        "Follow",
        foreign_keys=[Follow.follower_id],
        back_populates="follower",
        lazy='dynamic',
        cascade="all, delete-orphan"
    )
    likes = relationship("Like", back_populates="user", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "email": self.email,
            "admin": self.admin,
            "bio": self.bio,
            "profile_picture": self.profile_picture,
            "followers_count": self.followers.count() if self.followers else 0,
            "following_count": self.following.count() if self.following else 0,
            "posts_count": self.posts.count() if self.posts else 0
        }

    def update_from_dict(self, data):
        for field in ['name', 'username', 'email', 'bio', 'profile_picture', 'admin', 'password']:
            if field in data:
                setattr(self, field, data[field])

    def __repr__(self):
        return f"<User {self.id} - {self.name} (@{self.username})>"
