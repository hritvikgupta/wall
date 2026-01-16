"""Context Manager API routes."""

from flask import Blueprint, request, jsonify
from services.wall_library_service import get_service

context_bp = Blueprint("context", __name__)


@context_bp.route("/check", methods=["POST"])
def check():
    """Check if text is within context boundaries."""
    try:
        data = request.json
        text = data.get("text", "")
        context_id = data.get("context_id", "default")
        keywords = data.get("keywords", [])
        approved_contexts = data.get("approved_contexts", [])
        threshold = float(data.get("threshold", 0.7))
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        service = get_service()
        result = service.check_context(
            text=text,
            context_id=context_id,
            keywords=keywords,
            approved_contexts=approved_contexts,
            threshold=threshold,
        )
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
