"""Flask application for Wall Library Playground API."""

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import route blueprints
from routes.guard import guard_bp
from routes.context import context_bp
from routes.rag import rag_bp
from routes.scorer import scorer_bp
from routes.validators import validators_bp
from routes.monitor import monitor_bp
from routes.visualization import visualization_bp
from routes.chat import chat_bp
from routes.config import config_bp


def create_app():
    """Create and configure Flask application."""
    app = Flask(__name__)
    
    # Configure CORS
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:3001").split(",")
    # Clean up any whitespace from origins
    cors_origins = [origin.strip() for origin in cors_origins]
    CORS(app, origins=cors_origins, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
    
    # Register blueprints
    app.register_blueprint(guard_bp, url_prefix="/api/guard")
    app.register_blueprint(context_bp, url_prefix="/api/context")
    app.register_blueprint(rag_bp, url_prefix="/api/rag")
    app.register_blueprint(scorer_bp, url_prefix="/api/scorer")
    app.register_blueprint(validators_bp, url_prefix="/api/validators")
    app.register_blueprint(monitor_bp, url_prefix="/api/monitor")
    app.register_blueprint(visualization_bp, url_prefix="/api/visualization")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(config_bp, url_prefix="/api")
    
    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health():
        """Health check endpoint."""
        return {"status": "healthy", "service": "wall-library-playground-api"}, 200
    
    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
