#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
variant="${1:?Bitte devDebug oder devRelease angeben.}"
shift
case "$variant" in
  devDebug) task='assembleDevDebug' ;;
  devRelease) task='assembleDevRelease' ;;
  *) echo 'Nur MaschinenLog-Dev-Builds sind hier erlaubt.' >&2; exit 1 ;;
esac
export ANDROID_HOME="${ANDROID_HOME:-$HOME/.local/android-sdk}"
if [ -z "${JAVA_HOME:-}" ] && [ -x "$HOME/.local/jdk-21/bin/javac" ]; then
  export JAVA_HOME="$HOME/.local/jdk-21"
fi
if [ ! -f .local/maschinenlog-dev.keystore ]; then
  mkdir -p .local
  keytool_bin="${JAVA_HOME:+$JAVA_HOME/bin/}keytool"
  "$keytool_bin" -genkeypair -keystore .local/maschinenlog-dev.keystore -storepass android -keypass android -alias androiddebugkey -dname 'CN=MaschinenLog Local Development' -keyalg RSA -keysize 2048 -validity 10000 -noprompt
fi
npx expo prebuild --platform android --no-install
if [ "$variant" = 'devRelease' ]; then
  cmp plugins/store-AndroidManifest.xml android/app/src/devRelease/AndroidManifest.xml
fi
cd android
./gradlew :app:"$task" -PreactNativeArchitectures=arm64-v8a,x86_64 --max-workers=4 "$@"
