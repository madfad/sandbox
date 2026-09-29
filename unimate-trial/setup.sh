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
# UniMate pins torch 2.5.1+cu124, which has no kernels for Blackwell GPUs (RTX 50xx, sm_120).
# Install everything else first, then torch from the cu128 index.
grep -Ev '^(torch|torchvision)==|extra-index-url https://download.pytorch.org' UniMate/requirements.txt > requirements.wsl.txt
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128
pip install -r requirements.wsl.txt --no-build-isolation
python - <<'PY'
import torch
print("torch", torch.__version__, "cuda", torch.version.cuda, "arch", torch.cuda.get_arch_list())
x = torch.randn(1024, 1024, device="cuda"); print("CUDA matmul ok:", (x @ x).sum().item() == (x @ x).sum().item())
PY
# Blender must be on PATH for the preprocess/animate steps (repo developed against 3.2)
command -v blender >/dev/null || echo "WARNING: install Blender and put it on PATH"
echo "Done. Next: see README.md step 2 (get the DAZ character)."
