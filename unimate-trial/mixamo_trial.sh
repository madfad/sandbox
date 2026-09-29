#!/bin/bash
# Mixamo-first trial. Run stages one at a time: ./mixamo_trial.sh <stage>
#   download  fetch checkpoint + Mixamo raw data + UniML3D exports
#   features  build dataset/features/mixamo (stage 4)
#   sample    text -> motion for the Mixamo skeleton
#   animate   drive the Y Bot mesh with the generated motion (GLB + FBX)
# Written without access to Hugging Face, so repo layouts are from the docs;
# stop and check the output of each stage before moving on.
set -euo pipefail
cd "$(dirname "$0")/UniMate"
source "$(conda info --base)/etc/profile.d/conda.sh"; conda activate unimate
EXP=outputs/unimate_ckpt   # checkpoint dir (config.json, dataset_stats.npy, checkpoints/)

case "${1:-}" in
download)
  bash data_process/scripts/run_download.sh mixamo
  hf download Linzhan/UniML3D --type dataset --local-dir dataset --include "export/*"
  hf download Linzhan/UniMate --local-dir "$EXP"
  ls "$EXP"; ls dataset dataset/raw/mixamo ;;
features)
  bash data_process/scripts/run_extract_features.sh mixamo
  ls dataset/features/mixamo | head ;;
sample)
  cat > ../mixamo_cases.json <<'JSON'
{
  "mixamo-walk": "A person walks forward at a steady pace.",
  "mixamo-squat": "A person squats down and stands back up.",
  "mixamo-wave": "A person waves with their right hand."
}
JSON
  # If the checkpoint's config lists other datasets (e.g. truebones), its features must exist too.
  # If "mixamo" is rejected, list valid types:
  python - <<'PY'
import numpy as np; d=np.load("dataset/features/mixamo/cond.npy",allow_pickle=True).item(); print("object types:",list(d)[:10])
PY
  SEED=0 REPLICATE=2 bash scripts/run_sample_motion_text.sh "$EXP" ../mixamo_cases.json 3.0 ;;
animate)
  bash scripts/run_animate_motion.sh mixamo "$EXP/samples_mixamo_cases/motions" ../outputs/mixamo_animated ;;
*) sed -n 2,7p "$0"; exit 1 ;;
esac
