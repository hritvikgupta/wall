"""RAG API routes."""

from flask import Blueprint, request, jsonify
from services.wall_library_service import get_service

rag_bp = Blueprint("rag", __name__)


@rag_bp.route("/retrieve", methods=["POST"])
def retrieve():
    """Retrieve documents using RAG."""
    try:
        data = request.json
        query = data.get("query", "")
        rag_id = data.get("rag_id", "default")
        top_k = int(data.get("top_k", 5))
        collection_name = data.get("collection_name", "playground_collection")
        embedding_provider = data.get("embedding_provider", "sentence-transformers")
        embedding_model_name = data.get("embedding_model_name")
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        service = get_service()
        result = service.retrieve_rag(
            query=query,
            rag_id=rag_id,
            top_k=top_k,
            collection_name=collection_name,
            embedding_provider=embedding_provider,
            embedding_model_name=embedding_model_name,
        )
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
