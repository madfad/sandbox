#!/bin/bash
# One command from sentences to animated 3D files, copied to Windows Downloads\unimate\.
#
#   ./make_animation.sh "A person jumps up and lands." "A person waves with their right hand."
#   ./make_animation.sh --char Amy "A person bows."      use a character by name, for this run only
#   ./make_animation.sh --list                           list available characters
#   ./make_animation.sh --add NewCharacter.fbx           add a Mixamo FBX (from Windows Downloads or a path)
#   ./make_animation.sh --default Amy                    make a character the default for future runs
#
# Optional settings in front of the command: CFG=4 REPLICATE=3 SEED=random
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE"
MY_DIR="$HERE/assets_mixamo"
BUILTIN_DIR="$HERE/UniMate/dataset/raw/mixamo/character_refined"
DEFAULT_FILE="$MY_DIR/.default_character"

usage() { sed -n 2,10p "$0" | sed 's/^# \{0,1\}//'; }

win_home() {  # Windows user folder as a Linux path, or nothing
  local w
  w=$(cd /mnt/c 2>/dev/null && cmd.exe /c "echo %USERPROFILE%" 2>/dev/null | tr -d '\r' || true)
  [ -n "$w" ] && wslpath "$w" 2>/dev/null || true
}

fix_char() {  # $1 = absolute .fbx in MY_DIR -> creates <name>_fixed.fbx
  echo "== Preparing character (one-time bone-name fix): $(basename "$1")" >&2
  ./mixamo_trial.sh fixchar "$1" >&2
  [ -f "${1%.fbx}_fixed.fbx" ] || { echo "Bone fix failed for $1" >&2; exit 1; }
}

