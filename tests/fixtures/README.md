# Synthetic legacy backup

`backup-v1.bin` was created with the unchanged backup codec from commit
`82f184f` before the backup performance changes on 16 October 2026.
It uses the original `MLBACK01` format and 600000 PBKDF2-SHA256 iterations.
The public test password is `Synthetic legacy ä🔑`.

All content is synthetic. The fixture contains one machine, a reading corrected
from 100 to 101, an original photo, a current photo and a two-page legacy PDF.
The photos come from `assets/synthetic-photo.jpg`. The PDF was generated from
the synthetic text fixture in `tests/support.ts`. No device data is included.
`backup-v1.json` records the exact snapshot before encryption.

Keep these files fixed so that compatibility tests cannot accidentally pass
by generating both ends of a round trip with the new implementation.
