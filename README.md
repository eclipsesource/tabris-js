
Sources and tests for *tabris.js*

Copy tabris.js to tabris-android

    cp src/js/tabris.js ../tabris-android/tabris-android/tabris-android/src/main/res/raw/tabris.js

Copy example app to tabris-android

    rm -f ../tabris-android/tabris-android/tabris-android-launcher/src/main/assets/js
    cp -a examples/js/tabris-ui ../tabris-android/tabris-android/tabris-android-launcher/src/main/assets/js

Copy tabris.js to tabris-ios

    cp -a src/js/tabris.js ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/Tabris.js
    cd ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/
    xxd -i Tabris.js > Tabris_js.h
		
Copy example app to tabris-ios

    rm -f ../tabris-ios/Tabris/TabrisJS/js/*
    cp -a examples/js/tabris-ui/* ../tabris-ios/Tabris/TabrisJS/js/
