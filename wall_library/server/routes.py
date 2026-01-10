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

    @app.route("/context/check", methods=["POST"])
    def check_context_route():
        """Check context endpoint."""
        data = request.json
        text = data.get("text", "")
        approved_contexts = data.get("approved_contexts", [])
        keywords = data.get("keywords", [])
        threshold = data.get("threshold", 0.7)
        use_advanced = data.get("use_advanced_algo", False)
        
        # LLM params
        llm_provider = data.get("llm_provider")
        llm_model = data.get("llm_model")
        llm_prompt = data.get("llm_prompt_template")
        openai_api_key = data.get("openai_api_key")
        llm_temperature = float(data.get("llm_temperature", 0.0))
        strategy = data.get("strategy", "heuristic") # "heuristic" or "llm_check"

        # Initialize Context Manager
        from wall_library.nlp.context_manager import ContextManager
        cm = ContextManager()
        if approved_contexts:
            cm.add_string_list(approved_contexts)
        if keywords:
            cm.add_keywords(keywords)

        # Setup LLM callable if requested
        llm_call = None
        if llm_provider == "openai":
            # For llm_check, we definitely need this
            try:
                import openai
                if openai_api_key:
                    openai.api_key = openai_api_key
                
                def openai_call(prompt: str) -> str:
                    client = openai.OpenAI(api_key=openai_api_key) if openai_api_key else openai.OpenAI()
                    response = client.chat.completions.create(
                        model=llm_model or "gpt-3.5-turbo",
                        messages=[{"role": "user", "content": prompt}],
                        temperature=llm_temperature
                    )
                    return response.choices[0].message.content or ""
                
                llm_call = openai_call
            except ImportError:
                logger.warning("OpenAI requested but not installed")
            except Exception as e:
                logger.error(f"Failed to setup OpenAI: {e}")

        # Check context
        is_valid = cm.check_context(
            text=text,
            threshold=threshold,
            use_advanced_algo=use_advanced,
            llm_call=llm_call,
            llm_prompt_template=llm_prompt,
            strategy=strategy
        )

        # Get similarity details for debugging/visualization
        similarities = []
        max_sim = 0.0
        if cm.contexts:
            for ctx in cm.contexts:
                sim = cm.similarity_engine.cosine_similarity(text, ctx)
                # If using advanced, show the hybrid score
                if use_advanced:
                    lex = cm.similarity_engine._simple_cosine_similarity(text, ctx)
                    sim = (0.7 * sim) + (0.3 * lex)
                
                similarities.append({
                    "context": ctx,
                    "similarity": sim
                })
                max_sim = max(max_sim, sim)
        
        # Sort similarities by score desc
        similarities.sort(key=lambda x: x["similarity"], reverse=True)

        return jsonify({
            "is_valid": is_valid,
            "threshold": threshold,
            "similarities": similarities[:5],  # Top 5
            "max_similarity": max_sim
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


    @app.route("/context/check_image", methods=["POST"])
    def check_image_context_route():
        """Check image context endpoint."""
        data = request.json
        image_data = data.get("image", "") # URL or Base64
        approved_contexts = data.get("approved_contexts", [])
        keywords = data.get("keywords", [])
        
        # LLM params
        llm_provider = data.get("llm_provider", "openai")
        llm_model = data.get("llm_model", "gpt-4-vision-preview")
        llm_prompt = data.get("llm_prompt_template")
        openai_api_key = data.get("openai_api_key")
        llm_temperature = float(data.get("llm_temperature", 0.0))

        # Initialize Context Manager
        from wall_library.nlp.context_manager import ContextManager
        cm = ContextManager()
        if approved_contexts:
            cm.add_string_list(approved_contexts)
        if keywords:
            cm.add_keywords(keywords)
        
        # Define VLLM Call
        vllm_call = None
        if llm_provider == "openai":
            try:
                import openai
                if openai_api_key:
                    openai.api_key = openai_api_key
                
                def openai_vllm_call(prompt: str, image: str) -> str:
                    client = openai.OpenAI(api_key=openai_api_key) if openai_api_key else openai.OpenAI()
                    
                    # Determine image content type
                    image_content = {}
                    if image.startswith("http"):
                        image_content = {"type": "image_url", "image_url": {"url": image}}
                    else:
                        # Assume base64 or add prefix if needed
                        # If raw base64, usually needs "data:image/jpeg;base64," prefix for OpenAI?
                        # Let's trust the input is formatted or handle it simply
                        url_val = image if image.startswith("data:") else f"data:image/jpeg;base64,{image}"
                        image_content = {"type": "image_url", "image_url": {"url": url_val}}

                    response = client.chat.completions.create(
                        model=llm_model,
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": prompt},
                                    image_content,
                                ],
                            }
                        ],
                        max_tokens=300,
                        temperature=llm_temperature
                    )
                    return response.choices[0].message.content or ""
                
                vllm_call = openai_vllm_call
            except ImportError:
                return jsonify({"error": "OpenAI library not installed"}), 500
        
        if not vllm_call:
             return jsonify({"error": "Valid LLM provider not configured"}), 400

        # Check Context
        is_valid = cm.check_image_context(
            image=image_data,
            vllm_call=vllm_call,
            prompt_template=llm_prompt or "Context:\n{context}\n\nIs this image consistent with or allowed by the above context? Answer only 'yes' or 'no'."
        )

        return jsonify({
            "is_valid": is_valid,
            "provider": llm_provider
        })
