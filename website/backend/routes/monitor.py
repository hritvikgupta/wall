"""Monitor API routes."""

from flask import Blueprint, request, jsonify
from datetime import datetime

monitor_bp = Blueprint("monitor", __name__)

# In-memory storage for monitoring data (would use database in production)
_monitoring_data = {
    "total_interactions": 0,
    "successful_interactions": 0,
    "failed_interactions": 0,
    "latencies": [],
    "errors": {},
    "interactions": [],
}


@monitor_bp.route("/track", methods=["POST"])
def track():
    """Track LLM interaction."""
    try:
        data = request.json
        input_data = data.get("input", "")
        output = data.get("output", "")
        metadata = data.get("metadata", {})
        latency = float(data.get("latency", 0.0))
        
        # Update statistics
        _monitoring_data["total_interactions"] += 1
        if metadata.get("validation_passed", True):
            _monitoring_data["successful_interactions"] += 1
        else:
            _monitoring_data["failed_interactions"] += 1
        
        if latency > 0:
            _monitoring_data["latencies"].append(latency)
            # Keep only last 1000 latencies
            if len(_monitoring_data["latencies"]) > 1000:
                _monitoring_data["latencies"] = _monitoring_data["latencies"][-1000:]
        
        # Track errors
        if "error" in metadata:
            error_type = metadata["error"].get("type", "Unknown")
            _monitoring_data["errors"][error_type] = _monitoring_data["errors"].get(error_type, 0) + 1
        
        # Store interaction
        interaction = {
            "timestamp": datetime.now().isoformat(),
            "input": input_data,
            "output": output,
            "latency": latency,
            "metadata": metadata,
        }
        _monitoring_data["interactions"].append(interaction)
        # Keep only last 100 interactions
        if len(_monitoring_data["interactions"]) > 100:
            _monitoring_data["interactions"] = _monitoring_data["interactions"][-100:]
        
        return jsonify({"status": "tracked"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@monitor_bp.route("/stats", methods=["GET"])
def stats():
    """Get monitoring statistics."""
    try:
        latencies = _monitoring_data["latencies"]
        avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
        
        total = _monitoring_data["total_interactions"]
        success_rate = (
            (_monitoring_data["successful_interactions"] / total * 100)
            if total > 0
            else 0.0
        )
        
        return jsonify({
            "total_interactions": total,
            "successful_interactions": _monitoring_data["successful_interactions"],
            "failed_interactions": _monitoring_data["failed_interactions"],
            "success_rate": round(success_rate, 2),
            "avg_latency": round(avg_latency, 3),
            "errors": _monitoring_data["errors"],
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
