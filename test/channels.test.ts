import test from "node:test";
import assert from "node:assert/strict";

import { ChannelRegistry } from "../src/channels.js";

test("channel creation is deterministic and owner is subscribed", () => {
  const channels = new ChannelRegistry();
  const snapshot = channels.create("creator-news", "user-1", "Creator News", "public");
  assert.deepEqual(snapshot, {
    id: "creator-news",
    ownerId: "user-1",
    name: "Creator News",
    visibility: "public",
    memberIds: ["user-1"]
  });
});

test("subscriptions are idempotent and sorted", () => {
  const channels = new ChannelRegistry();
  channels.create("updates", "owner", "Updates", "public");
  channels.subscribe("updates", "z-user");
  channels.subscribe("updates", "a-user");
  channels.subscribe("updates", "a-user");
  assert.deepEqual(channels.get("updates").memberIds, ["a-user", "owner", "z-user"]);
});

test("private channel read contract requires membership", () => {
  const channels = new ChannelRegistry();
  channels.create("private-room", "owner", "Private Room", "private");
  assert.equal(channels.canRead("private-room"), false);
  assert.equal(channels.canRead("private-room", "guest"), false);
  channels.subscribe("private-room", "guest");
  assert.equal(channels.canRead("private-room", "guest"), true);
});

test("owner cannot unsubscribe", () => {
  const channels = new ChannelRegistry();
  channels.create("updates", "owner", "Updates", "public");
  assert.throws(() => channels.unsubscribe("updates", "owner"), /owner cannot unsubscribe/);
});

test("invalid external identifiers are rejected", () => {
  const channels = new ChannelRegistry();
  assert.throws(() => channels.create("bad id", "owner", "Updates", "public"), /invalid channel id/);
  assert.throws(() => channels.create("ok", "bad user", "Updates", "public"), /invalid owner id/);
});
