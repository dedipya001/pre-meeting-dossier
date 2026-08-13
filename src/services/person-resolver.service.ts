import { Person } from "../domain/schemas/search.js";

export class PersonResolver {
  normalizeKey(person: Pick<Person, "email" | "name" | "organization">): string {
    if (person.email) return person.email.toLowerCase();
    if (person.name && person.organization) return `${person.organization.toLowerCase()}::${person.name.toLowerCase()}`;
    return (person.name ?? "unknown").toLowerCase();
  }

  dedupe(people: Person[]): Person[] {
    return [...new Map(people.map((person) => [this.normalizeKey(person), person])).values()];
  }
}
