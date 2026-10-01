# Making animations: plain-language guide

The setup is already done on your PC. This guide is about **using** it day to day. You do not need to know
Linux: you will open one window, paste one or two lines, and wait.

## Words you will see

- **Ubuntu / WSL**: a small Linux computer that runs inside Windows. UniMate only runs there.
- **Terminal**: the black text window where you type commands. Ubuntu has its own terminal.
- **Command**: a line of text you paste into the terminal and run by pressing **Enter**.
- **Prompt**: the text before your cursor, e.g. `(base) madfad@MadSuperPC:~$`. When you see it, the terminal is
  ready for the next command. If it is missing, something is still running: wait.

## 1. Open the Ubuntu terminal

Press the **Windows key**, type **Ubuntu**, click **Ubuntu 22.04**. A black window opens and shows a prompt.

(Or in PowerShell type `wsl -d Ubuntu-22.04` and press Enter.)

## 2. Go to the project folder

Paste this and press Enter (right-click pastes in the terminal; Ctrl+V usually works too):

```bash
cd ~/sandbox/unimate-trial && git pull
```

`cd` means "go to this folder"; `~` is your Linux home folder. `git pull` fetches the latest scripts.

## 3. Make animations from sentences

Put each sentence in double quotes, separated by spaces:

```bash
./make_animation.sh "A person jumps up and lands." "A person waves with their right hand."
```

What happens (it prints each step):
1. The AI turns each sentence into a 2-second motion (on your GPU, usually under a minute).
2. Blender puts the motion on your character (about 30 seconds per clip).
3. The results are copied to Windows, into **Downloads\unimate\run_<date>_<time>**.

It makes 2 versions of each sentence. When it says **DONE** and the prompt is back, open that folder in Windows
Explorer.

Do not close the window while it runs. To cancel a run, press **Ctrl+C**.

## 4. Look at the results

In the Downloads\unimate\run_... folder:
- `*_fk.mp4`: stick-figure preview videos. Double-click to play.
- `*.glb`: your character, animated. Go to https://gltf-viewer.donmccurdy.com/ in your browser, drag the
  `.glb` file onto the page, then in the panel on the right open **Animation** and tick `Reconstructed_Action`.

## Writing good sentences

- One action per sentence; the clip is only 2 seconds.
- Start with "A person ...", say which body part and side: "A person kicks with their right leg."
- Not "walks, then sits, then waves": that is three clips.
- To see how the training data describes motions, run `./mixamo_trial.sh captions` and copy that style.
- Fingers never move (the model does not animate them).

## Optional settings

Put these in front of the command:

| Setting | Example | What it does |
|---|---|---|
| `REPLICATE` | `REPLICATE=4` | versions per sentence (default 2) |
| `SEED` | `SEED=random` | different results each run (default: the same results every time for the same sentence) |
| `CFG` | `CFG=5` | how strictly it follows the sentence (default 3; try 2 to 6) |

Example: `REPLICATE=4 SEED=random ./make_animation.sh "A person dances happily."`

## Changing the character

**See which characters you can use:**
```bash
./make_animation.sh --list
```
It shows two groups: **your characters** (files you added, like Ch47_nonPBR) and **built-in Mixamo characters**
that came with the dataset you downloaded (Amy, Y_Bot and others). Use the names exactly as listed (upper or
lower case does not matter).

**Use a character for one run:** put `--char Name` before the sentences:
```bash
./make_animation.sh --char Amy "A person bows."
```

**Change the default** (used whenever you leave out `--char`):
```bash
./make_animation.sh --default Amy
```
Until you set one, the default is your first own character (Ch47_nonPBR), or Y_Bot if you have none.

**Add a new character from Mixamo:**
1. On mixamo.com pick a character and click Download with Format **FBX Binary (.fbx)** and Pose **T-pose**.
   It lands in your Windows **Downloads** folder.
2. In Ubuntu, give the file name (in quotes if it has spaces):
   ```bash
   ./make_animation.sh --add "NewCharacter.fbx"
   ```
   This copies it from Downloads, fixes the bone names if needed (about 30 seconds), and tells you the name to use.
3. Use it: `./make_animation.sh --char NewCharacter "A person waves."`

Notes: built-in characters are used as they are; whether every one of them looks right has not been checked.
Characters that are not from Mixamo will not work with this command.

## If something goes wrong

- The script prints the last lines of the error and the name of a log file under `prompts/`. Copy the
  error text (select it, right-click) or take a screenshot and send it to Claude.
- `Permission denied`: run `chmod +x *.sh` once, then try again.
- `No such file or directory`: you are probably in the wrong folder; repeat step 2.
- The window shows `>` and nothing happens: a quote is missing. Press Ctrl+C and retype the command.

## Seeing the Linux files from Windows

In Windows Explorer's address bar type `\\wsl.localhost\Ubuntu-22.04\home\madfad\sandbox\unimate-trial` and press
Enter. Fine for looking and copying; run the scripts from the Ubuntu terminal.
