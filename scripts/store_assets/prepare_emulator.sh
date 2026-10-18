#!/usr/bin/env bash
# Run an existing Store release only in a new disposable screenshot emulator.
set -euo pipefail
profile=${1:?Usage: prepare_emulator.sh phone|tablet7|tablet10 OUTPUT}
out=$(realpath -m "${2:?Output directory required}")
case "$profile" in
  phone) width=1080; height=1920; density=360; device=pixel_6 ;;
  tablet7) width=1080; height=1920; density=240; device=Nexus\ 7\ 2013 ;;
  tablet10) width=1440; height=2560; density=240; device=Nexus\ 10 ;;
  *) echo 'Unknown capture profile' >&2; exit 2 ;;
esac
sdk=${ML_ANDROID_SDK:-/home/unknown/.local/android-sdk}
adb="$sdk/platform-tools/adb"
bundletool=${BUNDLETOOL_JAR:-$HOME/.local/share/app-factory/tools/bundletool-all-1.18.3.jar}
port=${ML_EMULATOR_PORT:-5586}
[[ "$port" =~ ^[0-9]+$ ]] && (( port >= 5554 && port <= 5682 && port % 2 == 0 ))
serial="emulator-$port"
if "$adb" devices | awk '{print $1}' | rg -qx "$serial"; then
  echo 'The selected emulator port is already in use.' >&2
  exit 1
fi
mkdir -p "$out/raw"
aab=$(realpath build/releases/production/maschinenlog-1.0.0-build-3-production.aab)
expected=18551c110e7fcf8b074e3fa8fc3c70f8d285049da7704721151beae797092397
[[ $(sha256sum "$aab" | awk '{print $1}') == "$expected" ]]
if [[ ! -f "$out/raw/store.apk" ]]; then
  java -jar "$bundletool" build-apks --bundle="$aab" --output="$out/raw/store.apks" --mode=universal
  unzip -p "$out/raw/store.apks" universal.apk > "$out/raw/store.apk"
fi
java -jar "$bundletool" dump manifest --bundle="$aab" --module=base > "$out/raw/source-manifest.xml"
work=$(mktemp -d /dev/shm/ml-store-assets-XXXXXX)
name="ml_store_assets_${profile}_$(date +%s)"
export ANDROID_AVD_HOME="$work/avd"
export ANDROID_SDK_ROOT="$sdk"
mkdir -p "$ANDROID_AVD_HOME"
printf 'no\n' | "$sdk/cmdline-tools/latest/bin/avdmanager" create avd --name "$name" \
  --package 'system-images;android-35;google_apis;x86_64' --path "$ANDROID_AVD_HOME/$name.avd" --device "$device"
python3 - "$ANDROID_AVD_HOME/$name.avd/config.ini" "$width" "$height" "$density" <<'PY'
import sys
from pathlib import Path
path = Path(sys.argv[1])
config = dict(line.split('=', 1) for line in path.read_text().splitlines() if '=' in line)
config.update({'hw.lcd.width': sys.argv[2], 'hw.lcd.height': sys.argv[3],
               'hw.lcd.density': sys.argv[4], 'hw.initialOrientation': 'Portrait',
               'hw.keyboard': 'yes', 'hw.mainKeys': 'no', 'hw.ramSize': '2048', 'vm.heapSize': '512',
               'showDeviceFrame': 'no', 'disk.dataPartition.size': '2G'})
path.write_text(''.join(f'{k}={v}\n' for k, v in config.items()))
PY
cp "$ANDROID_AVD_HOME/$name.avd/config.ini" "$out/raw/$profile-avd.ini"
printf '%s\n' "$work" > "$out/raw/$profile-workspace.txt"
"$sdk/emulator/emulator" -avd "$name" -port "$port" -no-window -no-audio \
  -no-snapshot -no-boot-anim -gpu swiftshader -memory 2048 -cores 4 \
  -camera-back none -camera-front none -prop persist.sys.locale=de-DE \
  > "$work/emulator.log" 2>&1 &
emulator_pid=$!
for attempt in $(seq 1 120); do
  if [[ $("$adb" -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r') == 1 ]]; then break; fi
  sleep 1
done
[[ $("$adb" -s "$serial" shell getprop ro.kernel.qemu | tr -d '\r') == 1 ]]
[[ $("$adb" -s "$serial" emu avd name | head -n1 | tr -d '\r') == "$name" ]]
[[ -z $("$adb" -s "$serial" shell pm list packages com.appfactory.maschinenlog) ]]
"$sdk/build-tools/35.0.0/aapt" dump badging "$out/raw/store.apk" | sed -n '1,3p'
"$adb" -s "$serial" install -r -t --no-streaming "$out/raw/store.apk"
"$adb" -s "$serial" shell dumpsys package com.appfactory.maschinenlog > "$out/raw/$profile-package.txt"
"$adb" -s "$serial" shell cmd uimode night no
"$adb" -s "$serial" shell cmd alarm set-timezone Europe/Berlin
"$adb" -s "$serial" shell settings put system accelerometer_rotation 0
"$adb" -s "$serial" shell settings put system user_rotation 0
"$adb" -s "$serial" shell settings put system font_scale 1.0
for setting in window_animation_scale transition_animation_scale animator_duration_scale; do
  "$adb" -s "$serial" shell settings put global "$setting" 0
done
"$adb" -s "$serial" shell pm grant com.appfactory.maschinenlog android.permission.POST_NOTIFICATIONS
"$adb" -s "$serial" shell am start -n com.appfactory.maschinenlog/.MainActivity
printf 'Ready: %s, %s, workspace %s\n' "$profile" "$serial" "$work"
wait "$emulator_pid"
