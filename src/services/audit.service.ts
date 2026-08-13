export type AuditEventInput = {
  userId?: string;
  action: string;
  provider?: string;
  metadata?: Record<string, unknown>;
};

export class AuditService {
  async record(event: AuditEventInput): Promise<void> {
    console.info(JSON.stringify({
      type: "audit",
      action: event.action,
      provider: event.provider,
      userId: event.userId,
      metadata: event.metadata,
      timestamp: new Date().toISOString()
    }));
  }
}
