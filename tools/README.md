# Documentation Authoring Notes

## Template Variables

The documentation generator looks for placeholders of the pattern `"${doc:<variable>}"` in both markdown and json files, for example `"${doc:moduleversion}"`. Valid values for `<variable>` are:

* `"moduleversion"` - The tabris version taken from `package.json`.
* `""snippetsUrl""` - The url to the snippets directory on github.
* `""examplesUrl""` - The url to the tabris-decorators examples directory on github.
* `"<type>"` - Creates an markdown link to the relevant article using a monospaced font. Supports all documented tabris types (like `LayoutData` or `LayoutDataValue`), the most common built-in JS types (such as `Array`) and `any`.
* `"<type>Url"` - As above, but inserts only the url to the article, not an entire markdown link.
* `"<snippet>"` - The file name of a snippet, like `composite.jsx`. Inserts an url to the file on github.
* `"<schema>"` - The file name of a json schema file provided by tabris, like `colors.json`. Inserts an url to the file on github.
* `"<example>"` - The directory name of an example in the `tabris-decorators` repository, like `bind-listview-list`. Inserts an url to the appropriate directory on github.

All github urls point to a specific branch based on the version in `package.json`.
