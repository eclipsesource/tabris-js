
Sources and tests for *tabris.js*

Copy tabris.js to tabris-android

    cp src/js/tabris.js ../tabris-android/tabris-android/tabris-android/src/main/res/raw/tabris.js

Copy example app to tabris-android

    rm -f ../tabris-android/tabris-android/tabris-android-launcher/src/main/assets/js
    cp -a examples/js/tabris-ui ../tabris-android/tabris-android/tabris-android-launcher/src/main/assets/js
