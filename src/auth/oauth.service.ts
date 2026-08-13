export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type: string;
};

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly"
];

export class OAuthService {
  constructor(private readonly config: GoogleOAuthConfig, private readonly fetchImpl: typeof fetch = fetch) {}

  googleAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      scope: GOOGLE_SCOPES.join(" "),
      state
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async exchangeGoogleCode(code: string): Promise<OAuthTokenResponse> {
    return this.tokenRequest({
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: "authorization_code"
    });
  }

  async refreshGoogleToken(refreshToken: string): Promise<OAuthTokenResponse> {
    return this.tokenRequest({
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "refresh_token"
    });
  }

  private async tokenRequest(params: Record<string, string>): Promise<OAuthTokenResponse> {
    const response = await this.fetchImpl("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams(params)
    });
    if (!response.ok) throw new Error(`Google OAuth token request failed with ${response.status}`);
    return await response.json() as OAuthTokenResponse;
  }
}
