from flask import Blueprint, request, jsonify
from middleware.jwt_util import token_required
from DAO import notification_dao

notification_bp = Blueprint("notification_bp", __name__)

@notification_bp.route("/notifications", methods=["GET"])
@token_required
def get_notifications():
    user = request.user
    notifications = notification_dao.get_notifications_by_user(user.id)
    return jsonify([n.to_dict() for n in notifications]), 200

@notification_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@token_required
def mark_as_read(notification_id):
    user = request.user
    success = notification_dao.mark_notification_as_read(notification_id)
    if not success:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"message": "Marked as read"}), 200

@notification_bp.route("/notifications/<int:notification_id>", methods=["DELETE"])
@token_required
def delete_notification(notification_id):
    user = request.user
    notification = notification_dao.get_notification_by_id(notification_id)
    if not notification or notification.user_id != user.id:
        return jsonify({"error": "Not found or unauthorized"}), 404

    success = notification_dao.delete_notification(notification_id)
    if success:
        return jsonify({"message": "Notification deleted"}), 200
    return jsonify({"error": "Delete failed"}), 500

@notification_bp.route("/notifications/clear", methods=["DELETE"])
@token_required
def clear_all_notifications():
    user = request.user
    notification_dao.delete_all_notifications_by_user(user.id)
    return jsonify({"message": "All notifications cleared"}), 200
