#!/bin/bash
# Clone UniMate and create its conda env. Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")"
[ -d UniMate ] || GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/Friedrich-M/UniMate UniMate
command -v conda >/dev/null || { echo "conda not found (install Miniconda first)"; exit 1; }
source "$(conda info --base)/etc/profile.d/conda.sh"
conda env list | grep -q '^unimate ' || conda create -n unimate python=3.10 -y
conda activate unimate
pip install "setuptools<81"
(cd UniMate && pip install -r requirements.txt --no-build-isolation)
# Blender must be on PATH for the preprocess/animate steps (repo developed against 3.2)
command -v blender >/dev/null || echo "WARNING: install Blender and put it on PATH"
echo "Done. Next: see README.md step 2 (get the DAZ character)."
