# Patching a Tabris.js App

Publishing a new app version to the app stores can take time. Tabris.js allows you to deploy hotfixes to your users immediately, without waiting for an app store update.

Please note that in order to comply with the Apple App Store rules, a patch must *“[…] not change the primary purpose of the app by providing features or functionality that are inconsistent with the intended and advertised purpose”
– (iOS Developer Program License Agreement section 3.3.2)*.

## The Patch Format

A patch is made available as a zip archive that contains the app files to be modified or added, and an optional descriptor file named `patch.json`. See below for more information on the *patch.json* descriptor file.

You can patch any file in your application, including scripts, images, and even modules in the `node_modules` folder. The root of the zip archive corresponds to the root of your Tabris.js project. For example, to update a file *app.js* and add another file *img/image.jpg* a patch could look like this:

**Example project structure**

```bash
src
├── app.js
└── …
…
package.json
```

**Corresponding patch zip contents**

```bash
src
└── app.js
img
└── image.jpg
patch.json
```

**Note:** If you have a local cordova build, you may have pre-process your source files before copying them to the folder `cordova/www`. In this case, the patch must correspond to the files that end up in `cordova/www`.

## Discovering a Patch

Once you've created a patch, you have to make it available at a URL of your choice. The app can then discover the patch and download it.

You are free to implement the patch detection however you wish. For example, you could set up a REST service that provides information on available patches for a given application, platform, and version. Your application could check this service at regular intervals. You could also decide to use push notifications to inform apps of available patches.

## Installing a Patch

To install a patch, call the method `tabris.app.installPatch` with the URL of the patch file and a callback function with two parameters, *error* and *patch*. The patch file will be downloaded and installed in the background, but it won't have an effect before the app is reloaded. _Note: Tabris.js supports cache-control headers. If new updates are not being found by Tabris.js, check the cache invalidation settings of your HTTP server._

In case of an error, the callback is called with an [Error object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) as the first parameter. The `error.message` field will contain an error message. If the patch has been installed successfully, the second argument will contain the parsed content of the *patch.json* file included in the patch archive, if present.

The format and content of the *patch.json* descriptor file is not enforced by Tabris.js. You can use it to include details about the patch, such as a version number or a confirmation message to be displayed.

On the next start of the app, files present in the patch will overlay the app files. You can use the callback to confirm and reload the app. Here's a simple example:

```javascript
tabris.app.installPatch(patchUrl, function(error, patch) {
  if (error) {
    // show error dialog
  } else {
    // confirm reload
    tabris.app.reload();
  }
});
```

Multiple patches can be applied on top of each other. If an application has been patched before, subsequent patches will overlay previous ones.

Please note that this feature is considered provisional and the API described here may be adjusted in a future release.
