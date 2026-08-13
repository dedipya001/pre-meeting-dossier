import { DocumentItem, SearchDocumentsInput } from "../../domain/schemas/search.js";

export interface DocumentProvider {
  searchDocuments(input: SearchDocumentsInput): Promise<DocumentItem[]>;
}
