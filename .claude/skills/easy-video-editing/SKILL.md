---
name: easy-video-editing
description: Simple video editing for reels and social posts with ffmpeg, faster-whisper and OpenCV. Use when the person uploads a video and asks to transcribe it, add captions (plain or pop-up), make it vertical / follow their face, cut silent parts, trim, join clips, add background music, speed up, make a cover photo, or make it smaller for WhatsApp. Supports English and Malay.
---

# Easy Video Editing

Talk to the person in simple words. Don't show commands unless they ask.

## 0. Make sure the tools are installed (safe to re-run, fast if already done)

```bash
bash "$CLAUDE_PROJECT_DIR/.claude/skills/easy-video-editing/install.sh"
```

If it prints that the speech model could not download, tell the person:
"Speech-to-text needs the Hugging Face websites allowed in your cloud environment's network settings." Everything else still works.

Scripts live in `S=$CLAUDE_PROJECT_DIR/.claude/skills/easy-video-editing/scripts` (if `$CLAUDE_PROJECT_DIR` is empty, use the repo root).

## 1. Where files are

- Uploads in Claude Code cloud sessions land in `/root/.claude/uploads/<session-id>/` (on claude.ai chat it is `/mnt/user-data/uploads/`). Find them with `ls -t /root/.claude/uploads/*/ /mnt/user-data/uploads/ 2>/dev/null`.
- Work on a copy. Never change the original.
- Save results in the project folder (e.g. `outputs/`) so the person can open them, and send them with SendUserFile. Name them clearly (`reel-captions.mp4`).
- Don't commit large videos to git unless asked.

## 2. Check every result

- Contact sheet, then look at it: `ffmpeg -y -i out.mp4 -vf "fps=1/3,scale=270:-1,tile=6x1" -frames:v 1 sheet.jpg`
- Length/size: `ffprobe -v error -show_entries format=duration:stream=width,height -of default=nw=1 out.mp4`
- Reels: 1080x1920 (9:16), H.264 + AAC, `-pix_fmt yuv420p`, `-movflags +faststart`.

## 3. Recipes

**Transcribe / captions file**
```bash
python3 $S/transcribe.py in.mp4 --lang en
python3 $S/transcribe.py in.mp4 --lang ms --model medium --prompt "names, brand words"   # Malay
```
Gives `in.srt` + `in_words.json`. Show the text. Fix wrong names in the .srt by hand.

**Pop-up captions burned in** (video must be 1080x1920 first)
```bash
python3 $S/popcaps.py in.srt caps.ass --accent "FREE,WEIGHT"
ffmpeg -i in.mp4 -vf "ass=caps.ass" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4
```

**Plain captions burned in**
```bash
ffmpeg -i in.mp4 -vf "subtitles=in.srt:force_style='FontName=Montserrat,FontSize=14,Bold=1,Outline=2,MarginV=60'" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4
```

**Vertical + follow the face** (~3 s of work per 1 s of video)
```bash
python3 $S/facetrack.py in.mp4 out.mp4      # calmer: --smooth 0.04 ; faster: --every 5
```
Already-vertical video stays as is. With two people it follows the biggest face.

**Cut pauses**
```bash
python3 $S/cutpauses.py in.mp4 out.mp4 --min 0.35
```

**Trim** (keep 0:05 to 0:20)
```bash
ffmpeg -ss 00:00:05 -to 00:00:20 -i in.mp4 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -movflags +faststart out.mp4
```

**Join clips** (re-encodes, so clips from different phones still join)
```bash
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0];[1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1];[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -movflags +faststart out.mp4
```
More clips: add inputs and `[v2][a2]`, set `n=`. A clip with no sound needs a silent track: add `-f lavfi -t <len> -i anullsrc=r=48000:cl=stereo` and use that input's audio.

**9:16 with blurred background**
```bash
ffmpeg -i in.mp4 -filter_complex "[0]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20[bg];[0]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4
```

**Music under the voice** (music ~15%, fades out over the last 2 s; DUR = video length from ffprobe)
```bash
ffmpeg -i in.mp4 -i music.mp3 -filter_complex "[1:a]volume=0.15,afade=t=out:st=DUR-2:d=2[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -movflags +faststart out.mp4
```
`normalize=0` keeps the voice at full volume (without it, amix halves the voice). Only use music the person owns or that is royalty-free. Never put song lyrics on screen.

**Speed up 1.2x**
```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=PTS/1.2[v];[0:a]atempo=1.2[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart out.mp4
```

**Smaller for WhatsApp** (long side max 1280, never upscales, works for vertical and landscape)
```bash
ffmpeg -i in.mp4 -vf "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart small.mp4
```

**Cover photo**
```bash
ffmpeg -ss 00:00:03 -i in.mp4 -frames:v 1 -q:v 2 cover.jpg
```

## Rules
- Keep the original file untouched.
- Captions sit in the lower middle so TikTok/Instagram buttons don't cover them.
- If something fails, say what failed in one line and try the next simplest way.
- Remind the person to watch the video before posting.
