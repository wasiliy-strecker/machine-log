# 2026-11-11 06:56 - Explain Apple Vision in the privacy policy

## Task

Add iOS/iPadOS OCR information to both privacy-policy languages and publish
the update on GitHub Pages using the existing app links.

## Status

completed

## Changes

- Describe Apple Vision recognition as processing photos and recognized text
  entirely on the device, without sending them to Apple, Google or AppFabrik AI
  for recognition. Link Apple's text-recognition documentation.
- Explicitly limit the existing ML Kit, SDK metrics and network-permission
  statements to Android. Preserve the SDK telemetry qualification.
- Update both policy dates and `PRIVACY.md` to 11 November 2026.

## Verification

- Reviewed German and English wording against the native OCR implementation
  and Apple's documentation.
- Prettier and `git diff --check` passed. HTML nesting, unique IDs, local links,
  language navigation and absence of embedded scripts were checked.
- All eight external URLs returned HTTP 200, including the Apple reference.
- Published policy commit `7ea0ac6`. Both public language pages returned HTTP
  200 and exactly matched the reviewed HTML, including the new date and Vision
  paragraph. Their existing URLs and language links remain valid.
- Local validation evidence is under ignored
  `build/validation/2026-11-11-ios-privacy/`.

## Publication

Published from a separate worktree based on remote `main` at `3f53749`, keeping
the 27 existing local app commits out of this update. Used the existing
authenticated GitHub SSH connection after HTTPS had no credentials available.
No force push or remote configuration change.

## Notes

App code, Store forms and installed apps are unchanged. No app build is needed
for this policy-only update. The unrelated October 29 changelog edit remains
outside the task.
