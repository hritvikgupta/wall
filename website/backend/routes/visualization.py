"""Visualization API routes."""

from flask import Blueprint, request, jsonify
from services.wall_library_service import get_service

visualization_bp = Blueprint("visualization", __name__)


@visualization_bp.route("/data", methods=["GET"])
def get_data():
    """Get visualization data."""
    try:
        # For now, return sample visualization data
        # In production, this would aggregate data from monitoring/validation results
        data = {
            "scores": [
                {"x": 0.1, "y": 0.2, "z": 0.3, "label": "Response 1"},
                {"x": 0.4, "y": 0.5, "z": 0.6, "label": "Response 2"},
                {"x": 0.7, "y": 0.8, "z": 0.9, "label": "Response 3"},
            ],
            "context_boundaries": {
                "inside": 75,
                "outside": 25,
            },
            "word_frequencies": {
                "wall": 10,
                "library": 8,
                "guard": 6,
                "validation": 5,
            },
        }
        
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
