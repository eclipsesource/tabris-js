#!/bin/bash
#
# Usage: update-android tabris-ui

TABRIS_ANDROID_HOME=../tabris-android/tabris-android
EXAMPLE_APP=$1

sed -i -e 's/\.LauncherActivity/\.JavaScriptLauncherActivity/' \
  ${TABRIS_ANDROID_HOME}/tabris-android-launcher/src/main/AndroidManifest.xml

cat src/js/rhino-console-shim.js src/js/tabris.js > \
  ${TABRIS_ANDROID_HOME}/tabris-android/src/main/res/raw/tabris.js

if [ -n "${EXAMPLE_APP}" ]; then
  rsync -r --delete examples/js/${EXAMPLE_APP}/ \
    ${TABRIS_ANDROID_HOME}/tabris-android-launcher/src/main/assets/js/
fi

