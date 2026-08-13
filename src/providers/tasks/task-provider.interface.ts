import { ActivityItem, ChangeItem, GetRecentChangesInput, OpenItem, SearchActivityInput, SearchOpenItemsInput } from "../../domain/schemas/search.js";

export interface ActivityProvider {
  searchActivity(input: SearchActivityInput): Promise<ActivityItem[]>;
}

export interface OpenItemsProvider {
  searchOpenItems(input: SearchOpenItemsInput): Promise<OpenItem[]>;
}

export interface ChangeProvider {
  getRecentChanges(input: GetRecentChangesInput): Promise<ChangeItem[]>;
}
