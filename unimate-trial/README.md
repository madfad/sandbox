# UniMate trial

Trying [UniMate](https://github.com/Friedrich-M/UniMate) (text -> motion for arbitrary skeletons,
SIGGRAPH Asia 2026): type a sentence, get a skeleton animation, apply it to a rigged 3D character.

**Status** (tested on Windows 11 + WSL2 Ubuntu 22.04 + RTX 5090):
- Mixamo character + text prompts -> animated GLB/FBX: **works**.
- DAZ 3D (Genesis 8) character: **not attempted yet** (see the last section).

**New to Ubuntu/WSL? Start with [GETTING_STARTED.md](GETTING_STARTED.md)**: one command turns sentences into
animated files in your Windows Downloads folder (`./make_animation.sh "A person jumps."`).

## Layout
- `make_animation.sh` - sentences -> sample -> animate -> copy to Windows Downloads, in one command; `--list`, `--char`, `--add`, `--default` manage characters
- `setup.sh` - clone UniMate into `UniMate/` (git-ignored) and build the `unimate` conda env
- `make_gallery.sh` + `render_characters.py` - picture gallery of all characters, opened in the Windows browser
- `mixamo_trial.sh` - every pipeline stage (`download`, `features`, `setup_exp`, `types`, `sample`, `blender_libs`, `fixchar`, `animate`, `captions`)
- `mixamo_cases.json` - default prompts file
- `fix_mixamo_prefix.py` - used by `fixchar`
- `inspect_glb.py` - prints nodes / skins / animations of a `.glb` (quick "does it animate?" check)
- `assets_mixamo/`, `assets_daz/` - your character files (git-ignored: licensed content)
- `outputs/` - results (git-ignored)
- `preprocess_daz.sh` - DAZ route, untested

## One-time setup (Windows + WSL2 + NVIDIA GPU)

Everything runs inside Ubuntu (WSL2), not PowerShell. Clone the repo **inside the Linux filesystem**
(`~/sandbox`), not under `/mnt/c`, which is very slow.

1. **WSL2 + Ubuntu** (PowerShell): `wsl --install -d Ubuntu-22.04 --web-download`. Docker Desktop's
   own `docker-desktop` distro is not usable. Inside Ubuntu `nvidia-smi` must list your GPU (install the
   NVIDIA driver on Windows only).
2. **Tools** (Ubuntu): `sudo apt update && sudo apt install -y git wget libxi6 libxxf86vm1 libxfixes3 libxrender1 libgl1 libsm6`,
   then install Miniconda and accept conda's terms of service:
   `conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main` (and `.../pkgs/r`).
3. **Blender 3.2.2** (UniMate was developed against 3.2; apt gives 3.0.1). `download.blender.org` returned
   403 to `wget` here, so download `blender-3.2.2-linux-x64.tar.xz` in the Windows browser, then:
   ```bash
   cp /mnt/c/Users/<you>/Downloads/blender-3.2.2-linux-x64.tar.xz ~/ && cd ~ && tar xf blender-3.2.2-linux-x64.tar.xz
   echo 'export PATH="$HOME/blender-3.2.2-linux-x64:$PATH"' >> ~/.bashrc && source ~/.bashrc
   which blender     # must be ~/blender-3.2.2-linux-x64/blender
   ```
4. **Clone + environment**:
   ```bash
   cd ~ && git clone -b claude/wonderful-brown-fvw4se https://github.com/madfad/sandbox.git
   cd sandbox/unimate-trial && ./setup.sh
   ```
   `setup.sh` ends by printing the torch version and running a CUDA matmul. Two deliberate deviations from
   UniMate's `requirements.txt`: it installs torch from the **cu128** wheels (the pinned `torch==2.5.1+cu124`
   has no kernels for RTX 50-series / Blackwell, sm_120) and it drops `bpy==4.0.0` (no longer downloadable; only
   the optional render stage needs it, everything here uses the `blender` executable).
5. **Libraries for Blender's own Python** (once): `./mixamo_trial.sh blender_libs`. Blender runs scripts with its
   bundled Python, not the conda env, so `loguru`, `scipy`, `torch` etc. are installed into `~/blender_pylibs`
   and picked up through `PYTHONPATH` by the `animate` stage.

