#!/bin/bash
# Build a picture gallery of every character you can use with make_animation.sh and open it in Windows.
#   ./make_gallery.sh            uses the dataset's T-pose pictures; renders only what is missing
#   ./make_gallery.sh --rerender renders every character with Blender (slower, uniform front views)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE"
MY_DIR="$HERE/assets_mixamo"
BUILTIN_DIR="$HERE/UniMate/dataset/raw/mixamo/character_refined"
TPOSE_DIR="$HERE/UniMate/dataset/raw/mixamo/character_tpose"
OUT="$HERE/outputs/gallery"; IMG="$OUT/images"
RERENDER=0; [ "${1:-}" = "--rerender" ] && RERENDER=1
mkdir -p "$IMG"

find_tpose() {  # $1 name -> image path from the dataset, if any
  local f
  for f in "$TPOSE_DIR"/"$1".{png,jpg,jpeg,webp} "$TPOSE_DIR"/"$1"/*.png; do
    [ -f "$f" ] && { echo "$f"; return; }
  done
}

TODO=()   # name=path.fbx still needing a render
LIST="$OUT/list.tsv"; : > "$LIST"   # group<TAB>name
for f in "$MY_DIR"/*.fbx; do
  [ -e "$f" ] || continue
  case "$f" in *_fixed.fbx) continue ;; esac
  n=$(basename "$f" .fbx); printf 'yours\t%s\n' "$n" >> "$LIST"
  [ $RERENDER = 0 ] && [ -f "$IMG/$n.png" ] || TODO+=("$n=$f")
done
for f in "$BUILTIN_DIR"/*.fbx; do
  [ -e "$f" ] || continue
  n=$(basename "$f" .fbx); printf 'builtin\t%s\n' "$n" >> "$LIST"
  if [ $RERENDER = 0 ]; then
    [ -f "$IMG/$n.png" ] && continue
    t=$(find_tpose "$n" || true)
    if [ -n "$t" ]; then cp "$t" "$IMG/$n.png"; continue; fi
  fi
  TODO+=("$n=$f")
done

echo "== $(wc -l < "$LIST") characters; ${#TODO[@]} need a Blender render (a few seconds each)"
if [ ${#TODO[@]} -gt 0 ]; then
  blender -b -P "$HERE/render_characters.py" -- "$IMG" "${TODO[@]}" 2>&1 | grep "^RENDER" || true
fi

python3 - "$OUT" <<'PY'
import html, os, sys
out = sys.argv[1]
rows = [l.rstrip("\n").split("\t") for l in open(os.path.join(out, "list.tsv")) if l.strip()]
def cards(group):
    s = []
    for g, n in rows:
        if g != group: continue
        img = f"images/{n}.png"
        pic = f'<img src="{html.escape(img)}" loading="lazy" alt="">' if os.path.exists(os.path.join(out, img)) else '<div class="none">no picture</div>'
        s.append(f'<figure>{pic}<figcaption><b>{html.escape(n)}</b><code>--char {html.escape(n)}</code></figcaption></figure>')
    return "\n".join(s) or "<p>None yet. Add one with <code>./make_animation.sh --add File.fbx</code>.</p>"
page = f"""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UniMate characters</title><style>
body{{font-family:system-ui,sans-serif;margin:16px;background:#f4f4f5;color:#18181b}}
input{{font-size:16px;padding:8px;width:min(400px,100%);margin-bottom:12px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}}
figure{{margin:0;background:#fff;border-radius:8px;padding:8px;box-shadow:0 1px 3px #0002}}
img,.none{{width:100%;aspect-ratio:2/3;object-fit:contain;background:#e4e4e7;border-radius:4px}}
.none{{display:flex;align-items:center;justify-content:center;color:#71717a}}
figcaption{{display:flex;flex-direction:column;gap:4px;margin-top:6px;font-size:14px}}
code{{font-size:12px;background:#f4f4f5;padding:2px 4px;border-radius:4px;user-select:all}}
</style></head><body>
<h1>Characters for make_animation.sh</h1>
<p>Use a name with <code>./make_animation.sh --char NAME "A person waves."</code> or make it the default with <code>./make_animation.sh --default NAME</code>. Click a <code>--char</code> line to select it for copying.</p>
<input id="q" placeholder="Filter by name..." oninput="for(const f of document.querySelectorAll('figure'))f.style.display=f.textContent.toLowerCase().includes(this.value.toLowerCase())?'':'none'">
<h2>Your characters</h2><div class="grid">{cards("yours")}</div>
<h2>Built-in Mixamo characters</h2><div class="grid">{cards("builtin")}</div>
</body></html>"""
open(os.path.join(out, "characters.html"), "w").write(page)
PY

WH=$(cd /mnt/c 2>/dev/null && cmd.exe /c "echo %USERPROFILE%" 2>/dev/null | tr -d '\r' || true)
if [ -n "$WH" ]; then
  DEST="$(wslpath "$WH")/Downloads/unimate/characters"; rm -rf "$DEST"; mkdir -p "$DEST"
  cp -r "$OUT/characters.html" "$OUT/images" "$DEST"/
  echo "== Gallery: $WH\\Downloads\\unimate\\characters\\characters.html (opening it now)"
  (cd /mnt/c && explorer.exe "$(wslpath -w "$DEST/characters.html")") >/dev/null 2>&1 || true
else
  echo "== Gallery: $OUT/characters.html"
fi
