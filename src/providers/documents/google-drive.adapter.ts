import { AccessTokenProvider } from "../../auth/access-token-provider.js";
import { DocumentItem, SearchDocumentsInput } from "../../domain/schemas/search.js";
import { BaseProvider } from "../provider.interface.js";
import { DocumentProvider } from "./document-provider.interface.js";

type DriveFilesResponse = {
  files?: Array<{
    id: string;
    name: string;
    mimeType?: string;
    modifiedTime?: string;
    webViewLink?: string;
    description?: string;
  }>;
};

export type GoogleDriveAdapterOptions = {
  tokenProvider: AccessTokenProvider;
  fetchImpl?: typeof fetch;
};

export class GoogleDriveAdapter implements BaseProvider, DocumentProvider {
  metadata = {
    id: "google-drive",
    displayName: "Google Drive",
    capabilities: ["documents"] as const
  };

  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: GoogleDriveAdapterOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async searchDocuments(input: SearchDocumentsInput): Promise<DocumentItem[]> {
    const params = new URLSearchParams({
      pageSize: String(input.limit),
      fields: "files(id,name,mimeType,modifiedTime,webViewLink,description)",
      q: buildDriveQuery(input)
    });
    const response = await this.request<DriveFilesResponse>(`/files?${params}`);
    return (response.files ?? []).map((file) => ({
      id: `google-drive:${file.id}`,
      title: file.name,
      type: file.mimeType,
      updatedAt: file.modifiedTime,
      summary: file.description,
      matchedContext: `Matched Google Drive metadata for query: ${input.query}`,
      sourceReference: {
        provider: "google-drive",
        sourceType: "document",
        externalId: file.id,
        title: file.name,
        timestamp: file.modifiedTime,
        url: file.webViewLink
      }
    }));
  }

  private async request<T>(path: string): Promise<T> {
    const accessToken = await this.options.tokenProvider.getAccessToken();
    const response = await this.fetchImpl(`https://www.googleapis.com/drive/v3${path}`, {
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Google Drive request failed with ${response.status}`);
    return await response.json() as T;
  }
}

function buildDriveQuery(input: SearchDocumentsInput): string {
  const terms = [input.query, input.organization, ...(input.people ?? [])].filter(Boolean).join(" ");
  const escaped = terms.replace(/'/g, "\\'");
  const parts = [`trashed = false`, `name contains '${escaped}'`];
  if (input.start) parts.push(`modifiedTime >= '${input.start}'`);
  if (input.end) parts.push(`modifiedTime <= '${input.end}'`);
  return parts.join(" and ");
}
