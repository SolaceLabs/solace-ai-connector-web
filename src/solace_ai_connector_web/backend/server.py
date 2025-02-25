from flask import request, Response, redirect, send_from_directory, send_file,make_response, jsonify, session
from flask_cors import CORS
import requests
import uuid
import json
from datetime import datetime, timedelta
from .server_base import RestBase, info as base_info
from flask_wtf.csrf import generate_csrf, CSRFError
from solace_ai_connector.common.log import log

info = base_info.copy()

info.update(
    {
        "class_name": "WebChatServer",
        "description": "This component creates a server that acts as the backend for the Solace Web Chat UI .",
    }
)


class WebChatServer(RestBase):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def register_routes(self):

        # Register CSRF and security handlers
        self.register_csrf_handlers()
        
        # Register chat related endpoints
        self.register_chat_endpoints()
        
        # Register auth endpoints
        self.register_auth_endpoints()
        
        # Register static file servers
        self.register_serve_static_endpoints()


    def register_csrf_handlers(self):

        #Route to get CSRF token as a cookie
        @self.app.route('/api/v1/csrf-token', methods=['GET'])
        def get_csrf():
            token = generate_csrf()
            response = make_response(jsonify({'message': 'CSRF token set'}))
            response.set_cookie(
                'csrf_token', 
                token,
                secure= not self.local_dev,
                samesite='Strict',
                max_age=3600
            )
            return response
        
        #If CSRF token has an issue it automatically goes here
        @self.app.errorhandler(CSRFError)
        def handle_csrf_error(error):
            return {
                'error': "CSRF token is missing or invalid",
                'message': str(error)
            }, 403
        
        #Add CSRF headers in each request
        @self.app.after_request
        def after_request(response):
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            return response
        

    def register_chat_endpoints(self):

        #Main endpoint for chat responses
        @self.app.route("/api/v1/chat", methods=["POST"])
        def chat():
            return self.handle_chat_response()
        
        # Get config dynamically from the backend
        @self.app.route("/api/v1/config", methods=["GET"])
        def get_config():
            config = {
                "frontend_server_url": self.frontend_server_url,
                "frontend_use_authorization": self.frontend_use_authorization,
                "frontend_auth_login_url": self.frontend_auth_login_url,
                "frontend_welcome_message": self.frontend_welcome_message,
                "frontend_redirect_url": self.frontend_redirect_url,
                "frontend_collect_feedback": self.frontend_collect_feedback,
                "frontend_bot_name": self.frontend_bot_name,
            }

            return config, 200
        
        # Route to handle feedback if enabled
        @self.app.route("/api/v1/feedback", methods=["POST"])
        def submit_feedback():
            return self.handle_collecting_feedback()


    def register_serve_static_endpoints(self):

        @self.app.route("/assets/<path:path>")
        def serve_assets(path):
            return send_from_directory("../frontend/static/client/assets", path)

        @self.app.route("/static/client/<path:path>")
        def serve_client_files(path):
            return send_from_directory("../frontend/static/client", path)

        @self.app.route("/", defaults={"path": ""})
        def serve(path):
            return send_file("../frontend/static/client/index.html")

        @self.app.route("/<path:path>")
        def serve_files(path):
            if path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico')):
                return send_from_directory("../frontend/static/client", path)
            return send_file("../frontend/static/client/index.html")
        
    def register_auth_endpoints(self):

        #This is the route where the authentication service should callback to
        @self.app.route("/callback_auth", methods=["GET"])
        def auth_callback():
            code = request.args.get("code")

            data = {
                "client_id": self.authentication_client_id,
                "client_secret": self.authentication_client_secret,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self.frontend_redirect_url,
            }

            try:
                response = requests.post(
                    f"https://login.microsoftonline.com/{self.authentication_tenant_id}/oauth2/v2.0/token",
                    data=data,
                )

                temp_code = str(uuid.uuid4())
                temp_codes = session.get('temp_codes', {})
                
                temp_codes[temp_code] = {
                    "access_token": response.json().get("access_token"),
                    "refresh_token": response.json().get("refresh_token"),
                    "expires_at": (datetime.now() + timedelta(minutes=5)).isoformat()
                }
                
                session['temp_codes'] = temp_codes
                return redirect(
                    f"{self.frontend_url}/auth-callback?temp_code={temp_code}"
                )
            except Exception as e:
                log.error(f"Error in callback: {str(e)}")
                return {"error": str(e)}, 500

        # Frontend exchanges temporary token for the actual access token (avoids sending token as query params)
        @self.app.route("/exchange-temp-code", methods=["POST"])
        def exchange_temp_code():
            data = request.json
            temp_code = data.get("temp_code")
            log.info(f"Received temp code for exchange: {temp_code}")

            temp_codes = session.get('temp_codes', {})
            
            if not temp_code or temp_code not in temp_codes:
                return {"error": "Invalid temporary code"}, 400
            
            stored_data = temp_codes[temp_code]
            if datetime.now() > datetime.fromisoformat(stored_data["expires_at"]):
                del temp_codes[temp_code]
                return {"error": "Temporary code expired"}, 400
            
            access_token = stored_data["access_token"]
            refresh_token = stored_data["refresh_token"]

            del temp_codes[temp_code]
            session['temp_codes'] = temp_codes
            log.info("Successfully exchanged temp code for token")
            
            # Create response with CSRF token
            new_csrf_token = generate_csrf()
            response = make_response(jsonify({
                "access_token": access_token,
                "refresh_token" : refresh_token
            }))
            
            response.set_cookie(
                'csrf_token',
                new_csrf_token,
                secure= not self.local_dev, 
                samesite='Strict',
                max_age=3600
            )
            
            return response

        @self.app.route("/validate_token", methods=["POST"])
        def is_token_valid():
            try:
                data = request.get_json()
                access_token = data.get("token")
                refresh_token = request.headers.get('X-Refresh-Token')

                if not access_token:
                    return {"valid": False, "error": "No token provided"}, 401

                headers = {"Authorization": f"Bearer {access_token}"}
                request_data = {"token": access_token}

                validation_response = requests.post(
                    f"{self.authentication_base_url}/is_token_valid",
                    data=request_data,
                    headers=headers,
                    verify = not self.local_dev
                )
                
                #if token is invalid try to refresh it
                if validation_response.status_code != 200:
                    new_access_token = self.refresh_access_token(access_token, refresh_token)
                    new_access_token_formatted = new_access_token[1:-2]
                    return {
                        "valid": True,
                        "new_access_token": new_access_token_formatted
                    }, 200

                return {"valid": validation_response.status_code == 200}, 200
            except ValueError as e:
                return {"valid": False, "error": str(e)}, 401
            except Exception as e:
                return {"valid": False, "error": str(e)}, 500

    def refresh_access_token(self, access_token, refresh_token):
        refresh_response = requests.post(
            f"{self.authentication_base_url}/refresh_token",
            json={
                "refresh_token": refresh_token
            },
            verify=not self.local_dev
        )
        
        if refresh_response.status_code == 200:
            return refresh_response.text
        raise ValueError("Refresh token expired")

    def _create_stream_response(self, response, new_access_token_formatted):
        is_first_chunk = True
        for chunk in response.iter_lines(decode_unicode=True):
            if chunk:
                if is_first_chunk and new_access_token_formatted:
                    try:
                        chunk_data = json.loads(chunk.replace('data: ', ''))
                        chunk_data['new_access_token'] = new_access_token_formatted
                        chunk = f"data: {json.dumps(chunk_data)}"
                    except Exception:
                        pass
                    is_first_chunk = False
                yield f"{chunk}\n"

    def handle_chat_response(self):
        try:
            headers = self._get_authorization_headers()
            access_token = request.headers.get("Authorization").split(" ")[1]
            refresh_token = request.headers.get("X-Refresh-Token", "")
            new_access_token_formatted = None
            
            prompt = request.form.get("prompt")
            stream = request.form.get("stream", "true")
            session_id = request.form.get("session_id")
            
            if not prompt:
                return {"error": "Missing required fields"}, 400
                
            files = []
            if "files" in request.files:
                uploaded_files = request.files.getlist("files")
                for file in uploaded_files:
                    files.append(
                        ("files", (file.filename, file.read(), file.content_type))
                    )
                    
            data = {"prompt": prompt, "stream": stream, "session_id": session_id}
            response = requests.post(
                self.response_api_url,
                headers=headers,
                data=data,
                files=files if files else None,
                stream=True,
            )
            if response.status_code != 200:
                if response.status_code == 401:
                    try:
                        new_access_token = self.refresh_access_token(access_token, refresh_token)
                        new_access_token_formatted = new_access_token[1:-2]
                        headers['Authorization'] = f"Bearer {new_access_token_formatted}"
                        response = requests.post(
                            self.response_api_url,
                            headers=headers,
                            data=data,
                            files=files if files else None,
                            stream=True,
                        )
                        response.raise_for_status()
                    except Exception:
                        return {"error": "Unauthorized"}, 401
                return {"error": "Failed to get response"}, 500
                    
            return Response(
                self._create_stream_response(response, new_access_token_formatted),
                content_type="application/json"
            )
            
        except ValueError as e:
            return {"error": str(e)}, 401
        except Exception as e:
            return {"error": str(e)}, 500
        
    def _get_authorization_headers(self):
        headers = {}
        if not self.frontend_use_authorization:
            return headers

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise ValueError("No valid authorization token provided")

        access_token = auth_header.split(" ")[1]
        if not access_token:
            raise ValueError("Invalid token")

        headers["Authorization"] = f"Bearer {access_token}"
        return headers

    def handle_collecting_feedback(self):
        if not self.frontend_collect_feedback:
            return {"status": "Feedback is not enabled"}, 400

        feedback_data = request.json
        message_id = feedback_data.get("messageId")
        is_positive = feedback_data.get("isPositive")
        comment = feedback_data.get("comment")
        session_id = feedback_data.get("sessionId")

        if not all([message_id, session_id]) or is_positive is None:
            return {"error": "Missing required fields in feedback data"}, 400
        
        if not self.get_config('solace_broker_basic_auth'):
            return {"error": "Missing required configuration for collecting feedback"}, 400

        feedback_post_headers = {
            "Content-Type": "application/json",
            "Content-Encoding": "utf-8",
            "Authorization": f"Basic {self.get_config('solace_broker_basic_auth')}",
        }

        feedback = "thumbs_up" if is_positive else "thumbs_down"
        rest_body = {
            "user": "Web UI user",
            "feedback": feedback,
            "interface": "web",
            "data": {"session_id": session_id, "stimulus_uuid": message_id},
        }

        if comment:
            rest_body["feedback_reason"] = comment
        try:
            response = requests.post(
                url=self.feedback_post_url,
                headers=feedback_post_headers,
                data=json.dumps(rest_body),
            )
            response.raise_for_status()
            return {"status": "success"}, 200
        except Exception as e:
            log.error(f"Failed to post feedback: {str(e)}")
            return {"status": "error", "message": str(e)}, 500   