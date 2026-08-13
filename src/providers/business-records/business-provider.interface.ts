import { BusinessRecord, SearchBusinessRecordsInput } from "../../domain/schemas/search.js";

export interface BusinessRecordProvider {
  searchRecords(input: SearchBusinessRecordsInput): Promise<BusinessRecord[]>;
}
