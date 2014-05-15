
Sources and tests for *tabris.js*

Update tabris-android with latest tabris.js

    cat src/js/rhino-console-shim.js src/js/tabris.js >> \
      ../tabris-android/tabris-android/tabris-android/src/main/res/raw/tabris.js
    sed -i -e 's/\.LauncherActivity/\.JavaScriptLauncherActivity/' \
      ../tabris-android/tabris-android/tabris-android-launcher/src/main/AndroidManifest.xml

Copy example app to tabris-android

    rsync -r --delete examples/js/tabris-ui/ \
      ../tabris-android/tabris-android/tabris-android-launcher/src/main/assets/js/

Copy tabris.js to tabris-ios

    cp -a src/js/tabris.js ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/Tabris.js
    cd ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/
    xxd -i Tabris.js > Tabris_js.h

Copy example app to tabris-ios

    rm -f ../tabris-ios/Tabris/TabrisJS/js/*
    cp -a examples/js/tabris-ui/* ../tabris-ios/Tabris/TabrisJS/js/
