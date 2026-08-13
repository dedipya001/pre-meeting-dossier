import { AccessTokenProvider } from "../../auth/access-token-provider.js";
import { ConversationItem, Person, SearchConversationsInput, SearchPeopleInput } from "../../domain/schemas/search.js";
import { BaseProvider } from "../provider.interface.js";
import { CommunicationProvider } from "./communication-provider.interface.js";

type GmailMessageList = { messages?: Array<{ id: string; threadId: string }> };
type GmailMessage = {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
  };
};

export type GmailAdapterOptions = {
  tokenProvider: AccessTokenProvider;
  fetchImpl?: typeof fetch;
};

export class GmailAdapter implements BaseProvider, CommunicationProvider {
  metadata = {
    id: "gmail",
    displayName: "Gmail",
    capabilities: ["communications", "people"] as const
  };

  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: GmailAdapterOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async searchConversations(input: SearchConversationsInput): Promise<ConversationItem[]> {
    const ids = await this.searchMessageIds(input);
    const messages = await Promise.all(ids.map((id) => this.getMessage(id)));
    return messages.map((message) => this.normalizeMessage(message)).slice(0, input.limit);
  }

  async searchPeople(input: SearchPeopleInput): Promise<Person[]> {
    const conversations = await this.searchConversations({
      query: input.query ?? input.organization ?? input.names?.[0] ?? input.emails?.[0],
      participants: input.emails ?? input.names,
      limit: input.limit
    });
    const people = conversations.flatMap((conversation) => conversation.participants ?? []).map((participant) => ({
      id: participant.email ? `gmail:${participant.email.toLowerCase()}` : `gmail:${participant.name}`,
      name: participant.name,
      email: participant.email,
      organization: organizationFromEmail(participant.email),
      sourceReferences: [conversations[0].sourceReference]
    }));
    return [...new Map(people.map((person) => [person.email ?? person.name ?? person.id, person])).values()];
  }

  private async searchMessageIds(input: SearchConversationsInput): Promise<string[]> {
    const params = new URLSearchParams({
      maxResults: String(input.limit),
      q: buildGmailQuery(input)
    });
    const response = await this.request<GmailMessageList>(`/users/me/messages?${params}`);
    return (response.messages ?? []).map((message) => message.id);
  }

  private async getMessage(id: string): Promise<GmailMessage> {
    return this.request<GmailMessage>(`/users/me/messages/${encodeURIComponent(id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Date`);
  }

  private async request<T>(path: string): Promise<T> {
    const accessToken = await this.options.tokenProvider.getAccessToken();
    const response = await this.fetchImpl(`https://gmail.googleapis.com/gmail/v1${path}`, {
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Gmail request failed with ${response.status}`);
    return await response.json() as T;
  }

  private normalizeMessage(message: GmailMessage): ConversationItem {
    const headers = new Map((message.payload?.headers ?? []).map((header) => [header.name.toLowerCase(), header.value]));
    const timestamp = message.internalDate ? new Date(Number(message.internalDate)).toISOString() : new Date(headers.get("date") ?? Date.now()).toISOString();
    const title = headers.get("subject") ?? "(No subject)";
    const participants = [headers.get("from"), headers.get("to"), headers.get("cc")]
      .filter(Boolean)
      .flatMap((value) => parseAddressList(value!));

    return {
      id: `gmail:${message.id}`,
      type: "email",
      title,
      timestamp,
      participants,
      summary: message.snippet ?? "Gmail message matched the search query.",
      excerpt: message.snippet,
      sourceReference: {
        provider: "gmail",
        sourceType: "conversation",
        externalId: message.id,
        title,
        timestamp
      }
    };
  }
}

function buildGmailQuery(input: SearchConversationsInput): string {
  const parts: string[] = [];
  if (input.query) parts.push(input.query);
  if (input.organization) parts.push(input.organization);
  for (const participant of input.participants ?? []) parts.push(`from:(${participant}) OR to:(${participant})`);
  if (input.start) parts.push(`after:${Math.floor(new Date(input.start).getTime() / 1000)}`);
  if (input.end) parts.push(`before:${Math.floor(new Date(input.end).getTime() / 1000)}`);
  return parts.join(" ");
}

function parseAddressList(value: string) {
  return value.split(",").map((part) => {
    const match = part.trim().match(/^(?:"?([^"<]*)"?\s)?<?([^<>\s]+@[^<>\s]+)>?$/);
    return {
      name: match?.[1]?.trim() || undefined,
      email: match?.[2]?.trim().toLowerCase()
    };
  }).filter((item) => item.email || item.name);
}

function organizationFromEmail(email: string | undefined): string | undefined {
  const domain = email?.split("@")[1];
  if (!domain || ["gmail.com", "googlemail.com", "outlook.com", "yahoo.com", "icloud.com"].includes(domain)) return undefined;
  const label = domain.split(".")[0];
  return label ? `${label[0].toUpperCase()}${label.slice(1)}` : undefined;
}
