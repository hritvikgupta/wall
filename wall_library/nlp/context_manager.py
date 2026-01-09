"""Context manager for NLP context filtering."""

from dataclasses import dataclass, field
from typing import List, Optional, Union, Set
from pathlib import Path

from wall_library.nlp.keyword_matcher import KeywordMatcher
from wall_library.nlp.similarity_engine import SimilarityEngine


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
        # Extract keywords from strings
        for s in strings:
            words = s.lower().split()
            self.keywords.update(words)

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

    def check_context(self, text: str, threshold: float = 0.7) -> bool:
        """Check if text is within context boundaries.

        Args:
            text: Text to check
            threshold: Similarity threshold

        Returns:
            True if text is within context
        """
        # Check keyword matching
        if self.keywords:
            if self.keyword_matcher.match(text, list(self.keywords)):
                return True

        # Check similarity
        if self.contexts:
            max_similarity = max(
                self.similarity_engine.cosine_similarity(text, ctx)
                for ctx in self.contexts
            )
            return max_similarity >= threshold

        return True  # No context restrictions


