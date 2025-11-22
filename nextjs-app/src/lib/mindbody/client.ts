import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================================================
// MINDBODY API CLIENT - HTTP Client with Authentication
// ============================================================================

interface TokenResponse {
  AccessToken: string;
  TokenType: string;
  ExpiresIn: number;
}

interface MindbodyConfig {
  apiKey: string;
  siteId: string;
  sourceName: string;
  sourcePassword: string;
  apiUrl?: string;
}

class MindbodyAuth {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private config: MindbodyConfig;

  constructor(config: MindbodyConfig) {
    this.config = config;
  }

  async getToken(): Promise<string> {
    // Return cached token if still valid (with 60 second buffer)
    if (this.token && this.tokenExpiry && new Date() < new Date(this.tokenExpiry.getTime() - 60000)) {
      return this.token;
    }

    // Fetch new token
    const response = await axios.post<TokenResponse>(
      `${this.config.apiUrl || 'https://api.mindbodyonline.com/public/v6'}/usertoken/issue`,
      {
        Username: this.config.sourceName,
        Password: this.config.sourcePassword,
      },
      {
        headers: {
          'Api-Key': this.config.apiKey,
          SiteId: this.config.siteId,
          'Content-Type': 'application/json',
        },
      }
    );

    this.token = response.data.AccessToken;
    this.tokenExpiry = new Date(Date.now() + response.data.ExpiresIn * 1000);

    return this.token;
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
  }
}

export class MindbodyApiClient {
  private client: AxiosInstance;
  private auth: MindbodyAuth;
  private config: MindbodyConfig;

  constructor(config?: Partial<MindbodyConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.MINDBODY_API_KEY || '',
      siteId: config?.siteId || process.env.MINDBODY_SITE_ID || '',
      sourceName: config?.sourceName || process.env.MINDBODY_SOURCE_NAME || '',
      sourcePassword: config?.sourcePassword || process.env.MINDBODY_SOURCE_PASSWORD || '',
      apiUrl: config?.apiUrl || process.env.MINDBODY_API_URL || 'https://api.mindbodyonline.com/public/v6',
    };

    this.auth = new MindbodyAuth(this.config);

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.config.apiKey,
        SiteId: this.config.siteId,
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(async (config) => {
      const token = await this.auth.getToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Add response interceptor for error handling and retry
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Retry on 401 with fresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.auth.clearToken();
          const token = await this.auth.getToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return this.client(originalRequest);
        }

        // Format error message
        const errorMessage = this.formatError(error);
        throw new Error(errorMessage);
      }
    );
  }

  private formatError(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.Error?.Message) {
        return data.Error.Message;
      }
      if (data.message) {
        return data.message;
      }
    }
    return error.message || 'Unknown API error';
  }

  async get<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
    // Filter out undefined params
    const params = options?.params
      ? Object.fromEntries(Object.entries(options.params).filter(([_, v]) => v !== undefined))
      : undefined;

    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
    const response = await this.client.delete<T>(endpoint, { params: options?.params });
    return response.data;
  }
}

// Create singleton instance
let clientInstance: MindbodyApiClient | null = null;

export function getMindbodyClient(config?: Partial<MindbodyConfig>): MindbodyApiClient {
  if (!clientInstance) {
    clientInstance = new MindbodyApiClient(config);
  }
  return clientInstance;
}

export function resetMindbodyClient(): void {
  clientInstance = null;
}