Disk: about 71 GB for the dataset and 25 GB for the checkpoints (WSL stores it all in one `ext4.vhdx`
file on C:, which grows but never shrinks by itself).

## Build the data and the model run (once)

```bash
cd ~/sandbox/unimate-trial
./mixamo_trial.sh download    # checkpoints + Mixamo raw data + UniML3D exports from Hugging Face (long)
./mixamo_trial.sh features    # stage 4: canonicalise 2,310 Mixamo clips -> 2,162 (slow, see below)
./mixamo_trial.sh setup_exp   # outputs/mixamo_only = v2 step-100000 weights + config limited to "mixamo"
./mixamo_trial.sh types       # should print: object types: ['mixamo']
```
- **Why a Mixamo-only run:** the released `unimate_uniml3d_f60_v2` run was trained on Truebones + Mixamo +
  Objaverse, and sampling loads features for every dataset in its config. Truebones motions are a commercial pack
  that is not redistributed, so `setup_exp` copies the config with `dataset_list = ["mixamo"]` and links the
  same weights and per-dataset normalisation stats. This works, but the model is used slightly outside the
  exact setting it was released in.
- **`features` is slow** (about 2 hours on one CPU core in our run): it handles the single Mixamo skeleton in one
  process and renders a preview video per clip. `NO_VIS=1 ./mixamo_trial.sh features` skips the videos (not
  timed). The progress bar shows `0/1` until the end; watch `ls UniMate/dataset/features/mixamo/motions | wc -l`.
- The checkpoint README says v2 was trained on UniML3D revision `faaa81773b15247b03f183548e3898dbec2ce80`; we used
  the latest. If results look off, re-download the export at that revision.

## Your character

Download from Mixamo (mixamo.com, free Adobe login): pick the character, **Format: FBX Binary (.fbx)**,
**Pose: T-pose** (Original Pose also worked for a character already in a T-pose), with skin. Put the file in
`assets_mixamo/`.

**Bone-name gotcha:** the motion uses bones named `mixamorig:Hips`. Some Mixamo characters are named
`mixamorig1:Hips` (with a digit); with those, no bone matches, every bone is treated as "extra" and removed, and the
export is a static mesh (`skins=0`, no animation). Fix it once per character:
```bash
./mixamo_trial.sh fixchar $HOME/sandbox/unimate-trial/assets_mixamo/Ch47_nonPBR.fbx   # -> Ch47_nonPBR_fixed.fbx
```
(Use an absolute path.) To check a character's bone names:
`blender -b -P ~/dump_bones.py -- file.fbx`, or just look at the `Merged 43 extra ...` log line in `animate`.

The default character if you omit `CHAR_PATH` is Y Bot (from the dataset); it is a good control when something
looks wrong.

## Trying different prompts (step by step)

The model generates **one clip of 60 frames = 2 seconds at 30 fps** per prompt. A prompt is one short sentence
about one action.

1. **Look at how the training captions are written**, and imitate them:
   ```bash
   ./mixamo_trial.sh captions     # prints 25 random Mixamo captions
   ```
