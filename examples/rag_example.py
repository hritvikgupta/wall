"""RAG integration example."""

try:
    from wall_library.rag import RAGRetriever, ChromaDBClient
    
    def main():
        """RAG integration example."""
        # Create RAG retriever
        rag = RAGRetriever()
        
        # Add QA pairs
        rag.chromadb_client.add_qa_pairs(
            questions=["What is machine learning?"],
            answers=["Machine learning is a subset of AI"],
        )
        
        # Retrieve context
        results = rag.retrieve("What is AI?", top_k=5)
        print(f"Retrieved {len(results)} results")
        
    if __name__ == "__main__":
        main()
except ImportError:
    print("ChromaDB not installed. Install with: pip install wall-library[rag]")

