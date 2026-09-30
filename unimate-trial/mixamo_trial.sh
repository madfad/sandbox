#!/bin/bash
# Mixamo-first trial. Run stages in order: ./mixamo_trial.sh <stage>
#   download  (done) checkpoint + Mixamo raw data + UniML3D exports
#   features  build dataset/features/mixamo (stage 4; stage 4)
#   setup_exp make outputs/mixamo_only: v2 checkpoint, config restricted to the mixamo dataset
#   types     list the object types the sampler will accept
#   sample    text -> motion for the Mixamo skeleton (edit mixamo_cases.json first)
#   animate   drive a Mixamo mesh with the generated motion (GLB + FBX); CHAR_PATH=... overrides Y Bot
# The released run is trained on truebones+mixamo+objaverse, but Truebones motions are a commercial
# pack, so the sampler is pointed at a copy of the run whose config only lists mixamo.
set -euo pipefail
cd "$(dirname "$0")/UniMate"
source "$(conda info --base)/etc/profile.d/conda.sh"; conda activate unimate
SRC=outputs/unimate_ckpt/unimate_uniml3d_f60_v2   # recommended run (README)
EXP=outputs/mixamo_only
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
  [ -f ../mixamo_cases.json ] || cat > ../mixamo_cases.json <<'JSON'
{
  "mixamo-walk": "A person walks forward at a steady pace.",
  "mixamo-squat": "A person squats down and stands back up.",
  "mixamo-wave": "A person waves with their right hand."
}
JSON
  # Keys are "<object_type>-<tag>"; replace "mixamo" with the type printed by `types` if it differs.
  SEED=0 REPLICATE=2 bash scripts/run_sample_motion_text.sh "$EXP" ../mixamo_cases.json 3.0
  ls "$EXP"/samples_mixamo_cases ;;
animate)
  bash scripts/run_animate_motion.sh mixamo "$EXP/samples_mixamo_cases/motions" ../outputs/mixamo_animated ;;
*) sed -n 2,10p "$0"; exit 1 ;;
esac
