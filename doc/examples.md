---
---
# Examples

## Snippets

The `tabris-js` [repository](https://github.com/eclipsesource/tabris-js) contains dozens of [self-running snippets](https://github.com/eclipsesource/tabris-js/tree/v${doc:moduleversion}/snippets) demonstrating all **features of the Tabris.js core module**. These can be run directly from the [Tabris.js Playground](https://playground.tabris.com/) via the [Tabris.js Developer App](./developer-app.md). The API documentation example links point to the snippets in the playground.

You can also run a selection of UI-related snippets directly in the app without the playground.

All snippets use declarative UI and ES6 Module Syntax. Most also use JSX, and some TypeScript. Therefore they require the TypeScript compiler if you sideload them from your own machine.

## Databinding Examples

The `tabris-decorators` [repository](https://github.com/eclipsesource/tabris-decorators) contains minimalistic
[**databinding** and **redux** examples](https://github.com/eclipsesource/tabris-decorators/tree/v${doc:moduleversion}/examples) as complete tabris projects. The **ListView** and **ItemPicker** widgets (high-level extensions of `CollectionView` and `Picker`) are also demonstrated only here. They are also linked in the databinding documentation.

The examples can be easily run without local setup via the GitPod links provided in the README.md files. A GitHub account is required. The READMEs also contain comprehensive descriptions for each example.

Most example are provided in TypeScript/JSX (the directories without postfix) and JavaScript/JSX (directories with `-jsx` postfix.) There are also a few plain-JavaScript (no compiler) examples (`-js` postfix).

These examples all require the `tabris-decorators` module.

## Reddit Viewer

This example mimics a real-world [app to browse reddit pictures](https://github.com/eclipsesource/tabris-js-reddit-viewer/tree/${doc:moduleversion}). It utilizes a **Mode-View-ViewModel** pattern with TypeScript, **databinding** and **dependency injection**. You can also run it from GitPod.

## Todo App

[This example](https://github.com/eclipsesource/tabris-js-redux-todo/) showcases a very basic but complete **Redux** based Tabris.js application. It mainly demonstrates how to use Redux in a type-safe way (therefor it uses TypeScript/JSX) and showcases a setup where remote redux devtools are installed in the app when sideloading only.
