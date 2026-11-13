# Photoshop Batch Background Remover & LoRA Dataset Preprocessor (ExtendScript)

An automated Adobe Photoshop ExtendScript (`.jsx`) designed for unattended **AI dataset preparation** (specifically tailored for training **LoRA** models on **Flux** and **Pony Diffusion** via **Ostris AI-Toolkit**). It leverages Photoshop's native AI subject selection engine (`autoCutout`) to isolate subjects, classify assets by aspect ratio, export clean transparent PNGs, and actively purge scratch disk memory across large image queues.

## Role in the AI Training Pipeline
Preparing high-quality datasets for diffusion models requires strict background consistency so captioning models focus solely on subject features rather than background noise:
1. **Subject Isolation (This Script):** Strips original backgrounds into clean alpha-channel PNGs sorted by aspect ratio (`Horizontales` / `Verticales`).
2. **Flux Training Branch:** Transparent PNGs feed downstream mask-generation scripts to produce precise training masks for **Flux** LoRAs.
3. **Pony Diffusion Training Branch:** Transparent PNGs are composited onto solid white studio backgrounds before running through a **ComfyUI + WD-Tagger** automated captioning workflow, resulting in clean, studio-grade tags and highly detailed LoRA weights.

## Key Features
- **Unattended Silent Execution:** Suppresses modal alerts (`DialogModes.NO`) during batch runs and restores UI defaults upon completion.
- **Native Subject Isolation (`autoCutout`):** Executes low-level `ActionDescriptor` calls to trigger Photoshop's native subject detection, invert selection, and clear backgrounds onto unlocked alpha layers.
- **Automatic Orientation Sorting:** Inspects image dimensions (`width >= height`) to automatically route processed assets into separate Landscape and Portrait subdirectories for bucket-optimized training.
- **Idempotent Resume Support:** Checks if the output `.png` already exists before opening, allowing interrupted batch jobs to resume seamlessly without reprocessing completed files.
- **Active Memory & Scratch Disk Purging:** Explicitly invokes `app.purge(PurgeTarget.HISTORY)` and `PurgeTarget.CLIPBOARD` after every file to prevent RAM exhaustion and scratch disk bloat during large dataset runs.

## Usage
1. Place your raw dataset images (`.jpg`, `.jpeg`, `.png`, `.webp`) inside the input directory (`C:/DataSet/conFondo` by default, or update `origenDir` / `destinoDir` at the top of the script).
2. Open **Adobe Photoshop** (CC 2020 or newer recommended for `autoCutout` support).
3. Go to **File > Scripts > Browse...** and select `batch_remove_background.jsx`.
4. Wait for the completion summary dialog showing total processed files and any skipped errors.

## Requirements
- Adobe Photoshop CC 2020 or later
- Windows or macOS (update folder path separators if running on macOS)
