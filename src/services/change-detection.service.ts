import { ChangeItem } from "../domain/schemas/search.js";
import { SourceReference } from "../domain/schemas/common.js";

export class ChangeDetectionService {
  diffRecords(previous: Record<string, unknown>, current: Record<string, unknown>, sourceReference: SourceReference): ChangeItem[] {
    return ["status", "stage", "owner", "dueDate", "priority", "value"].flatMap((field) => {
      if (previous[field] === current[field]) return [];
      return [{
        type: `${field}_changed`,
        timestamp: new Date().toISOString(),
        title: `${field} changed`,
        description: `${String(previous[field])} -> ${String(current[field])}`,
        importance: field === "status" || field === "stage" ? "high" as const : "medium" as const,
        sourceReference
      }];
    });
  }
}
