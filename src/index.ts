export type CommunityRole = "owner" | "member";

export interface CommunitySnapshot {
  id: string;
  name: string;
  ownerId: string;
  members: ReadonlyArray<{ userId: string; role: CommunityRole }>;
}

const ID_RE = /^[A-Za-z0-9._-]{1,96}$/;
const MAX_COMMUNITIES = 1_000;
const MAX_MEMBERS = 10_000;

export class CommunityRegistry {
  readonly #communities = new Map<string, {
    id: string;
    name: string;
    ownerId: string;
    members: Map<string, CommunityRole>;
  }>();

  create(id: string, name: string, ownerId: string): CommunitySnapshot {
    this.#validateId(id, "community id");
    this.#validateId(ownerId, "owner id");
    const normalizedName = name.trim();
    if (normalizedName.length < 2 || normalizedName.length > 120) throw new Error("invalid community name");
    if (this.#communities.has(id)) throw new Error("community already exists");
    if (this.#communities.size >= MAX_COMMUNITIES) throw new Error("community capacity exceeded");

    this.#communities.set(id, {
      id,
      name: normalizedName,
      ownerId,
      members: new Map([[ownerId, "owner"]])
    });
    return this.get(id);
  }

  join(communityId: string, userId: string): CommunitySnapshot {
    this.#validateId(userId, "user id");
    const community = this.#getMutable(communityId);
    if (!community.members.has(userId) && community.members.size >= MAX_MEMBERS) throw new Error("member capacity exceeded");
    if (!community.members.has(userId)) community.members.set(userId, "member");
    return this.get(communityId);
  }

  leave(communityId: string, userId: string): CommunitySnapshot {
    const community = this.#getMutable(communityId);
    if (userId === community.ownerId) throw new Error("owner cannot leave without ownership transfer");
    community.members.delete(userId);
    return this.get(communityId);
  }

  transferOwnership(communityId: string, currentOwnerId: string, nextOwnerId: string): CommunitySnapshot {
    const community = this.#getMutable(communityId);
    this.#validateId(nextOwnerId, "next owner id");
    if (community.ownerId !== currentOwnerId) throw new Error("only current owner can transfer ownership");
    if (!community.members.has(nextOwnerId)) throw new Error("next owner must already be a member");
    community.members.set(currentOwnerId, "member");
    community.members.set(nextOwnerId, "owner");
    community.ownerId = nextOwnerId;
    return this.get(communityId);
  }

  get(communityId: string): CommunitySnapshot {
    const community = this.#getMutable(communityId);
    const members = [...community.members.entries()]
      .map(([userId, role]) => ({ userId, role }))
      .sort((a, b) => a.userId.localeCompare(b.userId));
    return Object.freeze({
      id: community.id,
      name: community.name,
      ownerId: community.ownerId,
      members: Object.freeze(members)
    });
  }

  #getMutable(id: string) {
    const community = this.#communities.get(id);
    if (!community) throw new Error("community not found");
    return community;
  }

  #validateId(value: string, label: string): void {
    if (!ID_RE.test(value)) throw new Error(`invalid ${label}`);
  }
}
