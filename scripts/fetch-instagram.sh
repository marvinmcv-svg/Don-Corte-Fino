#!/usr/bin/env bash
# Downloads Don Corte Fino's Instagram photos and drops them into the slots the site
# reads (public/images/...). Run it on your own computer:
#
#   ./scripts/fetch-instagram.sh <instagram_username>        # whole profile
#   ./scripts/fetch-instagram.sh <instagram_username> login  # if Instagram asks you to log in
#
# Requires Python 3. Photos are assigned newest-first: 8 gallery, 5 journey.
# You can always rename/replace files by hand afterwards — see README "Photos".
set -euo pipefail

USER_NAME="${1:?usage: fetch-instagram.sh <instagram_username> [login]}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf -- "$TMP"' EXIT

python3 -m pip install --quiet --user instaloader

ARGS=(--no-videos --no-video-thumbnails --no-captions --no-metadata-json --no-compress-json
      --dirname-pattern "$TMP/{profile}" --count 40)
[[ "${2:-}" == "login" ]] && ARGS+=(--login "$USER_NAME")

python3 -m instaloader "${ARGS[@]}" -- "$USER_NAME"

mapfile -t PHOTOS < <(ls -t "$TMP/$USER_NAME"/*.jpg 2>/dev/null)
echo "Downloaded ${#PHOTOS[@]} photos"
(( ${#PHOTOS[@]} > 0 )) || { echo "No photos found."; exit 1; }

mkdir -p "$ROOT/public/images/ig" "$ROOT/public/images/journey"
slots=(ig/01.jpg ig/02.jpg ig/03.jpg ig/04.jpg ig/05.jpg ig/06.jpg ig/07.jpg ig/08.jpg
       journey/01-origen.jpg journey/02-maduracion.jpg journey/03-maestro.jpg journey/04-fuego.jpg journey/05-mesa.jpg)
for i in "${!slots[@]}"; do
  src="${PHOTOS[$(( i % ${#PHOTOS[@]} ))]}"
  cp "$src" "$ROOT/public/images/${slots[$i]}"
  echo "→ public/images/${slots[$i]}"
done
echo "Done. Restart 'npm run dev' and the photos replace the procedural art automatically."
