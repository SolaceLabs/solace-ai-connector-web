from unittest.mock import patch, MagicMock

import pytest

def test_validate_token_success(test_client, monkeypatch):
    """Test successful token validation."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    monkeypatch.setattr('requests.post', lambda *args, **kwargs: mock_response)

    response = test_client.post(
        '/validate_token',
        json={
            "token": "valid_token",
            "session_id": "test_session"
        },
        headers={
            "X-Refresh-Token": "test_refresh_token"
        }
    )
    assert response.status_code == 200
    assert response.json["valid"] is True

def test_validate_token_refresh(test_client, monkeypatch):
    """Test token refresh."""
    mock_fail = MagicMock()
    mock_fail.status_code = 401

    mock_refresh = MagicMock()
    mock_refresh.status_code = 200
    mock_refresh.text = '"new_access_token_value"'

    monkeypatch.setattr(
        'requests.post',
        lambda *args, **kwargs: mock_fail if "is_token_valid" in args[0] else mock_refresh
    )
    response = test_client.post(
        '/validate_token',
        json={
            "token": "expired_token"
        },
        headers={
            "X-Refresh-Token": "test_refresh_token"
        }
    )
    print(f"response: {response.data}")
    assert response.status_code == 200
    assert "new_access_token" in response.json

def test_csrf_token_generation(test_client):
    """Test CSRF token generation."""
    response = test_client.get('/api/v1/csrf-token')
    assert response.status_code == 200
    csrf_token = test_client.get_cookie('csrf_token')
    assert csrf_token is not None

