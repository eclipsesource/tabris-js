# Tabris.js release engineering

### Set an *annotated* tag

    git tag -a v0.x.x

### Push it to github (gerrit does not yet allow for tags)

    git push origin v0.x.x

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
    npm publish .

The tgz archive transmitted to npm can be found in `~/.npm/tabris/0.x.x/package.tgz`.

### Increment patch version

According to [Semantic Versioning](http://semver.org), backwards-compatible fixes must increment the patch version. Doing this before any changes ensures that it won't be forgotten.

Increment the version in:

- package.json
- documentation

Snippets / examples dependencies should be adjusted as needed.
