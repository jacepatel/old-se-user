grunt build;
ionic build --release android;
rm -r StreetEats.apk;
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -storepass tomCat2014 -keystore streeteats.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk StreetEats;
$ANDROID_HOME/build-tools/19.1.0/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk StreetEats.apk;
