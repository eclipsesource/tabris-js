This example showcases how jQuery's Ajax API can be used in tabris.js.
Since the DOM manipulations will not work in tabris, we use a custom jQuery
lib that only contains the Ajax API. It's built with

    grunt custom:-ajax/script,-ajax/jsonp,-css,-deprecated,-dimensions,-effects,-event,-event/alias,-offset,-wrap,-ready,-deferred,-exports/amd,-sizzle

and compressed using [ugilify-js](https://www.npmjs.org/package/uglify-js).

For details on build custom jQuery, see https://github.com/jquery/jquery#how-to-build-your-own-jquery
