# UniMate trial

Trying [UniMate](https://github.com/Friedrich-M/UniMate) (text -> motion for arbitrary skeletons,
SIGGRAPH Asia 2026) on a free rigged female character from DAZ 3D.

## Layout
- `setup.sh` – clones UniMate into `UniMate/` (git-ignored) and builds the `unimate` conda env
- `assets_daz/` – put the DAZ export here (git-ignored: DAZ content is licensed, don't commit it)
- `preprocess_daz.sh` – DAZ FBX -> canonical rigged GLB/FBX + `cond.npy`
- `outputs/` – results (git-ignored)

## Requirements
Linux + NVIDIA GPU (CUDA 12.4 wheels), conda, Blender on PATH. The cloud sandbox this was
prepared in has no GPU, so run the model on your own machine.

## 1. Setup
    ./setup.sh

## 2. Get a free rigged woman from DAZ (manual – needs your DAZ login)
DAZ downloads require an account and licence acceptance, so this can't be scripted.
1. Create a free account at daz3d.com and install **DAZ Install Manager + DAZ Studio** (free).
2. Add **Genesis 8 Starter Essentials** (free, $0) to your cart and install it via DIM.
   It includes the rigged Genesis 8 Female figure. (Genesis 9 Starter Essentials also works
   but its bone names differ.)
3. In DAZ Studio: load **Genesis 8 Female**, then File > Export > **FBX**
   (FBX 2013 binary, embed textures off is fine). Save as `assets_daz/g8f.fbx`.
   Bone naming is `lThigh`/`rThigh`, matching the script defaults.
4. Optional: Diffeomorphic's DAZ importer for Blender is an alternative export route.

## 3. Preprocess
    ./preprocess_daz.sh assets_daz/g8f.fbx
    # for Genesis 9 bones: FACE_R=r_thigh FACE_L=l_thigh ./preprocess_daz.sh ...

Check the preview MP4 / T-pose in `outputs/g8f/`. If the facing looks wrong, adjust FACE_R/FACE_L.

## 4. Generate motion
The dance/walk model needs the released checkpoint and dataset features
(https://huggingface.co/Linzhan/UniMate, https://huggingface.co/datasets/Linzhan/UniML3D).
Inference (`unimate.inference.sample`) takes an `object_type` that exists in the dataset, so
a brand-new custom character is animated by pairing its `cond.npy` with a motion `.npz`;
see UniMate `data_process/README.md` -> "Custom Assets", step 3:

    cd UniMate
    CHAR_PATH=../outputs/g8f/g8f_canonical.glb ANIM_PATH=<motion.npz> \
        bash data_process/scripts/run_animate_lbs.sh

Not yet verified end to end: the sandbox has no GPU and no DAZ asset.
