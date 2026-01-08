"""Server example."""

from wall_library.server import create_app

def main():
    """Server example."""
    # Create Flask app
    app = create_app()
    
    # Run server (in production, use gunicorn)
    print("Server created. Run with: wall start")
    # app.run(host='0.0.0.0', port=8000, debug=True)


if __name__ == "__main__":
    main()

