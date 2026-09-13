# Consumer fixture

The fixture installs the built package from `file:../..`. Install it with npm:

```sh
npm --prefix tests/consumer run install:lib
```

pnpm 12.4.1 fails for this isolated local-file dependency. Its lockfile resolver turns `file:../..` into `wari@file:` and rejects the empty path. Keeping the fixture outside the root workspace lets it exercise a consumer install; npm's `--install-links` installs the directory dependency as a package rather than a symlink.
