export interface AccessTokenProvider {
  getAccessToken(): Promise<string>;
}

export class StaticAccessTokenProvider implements AccessTokenProvider {
  constructor(private readonly accessToken: string) {}

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}
