"""LangChain integration example."""

try:
    from wall_library import WallGuard
    from wall_library.wrappers import LangChainWrapper
    
    def main():
        """LangChain integration example."""
        guard = WallGuard()
        wrapper = LangChainWrapper(guard)
        
        # Convert to LangChain Runnable
        runnable = wrapper.to_runnable()
        print("Guard converted to LangChain Runnable")
        
    if __name__ == "__main__":
        main()
except ImportError:
    print("LangChain not installed. Install with: pip install wall-library[langchain]")


