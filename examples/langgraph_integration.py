"""LangGraph integration example."""

try:
    from wall_library import WallGuard
    from wall_library.wrappers import LangGraphWrapper
    
    def main():
        """LangGraph integration example."""
        guard = WallGuard()
        wrapper = LangGraphWrapper(guard)
        
        # Create node with validation
        node = wrapper.create_node("validate_node")
        print("LangGraph node created with guard validation")
        
    if __name__ == "__main__":
        main()
except ImportError:
    print("LangGraph not installed. Install with: pip install wall-library[langgraph]")


