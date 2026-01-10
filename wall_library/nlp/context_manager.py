"""Context manager for NLP context filtering."""

from dataclasses import dataclass, field
from typing import List, Optional, Union, Set, Callable
from pathlib import Path
import re

from wall_library.nlp.keyword_matcher import KeywordMatcher
from wall_library.nlp.similarity_engine import SimilarityEngine
from wall_library.nlp.prompts import CONTEXT_VALIDATION_COT_PROMPT

# Try to use spaCy for stop words, fallback to hardcoded list
try:
    import spacy
    try:
        _nlp = spacy.load("en_core_web_sm")
        _SPACY_AVAILABLE = True
    except OSError:
        # spaCy installed but model not downloaded
        _nlp = None
        _SPACY_AVAILABLE = False
except ImportError:
    # spaCy not installed
    _nlp = None
    _SPACY_AVAILABLE = False

# Fallback stop words if spaCy is not available
_FALLBACK_STOP_WORDS = {
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to',
    'was', 'were', 'will', 'with', 'when', 'where', 'which', 'who', 'what',
    'how', 'why', 'if', 'then', 'than', 'this', 'these', 'those', 'or', 'but',
    'not', 'no', 'yes', 'so', 'can', 'could', 'should', 'would', 'may', 'might',
    'must', 'shall', 'do', 'does', 'did', 'done', 'having', 'had', 'have', 'has',
    'been', 'being', 'were', 'was', 'is', 'are', 'am', 'be', 'get', 'got', 'go',
    'goes', 'went', 'gone', 'take', 'took', 'taken', 'make', 'made', 'say', 'said',
    'see', 'saw', 'seen', 'know', 'knew', 'known', 'think', 'thought', 'come', 'came',
    'want', 'wanted', 'use', 'used', 'find', 'found', 'give', 'gave', 'given',
    'tell', 'told', 'work', 'worked', 'call', 'called', 'try', 'tried', 'ask', 'asked',
    'need', 'needed', 'feel', 'felt', 'become', 'became', 'leave', 'left', 'put', 'set'
}


def _get_stop_words() -> Set[str]:
    """Get stop words, using spaCy if available, otherwise fallback list."""
    if _SPACY_AVAILABLE and _nlp is not None:
        return _nlp.Defaults.stop_words
    return _FALLBACK_STOP_WORDS