my_names() {  # character names in MY_DIR (original files, not *_fixed)
  local f
  for f in "$MY_DIR"/*.fbx; do
    [ -e "$f" ] || continue
    case "$f" in *_fixed.fbx) continue ;; esac
    basename "$f" .fbx
  done
}

builtin_names() {
  local f
  for f in "$BUILTIN_DIR"/*.fbx; do [ -e "$f" ] && basename "$f" .fbx; done
}

resolve_char() {  # $1 = name -> prints the .fbx path to animate with
  local want n
  want=$(echo "$1" | tr '[:upper:]' '[:lower:]'); want=${want%.fbx}; want=${want%_fixed}
  while read -r n; do
    [ -n "$n" ] || continue
    if [ "$(echo "$n" | tr '[:upper:]' '[:lower:]')" = "$want" ]; then
      [ -f "$MY_DIR/${n}_fixed.fbx" ] || fix_char "$MY_DIR/$n.fbx"
      echo "$MY_DIR/${n}_fixed.fbx"; return
    fi
  done < <(my_names)
  while read -r n; do
    [ -n "$n" ] || continue
    if [ "$(echo "$n" | tr '[:upper:]' '[:lower:]')" = "$want" ]; then
      echo "$BUILTIN_DIR/$n.fbx"; return
    fi
  done < <(builtin_names)
  echo "No character called '$1'. Run ./make_animation.sh --list to see the names." >&2
  exit 1
}

list_chars() {
  local d=""; [ -f "$DEFAULT_FILE" ] && d=$(cat "$DEFAULT_FILE")
  echo "Default character: ${d:-first of your characters, else Y_Bot}"
  echo; echo "Your characters (assets_mixamo):"; my_names | sed 's/^/  /'
  echo; echo "Built-in Mixamo characters (from the dataset):"
  builtin_names | column -c 100 2>/dev/null | sed 's/^/  /' || builtin_names | sed 's/^/  /'
}

add_char() {  # $1 = file name in Windows Downloads, or a path
  local src="$1" wh
  if [ ! -f "$src" ]; then
    wh=$(win_home)
    [ -n "$wh" ] && [ -f "$wh/Downloads/$1" ] && src="$wh/Downloads/$1"
  fi
  [ -f "$src" ] || { echo "Cannot find '$1' (looked here and in your Windows Downloads folder)." >&2; exit 1; }
  case "$src" in *.fbx) ;; *) echo "Expected a .fbx file from Mixamo." >&2; exit 1 ;; esac
  mkdir -p "$MY_DIR"
  local name; name=$(basename "$src" .fbx | tr ' ' '_')
  cp "$src" "$MY_DIR/$name.fbx"
  rm -f "$MY_DIR/${name}_fixed.fbx"
  fix_char "$MY_DIR/$name.fbx"
  echo "Added character '$name'. Use it with: ./make_animation.sh --char $name \"A person waves.\""
}

# ---- arguments ----
CHAR_NAME=""
case "${1:-}" in
  ""|-h|--help) usage; exit 0 ;;
  --list) list_chars; exit 0 ;;
  --add) add_char "${2:?usage: ./make_animation.sh --add File.fbx}"; exit 0 ;;
  --default)
    resolve_char "${2:?usage: ./make_animation.sh --default Name}" > /dev/null
    mkdir -p "$MY_DIR"; echo "$2" > "$DEFAULT_FILE"; echo "Default character is now '$2'."; exit 0 ;;
  --char) CHAR_NAME="${2:?usage: ./make_animation.sh --char Name \"sentence\"}"; shift 2 ;;
esac
[ $# -ge 1 ] || { echo "Give at least one sentence in double quotes."; usage; exit 1; }

if [ -n "${CHAR_PATH:-}" ]; then CHAR="$CHAR_PATH"
elif [ -n "$CHAR_NAME" ]; then CHAR=$(resolve_char "$CHAR_NAME")
elif [ -f "$DEFAULT_FILE" ]; then CHAR=$(resolve_char "$(cat "$DEFAULT_FILE")")
else
  first=$(my_names | head -1)
  if [ -n "$first" ]; then CHAR=$(resolve_char "$first"); else CHAR=""; fi
fi

RUN=run_$(date +%Y%m%d_%H%M%S)
mkdir -p prompts
python3 - "$@" > "prompts/$RUN.json" <<'PY'
import json, re, sys
cases, used = {}, set()
for i, text in enumerate(sys.argv[1:]):
    words = re.findall(r"[a-z0-9]+", text.lower())
    if words[:2] == ["a", "person"]:
        words = words[2:]
    tag = "_".join(words[:4]) or f"prompt{i}"
    base, n = tag, 2
    while tag in used:
        tag, n = f"{base}{n}", n + 1
    used.add(tag)
    cases[f"mixamo-{tag}"] = text
print(json.dumps(cases, indent=2))
PY
echo "== Prompts (saved in prompts/$RUN.json):"; cat "prompts/$RUN.json"
echo "== Character: ${CHAR:-Y_Bot (default)}"

echo "== Step 1/3: generating motion on the GPU"
CASES="prompts/$RUN.json" ./mixamo_trial.sh sample > "prompts/$RUN.sample.log" 2>&1 \
  || { tail -30 "prompts/$RUN.sample.log"; echo "FAILED at sample, full log: prompts/$RUN.sample.log"; exit 1; }

echo "== Step 2/3: putting the motion on the character (about 30 s per clip)"
if [ -n "$CHAR" ]; then export CHAR_PATH="$CHAR"; fi
CASES="prompts/$RUN.json" ./mixamo_trial.sh animate > "prompts/$RUN.animate.log" 2>&1 \
  || { tail -30 "prompts/$RUN.animate.log"; echo "FAILED at animate, full log: prompts/$RUN.animate.log"; exit 1; }
python3 inspect_glb.py outputs/"${RUN}"_animated/*.glb

echo "== Step 3/3: copying results to Windows"
WH=$(win_home)
if [ -n "$WH" ]; then
  DEST="$WH/Downloads/unimate/$RUN"; mkdir -p "$DEST"
  cp outputs/"${RUN}"_animated/*.glb "$DEST"/
  cp UniMate/outputs/mixamo_only/samples_"$RUN"/animations/*.mp4 "$DEST"/ 2>/dev/null || true
  echo "DONE. Open in Windows Explorer: Downloads\\unimate\\$RUN"
else
  echo "DONE. Files are in $HERE/outputs/${RUN}_animated (could not find the Windows Downloads folder)"
fi
