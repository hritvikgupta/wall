"""API routes."""

from typing import Dict, Any
from flask import Flask, request, jsonify

from wall_library.guard import WallGuard
from wall_library.classes.validation_outcome import ValidationOutcome
from wall_library.logger import logger

# In-memory guard registry (would use persistent storage in production)
_guards: Dict[str, WallGuard] = {}


def register_routes(app: Flask):
    """Register API routes.

    Args:
        app: Flask application
    """

    @app.route("/guards/<guard_name>/validate", methods=["POST"])
    def validate(guard_name: str):
        """Validate text endpoint."""
        if guard_name not in _guards:
            return jsonify({"error": f"Guard {guard_name} not found"}), 404

        data = request.json
        text = data.get("text", "")

        guard = _guards[guard_name]
        outcome = guard.validate(text)

        return jsonify({
            "validated_output": outcome.validated_output,
            "raw_output": outcome.raw_output,
            "validation_passed": outcome.validation_passed,
            "metadata": outcome.metadata,
        })

    @app.route("/guards/<guard_name>/openai/v1/chat/completions", methods=["POST"])
    def openai_chat_completions(guard_name: str):
        """OpenAI-compatible chat completions endpoint."""
        if guard_name not in _guards:
            return jsonify({"error": f"Guard {guard_name} not found"}), 404

        # Simplified OpenAI-compatible response
        return jsonify({
            "id": "chatcmpl-123",
            "object": "chat.completion",
            "created": 1234567890,
            "model": "gpt-3.5-turbo",
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "This is a placeholder response",
                },
                "finish_reason": "stop",
            }],
        })

