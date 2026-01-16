"""Guard API routes."""

from flask import Blueprint, request, jsonify
from services.wall_library_service import get_service

guard_bp = Blueprint("guard", __name__)


@guard_bp.route("/validate", methods=["POST"])
def validate():
    """Validate text using Wall Guard."""
    try:
        data = request.json
        text = data.get("text", "")
        guard_id = data.get("guard_id", "default")
        validators = data.get("validators", [])
        num_reasks = int(data.get("num_reasks", 0))
        name = data.get("name")
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        service = get_service()
        result = service.validate_with_guard(
            text=text,
            guard_id=guard_id,
            validators=validators,
            num_reasks=num_reasks,
            name=name,
        )
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