2. **Make your own prompts file.** Copy the default and edit it (any name ending in `.json`):
   ```bash
   cd ~/sandbox/unimate-trial && cp mixamo_cases.json my_prompts.json && nano my_prompts.json
   ```
   Format: each entry is `"mixamo-<tag>": "the sentence"`. The part before the first dash must be `mixamo`
   (the skeleton's object type); `<tag>` is any label you choose and becomes part of the output file names.
   Example:
   ```json
   {
     "mixamo-jump": "A person jumps up with both feet and lands.",
     "mixamo-punch": "A person throws a right punch.",
     "mixamo-sit": "A person sits down on a chair.",
     "mixamo-dance": "A person dances happily, moving their arms and hips."
   }
   ```
   Tips (from how the model is built; we have not tuned these): keep it to one action; start with "A person";
   name the body part and side ("right hand"); prefer wording similar to step 1's captions; avoid sequences
   ("walks, then jumps, then sits"), because a 2-second clip cannot hold them.
3. **Generate the motions** (GPU; seconds to a couple of minutes):
   ```bash
   CASES=my_prompts.json ./mixamo_trial.sh sample
   ```
   Options (all optional, combine freely):
   | Variable | Default | Effect |
   |---|---|---|
   | `CASES` | `mixamo_cases.json` | which prompts file to use |
   | `CFG` | `3.0` | how strictly it follows the text. Higher (4-7) = closer to the prompt but stiffer/less varied; 1.0 is unconditional and ignores the text (needs a different input, not supported here); try 2-5 |
   | `REPLICATE` | `2` | variations generated per prompt |
   | `SEED` | `0` | fixed seed for repeatable results; `SEED=random` for a different result every run |
   Example: `CASES=my_prompts.json CFG=5 REPLICATE=4 SEED=random ./mixamo_trial.sh sample`
   Results go to `UniMate/outputs/mixamo_only/samples_<prompts file name>/`:
   `motions/*.npy` (the motion), `animations/*_fk.mp4` (stick-figure videos, quick preview), `captions.json`.
   File names look like `mixamo-jump-rep_0-0.npy`: the tag, the variation number, then the prompt's index.
4. **Preview the stick-figure videos** before spending time on the 3D step:
   ```bash
   cp ~/sandbox/unimate-trial/UniMate/outputs/mixamo_only/samples_my_prompts/animations/*.mp4 /mnt/c/Users/<you>/Downloads/
   ```
5. **Put the motions on your character** (Blender, about half a minute per clip):
   ```bash
   CASES=my_prompts.json CHAR_PATH=$HOME/sandbox/unimate-trial/assets_mixamo/Ch47_nonPBR_fixed.fbx ./mixamo_trial.sh animate
   ```
   Use the same `CASES` as in step 3. Output: `outputs/my_prompts_animated/<clip>.glb` and `.fbx`
   (override the folder name with `OUT_NAME=...`). Re-running overwrites files with the same name.
6. **Check and view:**
   ```bash
   python3 inspect_glb.py outputs/my_prompts_animated/mixamo-jump-rep_0-0.glb   # expect skins=1 and a non-empty animations list
   cp outputs/my_prompts_animated/*.glb /mnt/c/Users/<you>/Downloads/
   ```
   Drag a `.glb` into https://gltf-viewer.donmccurdy.com/ and tick `Reconstructed_Action` in the **Animation** panel.
   Or import the `.fbx` into Blender and press Space.

Known limits: fingers do not move (the model animates 22 joints; the 43 finger and end bones are merged into
their parents); clips are 2 seconds; the prompt must describe something the Mixamo data contains.

## Troubleshooting (all seen in this setup)
| Symptom | Cause / fix |
|---|---|
| `git: not a git repository` | you are not inside the clone; `cd ~/sandbox` |
| `CondaToSNonInteractiveError` | run the two `conda tos accept ...` commands above |
| `No matching distribution found for bpy==4.0.0` | handled: `setup.sh` drops it |
| 403 from `download.blender.org` | download in a browser and copy from `/mnt/c/...` |
| `No module named 'loguru'` in Blender | run `./mixamo_trial.sh blender_libs` |
| GLB has `skins=0` / `animations=[]` | bone prefix `mixamorig1:`; run `fixchar` |
| shell shows a `>` prompt and hangs | a pasted command ended in a stray `\`; press Ctrl+C |
| `No module named 'numpy'` in a bare `python` | `conda activate unimate` first |

## DAZ 3D character (not done yet)
Unverified plan: Genesis 8 Female is not one of the dataset's skeletons, its bones have different names
(`lThigh`, `rThigh`, twist bones ...), and it probably has more joints than the model's limit (`max_joints` 71 in
the v2 config). Free route: DAZ account -> Genesis 8 Starter Essentials -> export FBX from DAZ Studio to
`assets_daz/`, then `./preprocess_daz.sh assets_daz/g8f.fbx` to build a custom `cond.npy` (set
`FACE_R=rThigh FACE_L=lThigh`). Whether the released checkpoint produces good motion for such a rig is unknown.
An alternative that avoids the question: generate the motion on the Mixamo skeleton and retarget it onto the DAZ
mesh in Blender.
