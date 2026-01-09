"""Document storage utilities."""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Document:
    """Document representation."""

    id: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)


class DocumentStore:
    """Simple document store."""

    def __init__(self):
        """Initialize document store."""
        self.documents: Dict[str, Document] = {}

    def add(self, document: Document):
        """Add a document to the store.

        Args:
            document: Document to add
        """
        self.documents[document.id] = document

    def get(self, document_id: str) -> Optional[Document]:
        """Get a document by ID.

        Args:
            document_id: Document ID

        Returns:
            Document or None
        """
        return self.documents.get(document_id)

    def search(self, query: str, top_k: int = 5) -> List[Document]:
        """Search documents by query (simplified).

        Args:
            query: Search query
            top_k: Number of results

        Returns:
            List of matching documents
        """
        # Simple text matching - would use embeddings in full implementation
        results = []
        query_lower = query.lower()

        for doc in self.documents.values():
            if query_lower in doc.content.lower():
                results.append(doc)

        return results[:top_k]


