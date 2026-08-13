import { ConversationItem, SearchConversationsInput, Person, SearchPeopleInput } from "../../domain/schemas/search.js";

export interface CommunicationProvider {
  searchConversations(input: SearchConversationsInput): Promise<ConversationItem[]>;
  searchPeople?(input: SearchPeopleInput): Promise<Person[]>;
}
