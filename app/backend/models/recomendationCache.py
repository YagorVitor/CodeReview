from extensions import db
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from datetime import datetime

class RecommendationCache(db.Model):
    """Cache de recomendações com TTL e versionamento."""
    __tablename__ = 'recommendation_cache'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    algorithm = Column(String(50), nullable=False, index=True)
    recommendations = Column(JSON, nullable=False) # Lista de post_ids com scores
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    version = Column(String(32), nullable=False) # Hash dos parâmetros do modelo

    # Índice composto para busca eficiente
    __table_args__ = (db.Index('idx_user_algorithm_version', 'user_id', 'algorithm', 'version'),)
    
    def to_dict(self):
        return {
        'id': self.id,
        'user_id': self.user_id,
        'algorithm': self.algorithm,
        'recommendations': self.recommendations,
        'created_at': self.created_at.isoformat(),
        'expires_at': self.expires_at.isoformat(),
        'version': self.version
        }