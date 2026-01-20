# Kie.ai Models - Complete Catalog

## 📊 Pricing Information

**Note:** Actual credit costs need to be verified on kie.ai dashboard. 
Prices below are estimates based on model complexity.

---

## 🖼️ IMAGE GENERATION MODELS

### GPT Image (OpenAI)
- **gpt-image/1.5-text-to-image** - GPT 1.5 Text to Image
  - Credits: ~30 (estimate)
  - Quality: medium/high
  - Speed: Medium
  
- **gpt-image/1.5-image-to-image** - GPT 1.5 Image to Image  
  - Credits: ~35 (estimate)
  - Quality: medium/high
  - Speed: Medium

### Seedream (ByteDance)
- **seedream/4.5-text-to-image** - Seedream 4.5 Text to Image
  - Credits: ~25 (estimate)
  - Quality: basic/high
  - Speed: Fast
  
- **seedream/4.5-edit** - Seedream 4.5 Edit
  - Credits: ~30 (estimate)
  - Quality: basic/high
  - Speed: Fast

- **bytedance/seedream** - Seedream 3.0
  - Credits: ~20 (estimate)
  - Quality: Good
  - Speed: Fast

- **bytedance/seedream-v4-text-to-image** - Seedream V4 Text to Image
  - Credits: ~25 (estimate)
  - Quality: 1K/2K/4K
  - Speed: Fast

- **bytedance/seedream-v4-edit** - Seedream V4 Edit
  - Credits: ~30 (estimate)
  - Quality: 1K/2K/4K
  - Speed: Fast

### Flux (Black Forest Labs)
- **flux-2/flex-text-to-image** - Flux 2 Flex
  - Credits: ~40 (estimate)
  - Quality: 1K/2K
  - Speed: Medium

- **flux-2/pro-text-to-image** - Flux 2 Pro
  - Credits: ~45 (estimate)
  - Quality: 1K/2K
  - Speed: Slow

### Grok Imagine (xAI)
- **grok-imagine/text-to-image** - Grok Text to Image
  - Credits: ~20 (estimate)
  - Quality: Good
  - Speed: Fast

- **grok-imagine/image-to-image** - Grok Image to Image
  - Credits: ~25 (estimate)
  - Quality: Good
  - Speed: Fast

- **grok-imagine/upscale** - Grok Upscale
  - Credits: ~15 (estimate)
  - Quality: High
  - Speed: Fast

### Z-Image
- **z-image** - Z-Image
  - Credits: ~30 (estimate)
  - Quality: High
  - Speed: Medium

### Ideogram
- **ideogram/v3-reframe** - Ideogram V3 Reframe
  - Credits: ~25 (estimate)
  - Quality: Good
  - Speed: Fast

### Recraft
- **recraft/remove-background** - Remove Background
  - Credits: ~10 (estimate)
  - Quality: High
  - Speed: Very Fast

- **recraft/crisp-upscale** - Crisp Upscale
  - Credits: ~15 (estimate)
  - Quality: High
  - Speed: Fast

---

## 🎬 VIDEO GENERATION MODELS

### Grok Imagine Video (xAI)
- **grok-imagine/text-to-video** - Grok Text to Video
  - Credits: ~100 (estimate)
  - Duration: ~5s
  - Speed: Slow

- **grok-imagine/image-to-video** - Grok Image to Video
  - Credits: ~120 (estimate)
  - Duration: ~5s
  - Speed: Slow

---

## 📝 Model Name Mapping

| Internal ID | Kie.ai Model Name |
|-------------|-------------------|
| gpt4o_image_text | gpt-image/1.5-text-to-image |
| gpt4o_image_edit | gpt-image/1.5-image-to-image |
| seedream_45_text | seedream/4.5-text-to-image |
| seedream_45_edit | seedream/4.5-edit |
| seedream_v4_text | bytedance/seedream-v4-text-to-image |
| seedream_v4_edit | bytedance/seedream-v4-edit |
| flux_flex | flux-2/flex-text-to-image |
| flux_pro | flux-2/pro-text-to-image |
| grok_text | grok-imagine/text-to-image |
| grok_image | grok-imagine/image-to-image |
| grok_upscale | grok-imagine/upscale |
| z_image | z-image |
| ideogram_reframe | ideogram/v3-reframe |
| recraft_bg_remove | recraft/remove-background |
| recraft_upscale | recraft/crisp-upscale |
| grok_text_video | grok-imagine/text-to-video |
| grok_image_video | grok-imagine/image-to-video |

---

## ⚠️ Important Notes

1. **Credit costs are estimates** - Check kie.ai dashboard for actual pricing
2. **All models use the same API structure** - `POST /api/v1/jobs/createTask`
3. **Polling is required** - Use `GET /api/v1/jobs/recordInfo?taskId={taskId}`
4. **Result format** - All return `resultJson` with `resultUrls` array

---

## 🔗 References

- Official Docs: https://docs.kie.ai/
- API Key: https://kie.ai/api-key
- Dashboard: https://kie.ai/dashboard
