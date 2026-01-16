"""Scorer API routes."""

from flask import Blueprint, request, jsonify
from services.wall_library_service import get_service

scorer_bp = Blueprint("scorer", __name__)


@scorer_bp.route("/calculate", methods=["POST"])
def calculate():
    """Calculate response scores."""
    try:
        data = request.json
        response = data.get("response", "")
        reference = data.get("reference", "")
        scorer_id = data.get("scorer_id", "default")
        metrics = data.get("metrics", None)
        threshold = float(data.get("threshold", 0.7))
        aggregation = data.get("aggregation", "weighted_average")
        weights = data.get("weights", {})
        
        if not response or not reference:
            return jsonify({"error": "Response and reference are required"}), 400
        
        service = get_service()
        result = service.calculate_scores(
            response=response,
            reference=reference,
            scorer_id=scorer_id,
            metrics=metrics,
            threshold=threshold,
            aggregation=aggregation,
            weights=weights,
        )
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
