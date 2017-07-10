---
---
# Tabris.js release engineering

### Check versions

When the minor or major version has been changed, ensure that the version number in the documentation matches. Only the major.minor version is relevant for the documentation, because patch versions do not affect the feature set.

Adjust dependencies in snippets / examples if needed.

### Set an *annotated* tag

    git tag -a v1.x.x

### Push it to github (gerrit does not yet allow for tags)

    git push github v1.x.x

### Trigger a Jenkins build and keep it

https://build.eclipsesource.com/tabris/jenkins/job/tabris-js

- Button "Keep this build forever"
- Click "add description" and add the version number

### Run a full build

    grunt

### Publish to npm

**Take care. Once published to npm, this version cannot be replaced!**

    cd build/tabris
    npm login
    npm whoami (should be eclipsesource)
    npm publish .

The tgz archive transmitted to npm can be found in `~/.npm/tabris/0.x.x/package.tgz`.

### Increment patch version in package.json

According to [Semantic Versioning](http://semver.org), backwards-compatible fixes must increment the patch version. Doing this before any changes ensures that it won't be forgotten.
