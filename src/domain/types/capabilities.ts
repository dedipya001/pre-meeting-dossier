export type Capability =
  | "calendar"
  | "communications"
  | "documents"
  | "people"
  | "organizations"
  | "business_records"
  | "tasks"
  | "activity"
  | "open_items"
  | "changes";

export type ConnectionStatus = "connected" | "expired" | "revoked" | "error";

export type ProviderConnection = {
  id: string;
  userId: string;
  provider: string;
  capabilities: Capability[];
  status: ConnectionStatus;
};
