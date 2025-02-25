import React, { createContext, useContext, useEffect, useState } from "react";

interface AppConfig {
  configServerUrl: string;
  configAuthLoginUrl: string;
  configUseAuthorization: boolean;
  configWelcomeMessage: string;
  configRedirectUrl: string;
  configCollectFeedback: boolean;
  configBotName: string;
}

const ConfigContext = createContext<AppConfig | null>(null);

interface ConfigProviderProps {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: Readonly<ConfigProviderProps>) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const csrfToken = await getCsrfToken();
        
        // Fetch config with the token
        const configResponse = await fetch("/api/v1/config", {
          credentials: "include",
          headers: {
            'X-CSRF-TOKEN': csrfToken ?? '',
          }
        });
        
        if (!configResponse.ok) {
          throw new Error("Failed to fetch config.");
        }
        
        const data = await configResponse.json();

        const mappedConfig: AppConfig = {
          configServerUrl: data.frontend_server_url,
          configAuthLoginUrl: data.frontend_auth_login_url,
          configUseAuthorization: data.frontend_use_authorization,
          configWelcomeMessage: data.frontend_welcome_message,
          configRedirectUrl: data.frontend_redirect_url,
          configCollectFeedback: data.frontend_collect_feedback,
          configBotName: data.frontend_bot_name,
        };
        setConfig(mappedConfig);
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solace-green mx-auto mb-4"></div>
          <h1 className="text-2xl mb-4 text-black dark:text-white">
            Loading Config...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error("useConfig must be used within a <ConfigProvider>.");
  }
  return config;
}

export async function getCsrfToken(): Promise<string | null> {
  try {
    await fetch('/api/v1/csrf-token', {
      credentials: 'include',
    });
    
    // Get token from cookie after request
    const token = getCookie('csrf_token');
    if (!token) {
      throw new Error('CSRF token not set in cookie');
    }
    
    return token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}