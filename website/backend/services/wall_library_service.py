"""Service layer for wall-library operations."""

from typing import Dict, Any, List, Optional
import tempfile
import shutil
import re
from wall_library import WallGuard, OnFailAction
from wall_library.nlp import ContextManager
from wall_library.rag import RAGRetriever, ChromaDBClient
from wall_library.scoring import ResponseScorer, CosineSimilarityMetric, SemanticSimilarityMetric, ROUGEMetric, BLEUMetric
from wall_library.validator_base import Validator, register_validator, get_validator
from wall_library.classes.validation.validation_result import PassResult, FailResult


# Register test validators for playground
@register_validator("test_length")
class TestLengthValidator(Validator):
    """Test length validator for playground."""
    
    def __init__(self, min_length: int = 0, max_length: int = 1000, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.min_length = min_length
        self.max_length = max_length
        self.rail_alias = "test_length"
    
    def _validate(self, value: Any, metadata: dict):
        if not isinstance(value, str):
            return FailResult(
                error_message=f"Value must be a string, got {type(value).__name__}",
                metadata=metadata,
            )
        length = len(value)
        if length < self.min_length:
            return FailResult(
                error_message=f"Value too short. Minimum length: {self.min_length}, got: {length}",
                metadata=metadata,
            )
        if length > self.max_length:
            return FailResult(
                error_message=f"Value too long. Maximum length: {self.max_length}, got: {length}",
                metadata=metadata,
            )
        return PassResult(metadata=metadata)


@register_validator("test_safety")
class TestSafetyValidator(Validator):
    """Test safety validator that blocks unsafe keywords."""
    
    def __init__(self, restricted_terms: Optional[List[str]] = None, **kwargs):
        super().__init__(require_rc=False, **kwargs)
        self.restricted_terms = restricted_terms or ['hack', 'steal', 'bomb', 'kill', 'ignore previous']
        self.rail_alias = "test_safety"
    
    def _validate(self, value: Any, metadata: dict):
        if not isinstance(value, str):
            return PassResult(metadata=metadata)
        
        value_lower = value.lower()
        found_terms = []
        
        # Use word boundary matching to prevent false positives
        # e.g., "kill" won't match in "skills" or "killing"
        for term in self.restricted_terms:
            term_lower = term.lower()
            
            # Handle multi-word phrases differently
            if ' ' in term_lower:
                # For multi-word phrases, split into words and build a flexible pattern
                # that allows spaces and punctuation between words
                words = term_lower.split()
                # Escape each word separately
                escaped_words = [re.escape(word) for word in words]
                # Create pattern: word boundaries at start/end, flexible spacing in middle
                # This matches "Hello, World!" or "Hello World" or "hello  world"
                pattern = r'\b' + r'[\s,\.!?;:\-]*'.join(escaped_words) + r'\b'
            else:
                # For single words, use strict word boundary matching
                escaped_term = re.escape(term_lower)
                pattern = r'\b' + escaped_term + r'\b'
            
            if re.search(pattern, value_lower):
                found_terms.append(term)
        
        if found_terms:
            return FailResult(
                error_message=f"Unsafe content detected. Restricted terms found: {', '.join(found_terms)}",
                metadata=metadata,
            )
        return PassResult(metadata=metadata)


class WallLibraryService:
    """Service for wall-library operations."""
    
    def __init__(self):
        """Initialize service."""
        self.guards: Dict[str, WallGuard] = {}
        self.context_managers: Dict[str, ContextManager] = {}
        self.rag_retrievers: Dict[str, RAGRetriever] = {}
        self.scorers: Dict[str, ResponseScorer] = {}
        self.temp_dirs: Dict[str, str] = {}
    
    def validate_with_guard(
        self,
        text: str,
        guard_id: str = "default",
        validators: Optional[List[Dict[str, Any]]] = None,
        num_reasks: int = 0,
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Validate text using Wall Guard.
        
        Args:
            text: Text to validate
            guard_id: Guard identifier
            validators: List of validator configurations
            num_reasks: Maximum number of re-asks
            name: Guard name
            
        Returns:
            Validation result
        """
        if guard_id not in self.guards:
            guard = WallGuard(num_reasks=num_reasks, name=name)
            
            # Add validators if provided
            if validators:
                for validator_config in validators:
                    validator_type = validator_config.get("type")
                    if not validator_type:
                        continue
                    
                    validator_params = validator_config.get("params", {})
                    # Note: require_rc is handled by the validator's __init__ method, don't add it to params
                    on_fail = OnFailAction.get(validator_config.get("on_fail", "exception"))
                    apply_on = validator_config.get("on", "output")
                    
                    # Get validator class
                    validator_cls = get_validator(validator_type)
                    if validator_cls:
                        guard.use((validator_cls, validator_params, on_fail), on=apply_on)
            
            self.guards[guard_id] = guard
        
        guard = self.guards[guard_id]
        
        # First, validate input if there are input validators
        input_validators = guard.validator_map.get("input", [])
        if input_validators:
            from wall_library.validator_service.sequential_validator_service import SequentialValidatorService
            service = SequentialValidatorService()
            input_validation_results = []
            for validator in input_validators:
                result = validator.validate(text, metadata={})
                input_validation_results.append(result)
            
            input_validation_passed = all(r.is_pass for r in input_validation_results)
            if not input_validation_passed:
                error_messages = [
                    r.error_message
                    for r in input_validation_results
                    if r.is_fail and hasattr(r, "error_message")
                ]
                return {
                    "validated_output": None,
                    "raw_output": text,
                    "validation_passed": False,
                    "metadata": {
                        "validation_results": [{"validator": v.__class__.__name__, "passed": r.is_pass, "error": r.error_message if hasattr(r, "error_message") else None} 
                                              for v, r in zip(input_validators, input_validation_results)],
                        "error_message": f"Input validation failed: {', '.join(error_messages)}",
                        "validation_stage": "input"
                    },
                }
        
        # Then validate output (this is what guard.validate() does)
        outcome = guard.validate(text)
        
        return {
            "validated_output": outcome.validated_output,
            "raw_output": outcome.raw_output,
            "validation_passed": outcome.validation_passed,
            "metadata": outcome.metadata or {},
        }
    
    def check_context(
        self,
        text: str,
        context_id: str = "default",
        keywords: Optional[List[str]] = None,
        approved_contexts: Optional[List[str]] = None,
        threshold: float = 0.7,
    ) -> Dict[str, Any]:
        """Check if text is within context boundaries.
        
        Args:
            text: Text to check
            context_id: Context manager identifier
            keywords: List of keywords
            approved_contexts: List of approved context strings
            threshold: Similarity threshold
            
        Returns:
            Context check result
        """
        if context_id not in self.context_managers:
            context_manager = ContextManager()
            if keywords:
                context_manager.add_keywords(keywords)
            if approved_contexts:
                context_manager.add_string_list(approved_contexts)
            self.context_managers[context_id] = context_manager
        
        context_manager = self.context_managers[context_id]
        is_valid = context_manager.check_context(text, threshold=threshold)
        
        # Calculate similarity scores
        similarities = []
        if context_manager.contexts:
            for ctx in context_manager.contexts:
                sim = context_manager.similarity_engine.cosine_similarity(text, ctx)
                similarities.append({"context": ctx, "similarity": float(sim)})
        
        return {
            "is_valid": is_valid,
            "threshold": threshold,
            "similarities": similarities,
            "max_similarity": max([s["similarity"] for s in similarities]) if similarities else 0.0,
        }
    
    def retrieve_rag(
        self,
        query: str,
        rag_id: str = "default",
        top_k: int = 5,
        collection_name: str = "playground_collection",
        embedding_provider: str = "sentence-transformers",
        embedding_model_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve documents using RAG.
        
        Args:
            query: Query string
            rag_id: RAG retriever identifier
            top_k: Number of results to return
            collection_name: ChromaDB collection name
            
        Returns:
            Retrieval results
        """
        if rag_id not in self.rag_retrievers:
            # Create temporary directory for ChromaDB
            temp_dir = tempfile.mkdtemp()
            self.temp_dirs[rag_id] = temp_dir
            
            chromadb_client = ChromaDBClient(
                collection_name=collection_name,
                persist_directory=temp_dir,
            )
            
            # Create embedding service
            from wall_library.rag.embedding_service import EmbeddingService
            embedding_service = EmbeddingService(
                provider=embedding_provider,
                model_name=embedding_model_name,
            )
            
            # Add some sample documents for testing
            sample_questions = [
                "What is Wall Library?",
                "How does Wall Guard work?",
                "What is semantic validation?",
                "How to use RAG retriever?",
            ]
            sample_answers = [
                "Wall Library is a comprehensive Python framework acting as a firewall for LLM applications.",
                "Wall Guard executes multiple validators in sequence to ensure safety and compliance.",
                "Semantic validation uses NLP techniques to analyze the meaning of input, not just keywords.",
                "RAG retriever integrates with ChromaDB to provide knowledge grounding for responses.",
            ]
            chromadb_client.add_qa_pairs(
                questions=sample_questions,
                answers=sample_answers,
            )
            
            retriever = RAGRetriever(
                chromadb_client=chromadb_client,
                embedding_service=embedding_service,
                top_k=top_k
            )
            self.rag_retrievers[rag_id] = retriever
        
        retriever = self.rag_retrievers[rag_id]
        results = retriever.retrieve(query, top_k=top_k)
        
        return {
            "query": query,
            "results": [
                {
                    "document": r.get("document", ""),
                    "metadata": r.get("metadata", {}),
                    "score": float(r.get("score", 0.0)),
                    "distance": float(r.get("distance", 0.0)),
                }
                for r in results
            ],
            "count": len(results),
        }
    
    def calculate_scores(
        self,
        response: str,
        reference: str,
        scorer_id: str = "default",
        metrics: Optional[List[str]] = None,
        threshold: float = 0.7,
        aggregation: str = "weighted_average",
        weights: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Calculate response scores.
        
        Args:
            response: LLM response
            reference: Reference/expected output
            scorer_id: Scorer identifier
            metrics: List of metric names to use
            
        Returns:
            Score results
        """
        if scorer_id not in self.scorers:
            scorer_metrics = []
            if metrics is None:
                metrics = ["CosineSimilarityMetric", "SemanticSimilarityMetric"]
            
            if "CosineSimilarityMetric" in metrics or "cosine" in metrics:
                scorer_metrics.append(CosineSimilarityMetric())
            if "SemanticSimilarityMetric" in metrics or "semantic" in metrics:
                scorer_metrics.append(SemanticSimilarityMetric())
            if "ROUGEMetric" in metrics or "rouge" in metrics:
                try:
                    scorer_metrics.append(ROUGEMetric())
                except ImportError:
                    pass
            if "BLEUMetric" in metrics or "bleu" in metrics:
                try:
                    scorer_metrics.append(BLEUMetric())
                except ImportError:
                    pass
            
            scorer = ResponseScorer(
                metrics=scorer_metrics,
                threshold=threshold,
                weights=weights or {}
            )
            self.scorers[scorer_id] = scorer
        
        scorer = self.scorers[scorer_id]
        # Update weights if provided
        if weights:
            scorer.weights = weights
        
        scores = scorer.score(response, reference, metric_names=metrics)
        
        # Convert to float for JSON serialization
        scores_dict = {k: float(v) for k, v in scores.items()}
        
        # Use specified aggregation method
        aggregated = float(scorer.aggregate_score(scores_dict, aggregation=aggregation))
        
        return {
            "response": response,
            "reference": reference,
            "scores": scores_dict,
            "aggregated_score": aggregated,
            "threshold": threshold,
            "passed": aggregated >= threshold,
        }
    
    def test_validator(
        self,
        text: str,
        validator_type: str,
        validator_params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Test a single validator.
        
        Args:
            text: Text to validate
            validator_type: Validator type name
            validator_params: Validator parameters
            
        Returns:
            Validation result
        """
        validator_params = validator_params or {}
        # Note: require_rc is handled by the validator's __init__ method, don't add it to params
        
        try:
            validator_cls = get_validator(validator_type)
            if not validator_cls:
                return {
                    "passed": False,
                    "error": f"Validator type '{validator_type}' not found",
                }
            
            validator = validator_cls(**validator_params)
            result = validator.validate(text, {})
            
            return {
                "passed": isinstance(result, PassResult),
                "result": result.__class__.__name__,
                "error_message": result.error_message if hasattr(result, "error_message") else None,
                "metadata": result.metadata if hasattr(result, "metadata") else {},
            }
        except Exception as e:
            return {
                "passed": False,
                "error": str(e),
            }
    
    def chat_with_llm(
        self,
        prompt: str,
        llm_config: Dict[str, Any],
        guard_config: Optional[Dict[str, Any]] = None,
        guard_id: str = "default",
    ) -> Dict[str, Any]:
        """Chat with LLM using guard validation.
        
        Args:
            prompt: User prompt
            llm_config: LLM configuration (provider, model, api_key, etc.)
            guard_config: Optional guard configuration for validation
            guard_id: Guard identifier
            
        Returns:
            Chat response with validation results
        """
        try:
            from openai import OpenAI
        except ImportError:
            return {
                "response": None,
                "error": "OpenAI package not installed. Install with: pip install openai",
            }
        
        try:
            from anthropic import Anthropic
        except ImportError:
            Anthropic = None
        
        # Step 1: Validate input if guard is configured and has input validators
        input_validated = True
        input_validation_result = None
        if guard_config:
            # Create or get guard
            validators = guard_config.get("validators", [])
            num_reasks = guard_config.get("num_reasks", 0)
            name = guard_config.get("name")
            
            if guard_id not in self.guards:
                guard = WallGuard(num_reasks=num_reasks, name=name)
                if validators:
                    for validator_config in validators:
                        validator_type = validator_config.get("type")
                        if not validator_type:
                            continue
                        validator_params = validator_config.get("params", {})
                        on_fail = OnFailAction.get(validator_config.get("on_fail", "exception"))
                        apply_on = validator_config.get("on", "output")
                        validator_cls = get_validator(validator_type)
                        if validator_cls:
                            guard.use((validator_cls, validator_params, on_fail), on=apply_on)
                self.guards[guard_id] = guard
            
            guard = self.guards[guard_id]
            
            # Validate input
            input_validators = guard.validator_map.get("input", [])
            if input_validators:
                from wall_library.validator_service.sequential_validator_service import SequentialValidatorService
                service = SequentialValidatorService()
                input_validation_results = []
                for validator in input_validators:
                    result = validator.validate(prompt, metadata={})
                    input_validation_results.append(result)
                
                input_validated = all(r.is_pass for r in input_validation_results)
                if not input_validated:
                    error_messages = [
                        r.error_message
                        for r in input_validation_results
                        if r.is_fail and hasattr(r, "error_message")
                    ]
                    return {
                        "response": None,
                        "input_validated": False,
                        "output_validated": None,
                        "error": f"Input validation failed: {', '.join(error_messages)}",
                        "validation_stage": "input",
                        "input_validation_results": [{"validator": v.__class__.__name__, "passed": r.is_pass, "error": r.error_message if hasattr(r, "error_message") else None} 
                                                     for v, r in zip(input_validators, input_validation_results)]
                    }
        
        # Step 2: Call LLM
        try:
            provider = llm_config.get("provider", "openai")
            model = llm_config.get("model", "gpt-4o")
            api_key = llm_config.get("api_key")
            base_url = llm_config.get("base_url")
            temperature = llm_config.get("temperature", 0.7)
            max_tokens = llm_config.get("max_tokens", 1000)
            
            if provider == "openai":
                if not api_key and not base_url:
                    return {
                        "response": None,
                        "input_validated": input_validated,
                        "error": "OpenAI API key or base_url is required. Please configure it in the settings.",
                    }
                client = OpenAI(api_key=api_key, base_url=base_url) if api_key else OpenAI(base_url=base_url)
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                # Extract response with error handling
                if not response or not response.choices or len(response.choices) == 0:
                    return {
                        "response": None,
                        "input_validated": input_validated,
                        "error": "LLM returned invalid response structure. Please check your API key and model configuration.",
                    }
                llm_output = response.choices[0].message.content
                # Check if LLM actually returned content
                if not llm_output:
                    return {
                        "response": None,
                        "input_validated": input_validated,
                        "error": "LLM returned empty response. Please check your API key and model configuration.",
                    }
            elif provider == "anthropic":
                if Anthropic is None:
                    return {
                        "response": None,
                        "error": "Anthropic package not installed. Install with: pip install anthropic",
                    }
                client = Anthropic(api_key=api_key) if api_key else Anthropic()
                response = client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    messages=[{"role": "user", "content": prompt}],
                )
                llm_output = response.content[0].text
                # Check if LLM actually returned content
                if not llm_output:
                    return {
                        "response": None,
                        "input_validated": input_validated,
                        "error": "LLM returned empty response. Please check your API key and model configuration.",
                    }
            else:
                return {
                    "response": None,
                    "error": f"Unsupported LLM provider: {provider}",
                }
        except Exception as e:
            return {
                "response": None,
                "input_validated": input_validated,
                "error": f"LLM call failed: {str(e)}",
            }
        
        # Step 3: Validate output if guard is configured
        output_validated = True
        output_validation_result = None
        error_message = None
        
        if guard_config and guard_id in self.guards:
            guard = self.guards[guard_id]
            outcome = guard.validate(llm_output)
            output_validated = outcome.validation_passed
            
            # Extract error message from validation results
            if not outcome.validation_passed and outcome.metadata:
                validation_results = outcome.metadata.get("validation_results", [])
                if validation_results and len(validation_results) > 0:
                    # Try to get error message from first failed result
                    first_result = validation_results[0]
                    if hasattr(first_result, "error_message"):
                        error_message = first_result.error_message
                    elif isinstance(first_result, dict):
                        error_message = first_result.get("error_message")
            
            output_validation_result = {
                "validation_passed": outcome.validation_passed,
                "validated_output": outcome.validated_output,
                "raw_output": outcome.raw_output,
                "metadata": outcome.metadata or {},
                "error_message": error_message,  # Include error message for easy access
            }
        
        return {
            "response": llm_output if output_validated else output_validation_result.get("validated_output") if output_validation_result else None,
            "raw_response": llm_output,
            "input_validated": input_validated,
            "output_validated": output_validated,
            "input_validation_result": input_validation_result,
            "output_validation_result": output_validation_result,
            "error": error_message if not output_validated else None,  # Include error for easy access
        }
    
    def list_validators(self) -> List[Dict[str, Any]]:
        """List available validators.
        
        Returns:
            List of validator information
        """
        from wall_library.validator_base import _VALIDATOR_REGISTRY
        
        validators = []
        for validator_id, validator_cls in _VALIDATOR_REGISTRY.items():
            validators.append({
                "type": validator_id,
                "name": validator_cls.__name__,
                "description": validator_cls.__doc__ or f"{validator_cls.__name__} validator",
            })
        
        # Add test validators if registry is empty
        if not validators:
            validators = [
                {"type": "test_length", "name": "Length Validator", "description": "Validates minimum and maximum character count"},
                {"type": "test_safety", "name": "Safety Validator", "description": "Blocks unsafe keywords and restricted terms"},
            ]
        
        return validators
    
    def cleanup(self, resource_id: Optional[str] = None):
        """Clean up resources.
        
        Args:
            resource_id: Specific resource ID to clean up, or None for all
        """
        if resource_id:
            if resource_id in self.temp_dirs:
                shutil.rmtree(self.temp_dirs[resource_id], ignore_errors=True)
                del self.temp_dirs[resource_id]
        else:
            for temp_dir in self.temp_dirs.values():
                shutil.rmtree(temp_dir, ignore_errors=True)
            self.temp_dirs.clear()
            self.guards.clear()
            self.context_managers.clear()
            self.rag_retrievers.clear()
            self.scorers.clear()


# Global service instance
_service = WallLibraryService()


def get_service() -> WallLibraryService:
    """Get the global service instance."""
    return _service
