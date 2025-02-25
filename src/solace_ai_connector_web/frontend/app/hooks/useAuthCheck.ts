import { useState, useEffect } from "react";
import { useConfig, getCookie, getCsrfToken } from "../components/ConfigProvider";

interface UseAuthCheckOptions {
  serverUrl: string;
  useAuthorization: boolean;
  defaultIsAuthenticated: boolean;
}

interface UseAuthCheckResult {
  isValidatingToken: boolean;
  isAuthenticated: boolean;
  handleLogin: () => void;
}

export function useAuthCheck({
  serverUrl,
  useAuthorization,
  defaultIsAuthenticated,
}: UseAuthCheckOptions): UseAuthCheckResult {
  const [isAuthenticated, setIsAuthenticated] = useState(defaultIsAuthenticated);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const { configAuthLoginUrl, configRedirectUrl } = useConfig();

  const handleInvalidResponse = (response: Response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const validateToken = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token")
        let csrfToken = getCookie('csrf_token');
        if (!csrfToken) {
          csrfToken = await getCsrfToken()
        }
        
        if (accessToken) {
          const response = await fetch(`${serverUrl}/validate_token`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              'X-Refresh-Token': refreshToken ?? '',
              'X-CSRF-TOKEN': csrfToken ?? ''
            },
            body: JSON.stringify({ token: accessToken }),
          });

          if (handleInvalidResponse(response)) {
            return;
          }

          const data = await response.json();
          if (!data.valid) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setIsAuthenticated(false);
          } else {
            if (data.new_access_token) {
              localStorage.setItem("access_token", data.new_access_token);
            }
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
      } finally {
        setIsValidatingToken(false);
      }
    };

    // If the environment requires token-based auth:
    if (useAuthorization) {
      validateToken();
    } else {
      // No authorization needed
      setIsValidatingToken(false);
    }
  }, [serverUrl, useAuthorization]);  

  const handleLogin = () => {
    const loginUrl = configAuthLoginUrl;
    const redirectUrl = configRedirectUrl;
    window.location.href = `${loginUrl}?redirect_uri=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  return {
    isValidatingToken,
    isAuthenticated,
    handleLogin,
  };
}