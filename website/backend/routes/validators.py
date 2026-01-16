"""Validators API routes."""

from flask import Blueprint, request, jsonify
from services.wall_library_service import get_service

validators_bp = Blueprint("validators", __name__)


@validators_bp.route("/test", methods=["POST"])
def test():
    """Test a single validator."""
    try:
        data = request.json
        text = data.get("text", "")
        validator_type = data.get("validator_type", "")
        validator_params = data.get("validator_params", {})
        
        if not text or not validator_type:
            return jsonify({"error": "Text and validator_type are required"}), 400
        
        service = get_service()
        result = service.test_validator(
            text=text,
            validator_type=validator_type,
            validator_params=validator_params,
        )
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@validators_bp.route("/list", methods=["GET"])
def list_validators():
    """List available validators."""
    try:
        service = get_service()
        validators = service.list_validators()
        return jsonify({"validators": validators}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
