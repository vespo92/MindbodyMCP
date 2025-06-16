import axios from 'axios';

interface TokenResponse {
  TokenType: string;
  AccessToken: string;
  ExpiresIn: number;
}

interface UserToken {
  token: string;
  expiresAt: Date;
}

class MindbodyAuth {
  private userToken: UserToken | null = null;
  private readonly apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.MINDBODY_API_URL || 'https://api.mindbodyonline.com/public/v6';
  }

  async getUserToken(): Promise<string> {
    // Check if we have a valid token
    if (this.userToken && this.userToken.expiresAt > new Date()) {
      return this.userToken.token;
    }

    // Get new token
    const response = await axios.post<TokenResponse>(
      `${this.apiUrl}/usertoken/issue`,
      {
        Username: process.env.MINDBODY_SOURCE_NAME,
        Password: process.env.MINDBODY_SOURCE_PASSWORD,
      },
      {
        headers: {
          'Api-Key': process.env.MINDBODY_API_KEY!,
          'SiteId': process.env.MINDBODY_SITE_ID!,
          'Content-Type': 'application/json',
        },
      }
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + response.data.ExpiresIn - 60); // Subtract 60 seconds for safety

    this.userToken = {
      token: response.data.AccessToken,
      expiresAt,
    };

    return this.userToken.token;
  }

  getHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Api-Key': process.env.MINDBODY_API_KEY!,
      'SiteId': process.env.MINDBODY_SITE_ID!,
      'Content-Type': 'application/json',
    };

    return headers;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getUserToken();
    return {
      ...this.getHeaders(false),
      'Authorization': `Bearer ${token}`,
    };
  }
}

export const mindbodyAuth = new MindbodyAuth();
