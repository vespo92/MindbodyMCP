import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { mindbodyAuth } from './auth';

export interface IMindbodyClient {
  request<T>(config: AxiosRequestConfig, retries?: number): Promise<T>;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

class MindbodyApiClient implements IMindbodyClient {
  private client: AxiosInstance;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor() {
    const apiUrl = process.env.MINDBODY_API_URL || 'https://api.mindbodyonline.com/public/v6';

    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
    });

    // Add request interceptor to add auth headers
    this.client.interceptors.request.use(async (config) => {
      const headers = await mindbodyAuth.getAuthHeaders();
      Object.assign(config.headers, headers);
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retried) {
          // Token might be expired, reset and retry once
          error.config._retried = true;
          mindbodyAuth.resetTokenState();
          const headers = await mindbodyAuth.getAuthHeaders();
          Object.assign(error.config.headers, headers);
          return this.client.request(error.config);
        }
        throw error;
      }
    );
  }

  async request<T>(config: AxiosRequestConfig, retries = 0): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      if (retries < this.maxRetries && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retries));
        return this.request<T>(config, retries + 1);
      }

      throw this.formatError(error);
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors or 5xx errors, but NOT on 401/403 auth errors
    if (!error.response) return true;
    return error.response.status >= 500;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: any): Error {
    if (error.response?.data?.Error) {
      const mbError = error.response.data.Error;
      return new Error(`Mindbody API Error: ${mbError.Message} (Code: ${mbError.Code})`);
    }

    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      if (status === 401 || status === 403) {
        return new Error(
          `Mindbody Auth Error (${status}): ${statusText}. ` +
          `Check that your MINDBODY_API_KEY is valid and activated for site ${process.env.MINDBODY_SITE_ID}. ` +
          `If using source credentials, verify MINDBODY_SOURCE_NAME and MINDBODY_SOURCE_PASSWORD are correct.`
        );
      }
      return new Error(`API Error: ${status} - ${statusText}`);
    }

    return new Error(`Network Error: ${error.message}`);
  }

  // Convenience methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }
}

export const mindbodyClient = new MindbodyApiClient();
