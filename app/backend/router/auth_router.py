from flask import Blueprint, request, jsonify
from DAO import user_dao
from bcrypt import checkpw
from middleware.jwt_util import generate_token

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400

    user = user_dao.get_user_by_email(data['email'])
    if user and checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        token = generate_token(user)
        user_dict = user.to_dict()
        user_dict.pop('password', None)  # nunca enviar senha ao cliente
        return jsonify({'token': token, 'user': user_dict}), 200

    return jsonify({'error': 'Credenciais inválidas'}), 401
