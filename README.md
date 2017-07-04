# Tez-Native based on amazing Tabris.js

# Guide
Please, follow the guide to run this app

Requires apps:
* `node`
* `npm`

Implemented features:
* `React`-like class based state-ful and life-cycle method supported custom components
* `View`, `SVGSupport` (not tested) component
* `JSX Event system`, amazing feature by other tabris.js contributor, helps alot
* `JSX "style" attribute`
* `JSX "append" system`, for reducing code and better code-style
* `performance.now` implementation, for accurate timing with subprecision
* `requestAnimationFrame` implementation, for new bie devs
* `Hot-Reload` implementation, not best as other, but helps in many ways
* `Virtual Tabris Widgets Tree` implementation, not too performant, but does really improvement for performance if you create real app with much of change

To-Do:
* `SVGSupport` full implementation


Steps:
* Download this repo
* Extract and Open this folder
* Run `npm install && npm run build`
* Copy the `tabris.js` and `tabris.js.map` (optional) file's
* Paste to `${YOUR_TABRIS_PROJECT}/node_modules/tabris`
* Now you can build your app

## License

Published under the terms of the [BSD 3-Clause License](LICENSE).
