
Sources and tests for *tabris.js*

Update tabris-android with latest tabris.js and example project

    ./update-android tabris-ui

Copy tabris.js to tabris-ios

    cp -a src/js/tabris.js ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/Tabris.js
    cd ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/
    xxd -i Tabris.js > Tabris_js.h

Copy example app to tabris-ios

    rm -f ../tabris-ios/Tabris/TabrisJS/js/*
    cp -a examples/js/tabris-ui/* ../tabris-ios/Tabris/TabrisJS/js/
