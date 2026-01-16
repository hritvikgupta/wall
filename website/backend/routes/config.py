"""Config API routes."""

import os
from flask import Blueprint, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

config_bp = Blueprint("config", __name__)


@config_bp.route("/config/llm", methods=["GET"])
def get_llm_config():
    """Get LLM configuration from environment variables.
    
    Returns LLM config without exposing sensitive data unnecessarily.
    This endpoint allows the frontend to auto-populate LLM settings.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    model = os.getenv("LLM_MODEL", os.getenv("OPENAI_MODEL", "gpt-4o"))
    base_url = os.getenv("OPENAI_BASE_URL", os.getenv("BASE_URL", ""))
    
    # Determine provider based on available config
    provider = "openai"
    if os.getenv("ANTHROPIC_API_KEY"):
        provider = "anthropic"
    
    return jsonify({
        "provider": provider,
        "model": model,
        "api_key": api_key if api_key else None,  # Return None if not set (don't expose empty strings)
        "base_url": base_url if base_url else None,
    })
