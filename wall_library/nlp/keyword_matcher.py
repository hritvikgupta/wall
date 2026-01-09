"""Keyword matcher for context filtering."""

from typing import List, Set, Union
import re


class KeywordMatcher:
    """Keyword matcher for exact and fuzzy keyword matching."""

    def __init__(self, case_sensitive: bool = False):
        """Initialize keyword matcher.

        Args:
            case_sensitive: Whether matching should be case sensitive
        """
        self.case_sensitive = case_sensitive

    def match(self, text: str, keywords: Union[List[str], Set[str]]) -> bool:
        """Match keywords in text.

        Args:
            text: Text to search
            keywords: Keywords to match

        Returns:
            True if any keyword matches
        """
        if not keywords:
            return True

        if not self.case_sensitive:
            text = text.lower()
            keywords = [k.lower() if isinstance(k, str) else str(k).lower() for k in keywords]

        for keyword in keywords:
            if keyword in text:
                return True

        return False

    def fuzzy_match(self, text: str, keywords: List[str], threshold: float = 0.8) -> bool:
        """Fuzzy match keywords in text.

        Args:
            text: Text to search
            keywords: Keywords to match
            threshold: Similarity threshold

        Returns:
            True if any keyword fuzzy matches
        """
        # Simplified fuzzy matching
        text_words = set(text.lower().split())
        for keyword in keywords:
            keyword_words = set(keyword.lower().split())
            intersection = text_words.intersection(keyword_words)
            union = text_words.union(keyword_words)
            if union:
                similarity = len(intersection) / len(union)
                if similarity >= threshold:
                    return True
        return False


