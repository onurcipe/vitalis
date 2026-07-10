# Changelog

## [0.2.0] - 2026-07-10

### Added

- `shouldBypassVersionProtection` flag on `Service` (service-wide via `ServiceOptions`, per call via `UpdateOneHooks`, `SoftDeleteOneHooks`, and `DeleteOneHooks`). When enabled, `updateOne`, `softDeleteOne`, and `deleteOne` drop the version gate from the operation's predicate so concurrent calls to the same record no longer reject each other. `version` is still incremented atomically via `$inc`, and `updated_at`/`soft_deleted_at` are stamped server-side via `$currentDate`. Semantics become last-write-wins per field. The `*ByIdAndVersion` methods are unchanged and remain the explicit optimistic-locking contract.
- `MongoDBRepository.toUpdateFilter` passes top-level update operators (`$inc`, `$currentDate`, ...) through to the driver instead of folding everything into `$set`.

### Changed

- Raised the `mongodb` floor to `^7.5.0`.

## [0.1.0] - 2026-06-27

### Added

- Initial release.

[0.2.0]: https://github.com/onurcipe/vitalis/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/onurcipe/vitalis/releases/tag/v0.1.0
