from abc import abstractmethod
from flask import Flask, make_response, jsonify
from flask_cors import CORS
from solace_ai_connector.components.component_base import ComponentBase
from flask_wtf import CSRFProtect
from gevent.pywsgi import WSGIServer
from urllib.parse import urlparse
import os

info = {
    "config_parameters": [
        {
            "name": "enabled",
            "type": "boolean",
            "description": "Whether the Web Chat UI component is enabled",
            "default": False,
            "required": True,
        },
        {
            "name": "listen_port",
            "type": "number",
            "description": "The port to listen to for incoming messages.",
            "default": 5001,
            "required": False,
        },
        {
            "name": "host",
            "type": "string",
            "description": "The host to listen to for incoming messages.",
            "default": "localhost",
            "required": False,
        },
        {
            "name": "response_api_url",
            "type": "string",
            "description": "URL for external API requests",
            "default": "http://127.0.0.1:5050/api/v1/request",
            "required": False,
        },
        {
            "name": "frontend_redirect_url",
            "type": "string",
            "description": "Frontend redirect URL for the callback from auth.",
            "default": "http://localhost:5001/callback_auth",
            "required": False,
        },
        {
            "name": "frontend_server_url",
            "type": "string",
            "description": "Server URL which the frontend will make requests to",
            "default": "http://localhost:5001",
            "required": False,
        },
        {
            "name": "frontend_use_authorization",
            "type": "boolean",
            "description": "Whether to use authorization in frontend",
            "default": False,
            "required": False,
        },
        {
            "name": "frontend_collect_feedback",
            "type": "boolean",
            "description": "Whether to collect feedback",
            "default": False,
            "required": False,
        },
        {
            "name": "frontend_url",
            "type": "string",
            "description": "Frontend URL for CORS purposes",
            "default": "http://localhost:5001",
            "required": False,
        },
        {
            "name": "authentication_base_url",
            "type": "string",
            "description": "Base URL for auth",
            "default": None,
            "required": False,
        },
        {
            "name": "authentication_client_id",
            "type": "string",
            "description": "Authentication client ID",
            "default": None,
            "required": False,
        },
        {
            "name": "authentication_client_secret",
            "type": "string",
            "description": "Authentication client secret",
            "default": None,
            "required": False,
        },
        {
            "name": "authentication_tenant_id",
            "type": "string",
            "description": "Authentication tenant ID",
            "default": None,
            "required": False,
        },
        {
            "name": "solace_broker_rest_messaging_url",
            "type": "string",
            "description": "Solace broker REST messaging URL",
            "default": None,
            "required": False,
        },
        {
            "name": "solace_agent_mesh_namespace",
            "type": "string",
            "description": "Cognitive mesh namespace",
            "default": None,
            "required": False,
        },
        {
            "name": "frontend_auth_login_url",
            "type": "string",
            "description": "Where the user is redirected when clicking login",
            "default": None,
            "required": False,
        },
        {
            "name": "frontend_welcome_message",
            "type": "string",
            "description": "Welcome message for frontend",
            "default": "Welcome to the chat!",
            "required": False,
        },
        {
            "name": "frontend_bot_name",
            "type": "string",
            "description": "Name of the bot",
            "default": "Agent Mesh",
            "required": False,
        },
        {
            "name": "csrf_key",
            "type": "string",
            "description": "CSRF key",
            "default": "os.urandom(32)",
            "required": False,
        },
        {
            "name": "local_dev",
            "type": "boolean",
            "description": "Whether the server is running in local development mode",
            "default": True,
            "required": False,
        },
    ],
}


class RestBase(ComponentBase):

    def __init__(self, **kwargs):
        super().__init__(info, **kwargs)

        # Configure all environment variables
        self.host = self.get_config("host", "localhost")
        self.listen_port = self.get_config("listen_port", 5001)

        # Environment variables
        self.response_api_url = self.get_config(
            "response_api_url", "http://127.0.0.1:5050/api/v1/request"
        )
        self.authentication_base_url = self.get_config("authentication_base_url")
        self.authentication_client_id = self.get_config("authentication_client_id")
        self.authentication_client_secret = self.get_config(
            "authentication_client_secret"
        )
        self.authentication_tenant_id = self.get_config("authentication_tenant_id")
        self.solace_broker_rest_messaging_url = self.get_config(
            "solace_broker_rest_messaging_url"
        )
        self.solace_agent_mesh_namespace = self.get_config("solace_agent_mesh_namespace")
        self.feedback_post_url = f"{self.solace_broker_rest_messaging_url}/TOPIC/{self.solace_agent_mesh_namespace}solace-agent-mesh/v1/feedback" # TODO: Make this configurable (AI-528)

        # Frontend environment variables
        self.frontend_redirect_url = self.get_config(
            "frontend_redirect_url", "http://localhost:5001/callback_auth"
        )
        self.frontend_server_url = self.get_config(
            "frontend_server_url", "http://localhost:5001"
        )
        self.frontend_use_authorization = self.get_config(
            "frontend_use_authorization", False
        )
        self.frontend_auth_login_url = self.get_config("frontend_auth_login_url")
        self.frontend_welcome_message = self.get_config(
            "frontend_welcome_message"
        )
        self.frontend_bot_name = self.get_config("frontend_bot_name", "Agent Mesh")
        self.frontend_collect_feedback = self.get_config(
            "frontend_collect_feedback", False
        )
        self.frontend_url = self.get_config(
            "frontend_url", "http://localhost:5001"
        )
        self.enabled = self.get_config("enabled", True)
        self.csrf_key = self.get_config('csrf_key', os.urandom(32))
        self.local_dev = self.get_config('local_dev', True)

        self.app = None
        self.init_app()

    def init_app(self):
        csrf = CSRFProtect() 

        self.app = Flask(__name__)

        #Disable CSRF only for local development
        if self.local_dev:
            self.app.config['WTF_CSRF_ENABLED'] = False

        self.app.config['SECRET_KEY'] = self.csrf_key
        csrf.init_app(self.app)
        
        frontend_origins = [self.frontend_url]
    
        # if frontend_url is using localhost or 127.0.0.1, then add them both to cors origins
        if "localhost" in self.frontend_url or "127.0.0.1" in self.frontend_url:
            parsed_url = urlparse(self.frontend_url)
            scheme = parsed_url.scheme
            port = f":{parsed_url.port}" if parsed_url.port else ""
            
            if "localhost" in self.frontend_url:
                frontend_origins.append(f"{scheme}://127.0.0.1{port}")
            else:
                frontend_origins.append(f"{scheme}://localhost{port}")
        
        CORS(
            self.app,
            resources={
                r"/*": {
                    "origins": frontend_origins,
                    "supports_credentials": True
                },
            },
        )

        # Add health check endpoint
        @self.app.route("/health", methods=["GET"])
        def health_check():
            return "", 200

        self.register_routes()

    def run(self):
        if self.enabled == False:
            return

        self.http_server = WSGIServer((self.host, self.listen_port), self.app)
        self.http_server.serve_forever()

    def stop_component(self):
        if hasattr(self, 'http_server') and self.http_server.started:
            try:
                self.http_server.stop(timeout=10)
            except Exception as e:
                print("Error stopping Web UI server: %s", str(e))

    @abstractmethod
    def register_routes(self):
        pass
