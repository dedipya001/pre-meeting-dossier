import { SourceReference } from "../domain/schemas/common.js";

export class EvidenceService {
  requireSource<T extends { sourceReference?: SourceReference; sourceReferences?: SourceReference[] }>(item: T): T {
    const hasEvidence = Boolean(item.sourceReference || item.sourceReferences?.length);
    if (!hasEvidence) throw new Error("Normalized evidence item is missing a source reference");
    return item;
  }
}
