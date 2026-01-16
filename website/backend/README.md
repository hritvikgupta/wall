# Wall Library Playground Backend

Backend API service for the Wall Library Playground frontend.

## Setup

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -e ../../.  # Install wall-library from parent directory
pip install flask flask-cors python-dotenv
```

Or install from requirements.txt:
```bash
pip install -r requirements.txt
```

## Running

```bash
source venv/bin/activate
python app.py
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

- `GET /health` - Health check
- `POST /api/guard/validate` - Validate text using Wall Guard
- `POST /api/context/check` - Check context boundaries
- `POST /api/rag/retrieve` - Retrieve documents using RAG
- `POST /api/scorer/calculate` - Calculate response scores
- `POST /api/validators/test` - Test individual validator
- `GET /api/validators/list` - List available validators
- `POST /api/monitor/track` - Track LLM interaction
- `GET /api/monitor/stats` - Get monitoring statistics
- `GET /api/visualization/data` - Get visualization data

## Environment Variables

Create a `.env` file:

```
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Testing

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

Test guard validation:
```bash
curl -X POST http://localhost:5000/api/guard/validate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```
