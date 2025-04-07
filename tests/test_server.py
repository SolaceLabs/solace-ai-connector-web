from unittest.mock import patch, MagicMock

import json
import pytest

def test_server_initialization(test_server):
    """Test the initialization of the server."""
    assert test_server.enabled is True
    assert test_server.local_dev is True
    assert test_server.listen_port == 5001
    assert test_server.host == "localhost"

def test_health_endpoint(test_client):
    """Test the health check endpoint."""
    response = test_client.get("/health")
    assert response.status_code == 200

def test_server_config_endpoint(test_client):
    """Test the config endpoint."""
    response = test_client.get('/api/v1/config')
    assert response.status_code == 200
    data = response.get_json()
    assert "frontend_server_url" in data
    assert "frontend_welcome_message" in data
    assert "frontend_bot_name" in data

@patch('requests.post')
def test_chat_endpoint(mock_post, test_client):
    """Test the chat endpoint."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.iter_lines.return_value = [b'{"message": "Hello"}']
    mock_post.return_value = mock_response

    data = {
        "prompt": "Hello",
        "stream": "false",
        "session_id": "test_session",
    }
    headers = {
        "Authorization": "Bearer test_token",
        "X-Refresh-Token": "test_refresh_token"
    }
    response = test_client.post(
        '/api/v1/chat',
        data=data,
        headers=headers
    )
    assert response.status_code == 200

    response_text = response.data.decode('utf-8').strip()
    if response_text.startswith("data: "):
        response_text = response_text[6:]
    assert response_text == 'b\'{"message": "Hello"}\''
