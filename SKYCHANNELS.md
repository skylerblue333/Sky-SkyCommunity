# SkyChannels — Wave 2 slot #108 / Lane 12

SkyChannels is an engineering-beta creator-channel domain core inside the existing SkyCommunity package.

It provides bounded channel creation, public/private visibility, idempotent subscriptions, owner protection, deterministic snapshots, and a `canRead` access contract. External identifiers are validated before use.

## SKYCOIN4444 integration

Consumers may import `ChannelRegistry` from the package root and use channel IDs as stable references from creator/community features. The module intentionally does not duplicate SkyIdentity, SkyPolicy, messaging, media storage, notifications, payments, or persistence. Those remain separate integration boundaries.

## Security and truth boundaries

State is process-local and ephemeral. `canRead` is a deterministic domain decision only, not production authentication or authorization enforcement. The module does not claim live creator accounts, streaming infrastructure, moderation, payment connectivity, durable storage, multi-region availability, or production deployment.

Verification is inherited from this repository: strict TypeScript build/check, deterministic Node tests, and dependency audit CI.
