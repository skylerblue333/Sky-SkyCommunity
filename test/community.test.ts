import assert from "node:assert/strict";
import test from "node:test";
import { CommunityRegistry } from "../src/index.js";

test("creates community with owner membership and idempotent joins", () => {
  const registry = new CommunityRegistry();
  let community = registry.create("community.one", "Community One", "user.owner");
  assert.deepEqual(community.members, [{ userId: "user.owner", role: "owner" }]);

  community = registry.join("community.one", "user.member");
  community = registry.join("community.one", "user.member");
  assert.equal(community.members.length, 2);
});

test("prevents owner orphaning and supports explicit ownership transfer", () => {
  const registry = new CommunityRegistry();
  registry.create("community.one", "Community One", "user.owner");
  registry.join("community.one", "user.next");
  assert.throws(() => registry.leave("community.one", "user.owner"), /owner cannot leave/);

  const transferred = registry.transferOwnership("community.one", "user.owner", "user.next");
  assert.equal(transferred.ownerId, "user.next");
  assert.deepEqual(transferred.members, [
    { userId: "user.next", role: "owner" },
    { userId: "user.owner", role: "member" }
  ]);
});

test("rejects invalid identifiers and missing communities", () => {
  const registry = new CommunityRegistry();
  assert.throws(() => registry.create("bad id", "Community", "owner"));
  assert.throws(() => registry.get("missing"), /not found/);
});
