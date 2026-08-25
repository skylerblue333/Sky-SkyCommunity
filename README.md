# SkyCommunity Core

**Status: engineering beta / reusable domain core.** This repository provides deterministic community ownership and membership rules for SKYCOIN4444 components.

## Supported today

- bounded community creation;
- automatic owner membership;
- idempotent member joins;
- member leave operations;
- owner-orphan protection;
- explicit ownership transfer to an existing member;
- deterministic member snapshots;
- strict TypeScript build and tests.

## Not claimed

This is not a deployed social network, database service, moderation platform, identity provider, messaging system, payments product, recommendation engine, or production community backend. State is process-local. Production use requires durable storage, authentication/RBAC, moderation/audit controls, privacy controls, rate limiting, observability, backups, and deployment evidence.

## Development

```bash
npm install
npm run check
npm test
```

## SKYCOIN4444 integration

The core is intended to complement the flagship community API rather than replace its persistence layer. Consumers can reuse these ownership/membership invariants behind a durable adapter.

## License

See `LICENSE`.
