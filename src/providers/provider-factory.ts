import { StaticAccessTokenProvider } from "../auth/access-token-provider.js";
import { env } from "../config/env.js";
import { GoogleCalendarAdapter } from "./calendar/google-calendar.adapter.js";
import { GmailAdapter } from "./communications/gmail.adapter.js";
import { GoogleDriveAdapter } from "./documents/google-drive.adapter.js";
import { MockProvider } from "./mock/mock-provider.js";
import { BaseProvider } from "./provider.interface.js";

export function createProviders(): BaseProvider[] {
  const providers: BaseProvider[] = [];

  if (env.MOCK_PROVIDER_ENABLED) {
    providers.push(new MockProvider());
  }

  if (env.GOOGLE_CALENDAR_ENABLED) {
    if (!env.GOOGLE_CALENDAR_ACCESS_TOKEN) {
      throw new Error("GOOGLE_CALENDAR_ENABLED=true requires GOOGLE_CALENDAR_ACCESS_TOKEN in Phase 2");
    }

    providers.push(new GoogleCalendarAdapter({
      calendarId: env.GOOGLE_CALENDAR_ID,
      tokenProvider: new StaticAccessTokenProvider(env.GOOGLE_CALENDAR_ACCESS_TOKEN)
    }));
  }

  if (env.GMAIL_ENABLED) {
    if (!env.GMAIL_ACCESS_TOKEN) {
      throw new Error("GMAIL_ENABLED=true requires GMAIL_ACCESS_TOKEN");
    }
    providers.push(new GmailAdapter({
      tokenProvider: new StaticAccessTokenProvider(env.GMAIL_ACCESS_TOKEN)
    }));
  }

  if (env.GOOGLE_DRIVE_ENABLED) {
    if (!env.GOOGLE_DRIVE_ACCESS_TOKEN) {
      throw new Error("GOOGLE_DRIVE_ENABLED=true requires GOOGLE_DRIVE_ACCESS_TOKEN");
    }
    providers.push(new GoogleDriveAdapter({
      tokenProvider: new StaticAccessTokenProvider(env.GOOGLE_DRIVE_ACCESS_TOKEN)
    }));
  }

  return providers;
}
