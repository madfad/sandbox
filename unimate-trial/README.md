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

## 4. Start with Mixamo (recommended first run)
The shipped sampler only accepts skeletons ("object types") that exist in the dataset, and
Mixamo's Y Bot humanoid is one of them, so it works without any custom rig. Run stage by stage:

    ./mixamo_trial.sh download
    ./mixamo_trial.sh features
    ./mixamo_trial.sh sample     # edit mixamo_cases.json prompts as you like
    ./mixamo_trial.sh animate

Written without Hugging Face access; the checkpoint and dataset layouts come from the docs, so
check each stage's output. Open questions: whether the preview checkpoint is trained on a
Truebones/Objaverse mixture (then their features must be present too; Truebones motions are
not downloadable), and the exact `object_type` string ("mixamo" is assumed).

## 5. Later: the DAZ character
Not verified. Genesis 8 is not a dataset skeleton and probably exceeds the `max_joints=60` used
by the `uniml3d_*` configs. Check the joint count in the `cond.npy` from step 3, then register
it for sampling, or retarget Mixamo output onto the DAZ mesh in Blender.
