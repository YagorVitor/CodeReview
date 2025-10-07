# app/services/recommendation_service.py
#From project
from typing import List, Dict, Tuple, Optional
from models import User, Post, Like, Comment, recomendationCache
from datetime import datetime, timedelta
from extensions import db

"""
Apenas quando forem codificados
from algorithms.collaborative_filtering import UserBasedCF, ItemBasedCF
from algorithms.content_based import ContentBasedTFIDF, ContentBasedEmbeddings
from algorithms.hybrid import AdaptiveHybridRecommender
from services.cache_service import CacheService
from services.analytics_service import AnalyticsService
"""

#From libs
import pandas as pd
import numpy as np
import hashlib
import json
import logging

