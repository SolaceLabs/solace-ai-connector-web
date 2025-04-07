from solace_ai_connector_web.backend.server import WebChatServer

import pytest

@pytest.fixture
def test_server():
    """Create a test server instance with minimal configuration."""
    server = WebChatServer(
        config={"component_config": {"enabled": True}},
        local_dev=True,
        listen_port=5001,
        host="localhost",
        csrf_key="test_csrf_key",
        frontend_url="http://localhost:5001",
        response_api_url="http://mock-api/api/v1/request",
        authentication_base_url="http://mock-auth"
    )
    return server

@pytest.fixture
def test_client(test_server):
    """Create a test client for the server."""
    with test_server.app.test_client() as client:
        yield client
