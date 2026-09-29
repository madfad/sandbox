#!/bin/bash
# Usage: ./preprocess_daz.sh assets_daz/my_woman.fbx
# Converts a DAZ (Genesis 8) FBX into UniMate's canonical rigged asset + cond.npy.
set -euo pipefail
cd "$(dirname "$0")"
FBX=${1:?path to DAZ-exported .fbx (relative to unimate-trial/)}
NAME=$(basename "${FBX%.*}")
FBX_ABS=$(realpath "$FBX"); OUT_ABS=$(realpath -m "outputs/$NAME")
source "$(conda info --base)/etc/profile.d/conda.sh"; conda activate unimate
cd UniMate
CHAR_PATH="$FBX_ABS" OUTPUT_DIR="$OUT_ABS" \
  FACE_R="${FACE_R:-rThigh}" FACE_L="${FACE_L:-lThigh}" FORMATS=glb,fbx SAVE_VIS=1 \
  bash data_process/scripts/run_preprocess_char.sh
echo "Outputs in unimate-trial/outputs/$NAME"
