# Changes

## Unreleased

- `create` now clones cf-liwe3-ng and copies its tracked files using the same
  skip / copy-if-missing config logic as `liwe3-update.sh` (config copied to
  `data/liwe3-update.conf`), instead of merging git history.
- `update` reuses the same clone-and-copy logic instead of `git merge`.
