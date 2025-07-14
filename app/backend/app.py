import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from extensions import db
from flask_migrate import Migrate

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Garante que a pasta do banco exista
    os.makedirs(os.path.dirname(Config.DB_PATH), exist_ok=True)

    # Inicializa o db com o app
    db.init_app(app)
    migrate.init_app(app, db)

    # Configura CORS
    CORS(app, supports_credentials=True)

    # Importa e registra blueprints aqui para evitar importação circular
    from router.auth_router import auth_bp
    from router.user_router import user_bp
    from router.post_router import post_bp
    from router.like_router import like_bp
    from router.follow_router import follow_bp 
    from router.comment_router import comment_bp
    from router.notification_router import notification_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(post_bp, url_prefix='/api')
    app.register_blueprint(like_bp, url_prefix='/api')
    app.register_blueprint(follow_bp, url_prefix='/api')
    app.register_blueprint(comment_bp, url_prefix='/api')
    app.register_blueprint(notification_bp, url_prefix='/api')

    # Rota para servir arquivos enviados na pasta uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(app.root_path, 'uploads')
        return send_from_directory(uploads_dir, filename)

    # Importa os modelos para garantir que o SQLAlchemy reconheça todas as tabelas
    with app.app_context():
        from models import User, Notification, Post, Like, Comment, Follow

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)