#!/bin/bash
# Mixamo-first trial. Run stages in order: ./mixamo_trial.sh <stage>
#   download      (done) checkpoint + Mixamo raw data + UniML3D exports
#   features      build dataset/features/mixamo (stage 4)
#   setup_exp     make outputs/mixamo_only: v2 checkpoint, config restricted to the mixamo dataset
#   types         list the object types the sampler will accept
#   sample        text -> motion for the Mixamo skeleton (prompts come from $CASES, default mixamo_cases.json)
#   blender_libs  install the Python libs Blender needs into ~/blender_pylibs (once, before animate)
#   fixchar <in.fbx>  rename mixamorig1: bones to mixamorig: -> <in>_fixed.fbx (needed for some Mixamo characters)
#   animate       drive a Mixamo mesh with the generated motion (GLB + FBX); CHAR_PATH=... overrides Y Bot
#   captions      print example training captions, to imitate when writing prompts
# Env for sample/animate: CASES=<prompts.json> CFG=<guidance, default 3.0> REPLICATE=<samples per prompt, default 2>
#   SEED=<int, default 0; 'random' for none> CHAR_PATH=<fbx> OUT_NAME=<output folder name>
# The released run is trained on truebones+mixamo+objaverse, but Truebones motions are a commercial
# pack, so the sampler is pointed at a copy of the run whose config only lists mixamo.
set -euo pipefail
ORIG_PWD="$PWD"
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE/UniMate"
source "$(conda info --base)/etc/profile.d/conda.sh"; conda activate unimate
SRC=outputs/unimate_ckpt/unimate_uniml3d_f60_v2   # recommended run (README)
EXP=outputs/mixamo_only
CASES=$(cd "$ORIG_PWD" && realpath -m "${CASES:-$HERE/mixamo_cases.json}")
[ -z "${CHAR_PATH:-}" ] || export CHAR_PATH=$(cd "$ORIG_PWD" && realpath "$CHAR_PATH")
STEM=$(basename "${CASES%.json}")
SAMPLES="$EXP/samples_$STEM"
CKPT=checkpoint_step_100000.pt

case "${1:-}" in
features)
  bash data_process/scripts/run_extract_features.sh mixamo
  ls dataset/features/mixamo | head ;;
setup_exp)
  mkdir -p "$EXP/checkpoints"
  ln -sf "$PWD/$SRC/dataset_stats.npy" "$EXP/dataset_stats.npy"
  ln -sf "$PWD/$SRC/checkpoints/$CKPT" "$EXP/checkpoints/$CKPT"
  python - "$SRC" "$EXP" <<'PY'
import json, sys
src, dst = sys.argv[1:]
c = json.load(open(f"{src}/config.json"))
c["dataset"]["dataset_list"] = ["mixamo"]
json.dump(c, open(f"{dst}/config.json", "w"), indent=2)
print("dataset_list ->", c["dataset"]["dataset_list"], "| max_joints", c["dataset"].get("max_joints"))
PY
  ls -l "$EXP" "$EXP/checkpoints" ;;
types)
  python - <<'PY'
import numpy as np
d = np.load("dataset/features/mixamo/cond.npy", allow_pickle=True).item()
print("object types:", list(d))
PY
  ;;
sample)
  [ -f "$CASES" ] || { echo "Prompts file not found: $CASES"; exit 1; }
  SEED_ENV=${SEED:-0}; [ "$SEED_ENV" = "random" ] && SEED_ENV=""
  # Keys are "<object_type>-<tag>" (object type is "mixamo"); values are the prompts.
  SEED="$SEED_ENV" REPLICATE="${REPLICATE:-2}" bash scripts/run_sample_motion_text.sh "$EXP" "$CASES" "${CFG:-3.0}"
  ls "$SAMPLES" "$SAMPLES/motions" ;;
captions)
  python - <<'PY'
import json, random
c = json.load(open("dataset/features/mixamo/captions.json"))
items = list(c.items()) if isinstance(c, dict) else list(enumerate(c))
random.seed(1)
print(len(items), "captions; 25 random examples:")
for k, v in random.sample(items, min(25, len(items))):
    print("-", v if isinstance(v, str) else json.dumps(v)[:200])
PY
  ;;
blender_libs)
  # Blender runs scripts with its own bundled Python (3.10, old numpy), not this conda env.
  # Same ABI as the env, so install a consistent numpy<2 set into a folder Blender reads via PYTHONPATH.
  LIBS="$HOME/blender_pylibs"
  pip install --target "$LIBS" "numpy==1.26.4" "scipy<1.14" "matplotlib<3.10" pillow imageio loguru tqdm
  pip install --target "$LIBS" --no-deps torch --index-url https://download.pytorch.org/whl/cpu
  pip install --target "$LIBS" --no-deps filelock typing-extensions sympy mpmath networkx jinja2 markupsafe fsspec
  pip install --target "$LIBS" --no-deps --no-build-isolation "git+https://github.com/inbar-2344/Motion.git"
  ls "$LIBS" | head -40 ;;
fixchar)
  IN=$(cd "$ORIG_PWD" && realpath "${2:?usage: ./mixamo_trial.sh fixchar /path/char.fbx}")
  blender -b -P "$HERE/fix_mixamo_prefix.py" -- "$IN" "${IN%.fbx}_fixed.fbx" 2>&1 | grep -E "FIXPREFIX|Error|error" ;;
animate)
  export PYTHONPATH="$HOME/blender_pylibs${PYTHONPATH:+:$PYTHONPATH}"
  bash scripts/run_animate_motion.sh mixamo "$SAMPLES/motions" "../outputs/${OUT_NAME:-${STEM}_animated}" ;;
*) sed -n 2,10p "$0"; exit 1 ;;
esac
