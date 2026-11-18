# Changesets

Each change that users of `@gogoui/tokens` or `@gogoui/ui` will notice gets
a changeset: run `bun run changeset`, pick the bump (patch: a fix, minor: a
new component or variant, major: a renamed or removed prop) and write one
line about it. The release workflow turns them into a version, a CHANGELOG
entry and an npm publish. Both packages always share the same version.
