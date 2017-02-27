# How to contribute
At EclipseSource we love contributions.
The following guide will help you get started contributing to Tabris.js
and Tabris.js tools.

# Getting Started
To contribute to the Tabris.js first begin by forking the project on
GitHub. Once you have forked the project, clone it locally and create a new
feature branch for your work:
```
git checkout -b feature_branch_name master
```

## Setting up your Development Environment
Once you have cloned the repository, run `npm install` and `npm install -g grunt-cli`.
Finally, use `grunt` to run invoke the Tabris.js build.

## Coding Styles and Linting Rules
The Tabris.js project includes a `.eslintrc` file with the linting rules
for the project. In addition to the rules defined here, you should format your code
to resemble the existing code. In particular:
 * Only use Unix style line breaks
 * No trailing whitespace
 * Indent by 2 spaces, no tabs

Visual Studio Code will use the `.eslintrc` file and flag any linting errors if
the ESLint plugin is installed. You can get the plugin from [here](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).
You can also invoke `eslint` manually by running `npm test` from the root
of the project.

## Running the Tests
The Tabris.js contains a test suite. Run `npm test` from
the root of the project to invoke the test suite. When adding new functionality, please
try and add a new test case.

## Committing Code
At EclipseSource we value good commit messages. Since our team is distributed across
the globe, we use the git commit message to as a primary means of communicating. Please
follow these [*Seven Rules of a Great Commit Message*](https://chris.beams.io/posts/git-commit/):
 1. Separate subject from body with a blank line
 2. Limit the subject line to 50 characters
 3. Capitalize the subject line
 4. Do not end the subject line with a period
 5. Use the imperative mood in the subject line
 6. Wrap the body at 72 characters
 7. Use the body to explain what and why vs. how

For example:
```
Summarize changes in around 50 characters or less

More detailed explanatory text, if necessary. Wrap it to about 72
characters or so. In some contexts, the first line is treated as the
subject of the commit and the rest of the text as the body. The
blank line separating the summary from the body is critical (unless
you omit the body entirely); various tools like `log`, `shortlog`
and `rebase` can get confused if you run the two together.

Explain the problem that this commit is solving. Focus on why you
are making this change as opposed to how (the code explains that).
Are there side effects or other unintuitive consequences of this
change? Here's the place to explain them.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded
   by a single space, with blank lines in between, but conventions
   vary here

If you use an issue tracker, put references to them at the bottom,
like this:

Resolves: #123
See also: #456, #789
```

# Submitting Pull Requests
If you wish to contribute changes back to the Tabris.js, first push
your branch to github:
```
git push origin feature_branch_name -u
```
Use the *GitHub* Create Pull Request feature. Set the base of the Pull Request
to `EclipseSource` `master`.

## Updating the Pull Request
Code reviews are central to all our work at EclipseSource. We use
code reviews to better understand contributions, share knowledge
and provide feedback. We also believe that each commit should
compile, and each commit should be self contained.

As we work through a Pull Request, we may ask for updates. If you
update a Pull Request, use `git commit --amend` to update the
commit and push your branch back. Because you updated a feature
branch, you'll need to use `push -f`.
