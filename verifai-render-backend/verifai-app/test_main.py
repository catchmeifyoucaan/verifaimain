import os
os.environ["GEMINI_API_KEY"] = "dummy_key"

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the VerifAi Backend API. Access the interactive API documentation at /docs for details on available endpoints and models."}