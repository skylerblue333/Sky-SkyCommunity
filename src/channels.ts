const CHANNEL_ID_RE = /^[A-Za-z0-9._-]{1,96}$/;
const MAX_NAME_CHARS = 120;
const MAX_CHANNELS = 1_000;

export type ChannelVisibility = "public" | "private";

export interface ChannelSnapshot {
  id: string;
  ownerId: string;
  name: string;
  visibility: ChannelVisibility;
  memberIds: ReadonlyArray<string>;
}

function validateId(value: string, label: string): string {
  if (typeof value !== "string" || !CHANNEL_ID_RE.test(value)) throw new Error(`invalid ${label}`);
  return value;
}

export class ChannelRegistry {
  readonly #channels = new Map<string, {
    id: string;
    ownerId: string;
    name: string;
    visibility: ChannelVisibility;
    members: Set<string>;
  }>();

  create(id: string, ownerId: string, name: string, visibility: ChannelVisibility): ChannelSnapshot {
    validateId(id, "channel id");
    validateId(ownerId, "owner id");
    const normalizedName = name.trim();
    if (!normalizedName || normalizedName.length > MAX_NAME_CHARS) throw new Error("invalid channel name");
    if (visibility !== "public" && visibility !== "private") throw new Error("invalid channel visibility");
    if (this.#channels.has(id)) throw new Error("channel already exists");
    if (this.#channels.size >= MAX_CHANNELS) throw new Error("channel capacity exceeded");

    this.#channels.set(id, {
      id,
      ownerId,
      name: normalizedName,
      visibility,
      members: new Set([ownerId])
    });
    return this.get(id);
  }

  subscribe(channelId: string, userId: string): ChannelSnapshot {
    validateId(userId, "user id");
    const channel = this.#getMutable(channelId);
    channel.members.add(userId);
    return this.get(channelId);
  }

  unsubscribe(channelId: string, userId: string): ChannelSnapshot {
    const channel = this.#getMutable(channelId);
    if (channel.ownerId === userId) throw new Error("owner cannot unsubscribe");
    channel.members.delete(userId);
    return this.get(channelId);
  }

  canRead(channelId: string, userId?: string): boolean {
    const channel = this.#getMutable(channelId);
    if (channel.visibility === "public") return true;
    return typeof userId === "string" && channel.members.has(userId);
  }

  get(channelId: string): ChannelSnapshot {
    const channel = this.#getMutable(channelId);
    return Object.freeze({
      id: channel.id,
      ownerId: channel.ownerId,
      name: channel.name,
      visibility: channel.visibility,
      memberIds: Object.freeze([...channel.members].sort())
    });
  }

  #getMutable(id: string) {
    const channel = this.#channels.get(id);
    if (!channel) throw new Error("channel not found");
    return channel;
  }
}
