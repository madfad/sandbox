#!/bin/bash
# One command from sentences to animated 3D files, copied to Windows Downloads\unimate\.
# Usage: ./make_animation.sh "A person jumps up and lands." "A person waves with their right hand."
# Uses the first assets_mixamo/*_fixed.fbx as the character (or CHAR_PATH=...), else Y Bot.
# Optional: CFG=4 REPLICATE=3 SEED=random ./make_animation.sh "..."
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE"
if [ $# -lt 1 ]; then sed -n 2,5p "$0"; exit 1; fi

CHAR=${CHAR_PATH:-$(ls "$HERE"/assets_mixamo/*_fixed.fbx 2>/dev/null | head -1 || true)}
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
echo "== Character: ${CHAR:-Y Bot (default)}"

echo "== Step 1/3: generating motion on the GPU"
CASES="prompts/$RUN.json" ./mixamo_trial.sh sample > "prompts/$RUN.sample.log" 2>&1 \
  || { tail -30 "prompts/$RUN.sample.log"; echo "FAILED at sample, full log: prompts/$RUN.sample.log"; exit 1; }

echo "== Step 2/3: putting the motion on the character (about 30 s per clip)"
if [ -n "$CHAR" ]; then export CHAR_PATH="$CHAR"; fi
CASES="prompts/$RUN.json" ./mixamo_trial.sh animate > "prompts/$RUN.animate.log" 2>&1 \
  || { tail -30 "prompts/$RUN.animate.log"; echo "FAILED at animate, full log: prompts/$RUN.animate.log"; exit 1; }
python3 inspect_glb.py outputs/"${RUN}"_animated/*.glb

echo "== Step 3/3: copying results to Windows"
WIN=$(cd /mnt/c 2>/dev/null && cmd.exe /c "echo %USERPROFILE%" 2>/dev/null | tr -d '\r' || true)
if [ -n "$WIN" ]; then
  DEST="$(wslpath "$WIN")/Downloads/unimate/$RUN"; mkdir -p "$DEST"
  cp outputs/"${RUN}"_animated/*.glb "$DEST"/
  cp UniMate/outputs/mixamo_only/samples_"$RUN"/animations/*.mp4 "$DEST"/ 2>/dev/null || true
  echo "DONE. Open in Windows Explorer: $WIN\\Downloads\\unimate\\$RUN"
else
  echo "DONE. Files are in $HERE/outputs/${RUN}_animated (could not find the Windows Downloads folder)"
fi
