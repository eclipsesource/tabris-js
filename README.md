
Sources and tests for *tabris.js*
=================================

Build
-----

Install [Grunt](http://gruntjs.com) using npm:

    npm install -g grunt-cli

Fetch dependencies from npm:

    npm install --save-dev

Build:

    grunt [-v]

Update tabris-android
---------------------

Copy latest tabris.js and example project to local android-js repository:

    ./update-android tabris-ui

Update tabris-ios
-----------------

Copy tabris.js to tabris-ios

    cp -a build/tabris.js ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/Tabris.js
    cd ../tabris-ios/Tabris/TabrisJS/Classes/JSBinding/
    xxd -i Tabris.js > Tabris_js.h

Copy example app to tabris-ios

    rm -f ../tabris-ios/Tabris/TabrisJS/js/*
    cp -a examples/js/tabris-ui/* ../tabris-ios/Tabris/TabrisJS/js/