@dataclass
class ContextManager:
    """Context manager for managing context boundaries."""

    keywords: Set[str] = field(default_factory=set)
    keyword_matcher: KeywordMatcher = field(default_factory=KeywordMatcher)
    similarity_engine: SimilarityEngine = field(default_factory=SimilarityEngine)
    contexts: List[str] = field(default_factory=list)

    def add_keywords(self, keywords: Union[str, List[str]]):
        """Add keywords to context.

        Args:
            keywords: Keyword or list of keywords
        """
        if isinstance(keywords, str):
            keywords = [keywords]
        self.keywords.update(k.lower() for k in keywords)

    def add_string_list(self, strings: List[str]):
        """Add string list to context.

        Args:
            strings: List of strings
        """
        self.contexts.extend(strings)
        # Extract keywords from strings, filtering out stop words
        # DISABLE AUTO-EXTRACTION: This causes high false-positive rates for dense context
        # stop_words = _get_stop_words()
        # for s in strings:
        #     # Split on whitespace and punctuation, convert to lowercase
        #     words = re.findall(r'\b[a-zA-Z]+\b', s.lower())
        #     # Filter out stop words and very short words (1-2 chars)
        #     meaningful_words = [w for w in words if w not in stop_words and len(w) > 2]
        #     self.keywords.update(meaningful_words)

    def load_from_file(self, file_path: Union[str, Path]):
        """Load context from file.

        Args:
            file_path: Path to file (txt, json, csv)
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        if path.suffix == ".txt":
            with open(path, "r") as f:
                content = f.read()
                self.contexts.append(content)
                self.add_keywords(content.split())
        elif path.suffix == ".json":
            import json

            with open(path, "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    self.add_string_list([str(item) for item in data])
                elif isinstance(data, dict):
                    self.add_string_list([str(v) for v in data.values()])
        elif path.suffix == ".csv":
            import csv

            with open(path, "r") as f:
                reader = csv.reader(f)
                for row in reader:
                    self.add_string_list(row)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")

    def check_context(
        self, 
        text: str, 
        threshold: float = 0.7,
        use_advanced_algo: bool = False,
        llm_call: Optional[Callable] = None,
        llm_prompt_template: Optional[str] = None,
        strategy: str = "heuristic" # "heuristic" (default), "llm_check"
    ) -> bool:
        """Check if text is within context boundaries.

        Args:
            text: Text to check
            threshold: Similarity threshold
            use_advanced_algo: Whether to use advanced algorithm (hybrid score)
            llm_call: Optional LLM callable for verification
            llm_prompt_template: Optional prompt template for LLM verification
            strategy: 'heuristic' (keywords/similarity first, LLM fallback) or 'llm_check' (LLM only)

        Returns:
            True if text is within context
        """
        # If strategy is "llm_check" and LLM is provided, use ONLY LLM
        if strategy == "llm_check" and llm_call:
            try:
                # Prepare context
                context_str = "\n".join(self.contexts)[:4000]
                keywords_str = ", ".join(self.keywords)
                
                # Use provided template or default CoT if none
                if not llm_prompt_template:
                     # Ensure we format with all expected keys, handling potential conflicts if they differ
                     # But basically we want to use the new CoT prompt
                     prompt = CONTEXT_VALIDATION_COT_PROMPT.format(
                         context=context_str, 
                         keywords=keywords_str, 
                         text=text
                     )
                else:
                     prompt = llm_prompt_template.format(context=context_str, text=text)

                response = llm_call(prompt)
                
                # Parse CoT output -> look for final answer
                # The prompt asks for "final_answer: <YES or NO>"
                response_lower = str(response).lower()
                
                if "final_answer: yes" in response_lower or "final_answer:yes" in response_lower:
                    return True
                # Also accept simple "yes" if the user provided a simple prompt template
                if "final_answer" not in response_lower and ("yes" in response_lower.strip() or "true" in response_lower.strip()):
                     return True
                     
                return False
            except Exception as e:
                # If LLM strategy selected but fails, we should probably fail safe (False)
                return False

        # --- Standard Heuristic Check (Keywords/Similarity) ---
        
        # Check keyword matching first (fastest)
        if self.keywords:
            if self.keyword_matcher.match(text, list(self.keywords)):
                return True

        # If no contexts are provided, and no keywords matched, then there are no restrictions.
        if not self.contexts:
            return True

        # Check similarity
        max_similarity = 0.0
        if use_advanced_algo:
            # Advanced algo: Hybrid score (Cosine + Jaccard weighted)
            # This gives better accuracy by combining semantic and lexical similarity
            for ctx in self.contexts:
                # Get semantic (cosine) similarity
                semantic_score = self.similarity_engine.cosine_similarity(text, ctx)
                # Get lexical (Jaccard) similarity explicitly using checking simple cosine which is Jaccard-based
                lexical_score = self.similarity_engine._simple_cosine_similarity(text, ctx)
                
                # Weighted hybrid score (favor semantic but boost with lexical)
                hybrid_score = (0.7 * semantic_score) + (0.3 * lexical_score)
                max_similarity = max(max_similarity, hybrid_score)
        else:
            max_similarity = max(
                self.similarity_engine.cosine_similarity(text, ctx)
                for ctx in self.contexts
            )
        
        # If similarity passes, return True
        if max_similarity >= threshold:
            return True
        
        # Removing fallback logic to strictly respect user's request. 
        # If they want LLM, they pick strategy="llm_check".
        
        return False

    def check_image_context(
        self,
        image: Union[str, bytes],
        vllm_call: Callable,
        prompt_template: str = "Context:\n{context}\n\nImage provided. Does this image violate the context? Answer only 'yes' or 'no'."
    ) -> bool:
        """Check if image adheres to context boundaries using VLLM.

        Args:
            image: Image URL or base64 string
            vllm_call: VLLM callable (takes prompt + image, returns text)
            prompt_template: Template for VLLM prompt

        Returns:
            True if image is valid (does NOT violate context)
        """
        if not self.contexts:
            return True

        try:
            # Prepare context string
            context_str = "\n".join(self.contexts)[:4000]
            prompt = prompt_template.format(context=context_str)
            
            # Call VLLM
            response = vllm_call(prompt=prompt, image=image)
            
            response_lower = str(response).lower().strip()
            
            # If using CoT prompt logic
            if "final_answer:" in response_lower:
                return "final_answer: yes" in response_lower or "final_answer:yes" in response_lower

            # Standard simple reasoning
            # We'll assume the prompt asks "Is this image valid/appropriate?"
            # So "yes" = Pass, "no" = Fail
            is_valid = "yes" in response_lower or "true" in response_lower or "approve" in response_lower
            
            return is_valid
        except Exception as e:
            # If VLLM fails, log it (if logger exists) but return False to be safe?
            # Or raise? Returning False is safer for a guard.
            return False


