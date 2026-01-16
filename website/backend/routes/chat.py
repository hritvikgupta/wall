"""Chat routes for LLM interactions with guard validation."""

from flask import Blueprint, request, jsonify
from services.wall_library_service import get_service

chat_bp = Blueprint("chat", __name__)
wall_library_service = get_service()


@chat_bp.route("/chat", methods=["POST"])
def chat():
    """Chat with LLM using guard validation."""
    data = request.json
    
    prompt = data.get("prompt", "")
    llm_config = data.get("llm_config", {})
    guard_config = data.get("guard_config")
    guard_id = data.get("guard_id", "default")
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    if not llm_config:
        return jsonify({"error": "LLM configuration is required"}), 400
    
    result = wall_library_service.chat_with_llm(
        prompt=prompt,
        llm_config=llm_config,
        guard_config=guard_config,
        guard_id=guard_id,
    )
    
    return jsonify(result)
