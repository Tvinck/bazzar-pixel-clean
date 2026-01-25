# Справочник параметров Video Generation моделей Kie.ai

## 🎬 Wan (Alibaba)

### Wan 2.6 Text-to-Video
- **Model ID:** `wan/2-6-text-to-video`
- **Параметры:**
  - `prompt` ✅ (required)
  - `duration` ✅ (5, 10)
  - `resolution` ✅ (720p, 1080p)
  - `aspect_ratio` ✅

### Wan 2.6 Video-to-Video
- **Model ID:** `wan/2-6-video-to-video`
- **Параметры:**
  - `prompt` ✅ (required)
  - `video_urls` ✅ (required, array)
  - `duration` ✅ (5, 10)
  - `resolution` ✅ (720p, 1080p)

### Wan 2.5 Image-to-Video
- **Model ID:** `wan/2-5-image-to-video`
- **Параметры:**
  - `prompt` ✅ (required)
  - `image_url` ✅ (required, singular)
  - `duration` ✅ (5, 10)
  - `resolution` ✅ (720p, 1080p)
  - `enable_prompt_expansion` ⚠️ (optional, boolean)

### Wan 2.5 Text-to-Video
- **Model ID:** `wan/2-5-text-to-video`
- **Параметры:**
  - `prompt` ✅ (required)
  - `duration` ✅ (5, 10)
  - `resolution` ✅ (720p, 1080p)
  - `aspect_ratio` ✅

### Wan 2.2 Turbo (Text)
- **Model ID:** `wan/2-2-a14b-text-to-video-turbo`
- **Параметры:**
  - `prompt` ✅ (required)
  - `duration` ✅ (5, 10)
  - `resolution` ✅ (480p, 720p)

### Wan 2.2 Turbo (Image)
- **Model ID:** `wan/2-2-a14b-image-to-video-turbo`
- **Параметры:**
  - `prompt` ✅ (required)
  - `image_url` ✅ (required, singular)
  - `duration` ✅ (5, 10)
  - `resolution` ✅ (480p, 720p)

### Wan 2.2 Turbo (Speech)
- **Model ID:** `wan/2-2-a14b-speech-to-video-turbo`
- **Параметры:**
  - `image_url` ✅ (required, singular)
  - `audio_url` ✅ (required, singular)
  - `duration` ✅ (5, 10)
  - `resolution` ✅ (480p, 720p)
  - `prompt` ❌ (not used)

---

## 🎥 Kling AI

### Kling 2.6 Text-to-Video
- **Model ID:** `kling-2.6/text-to-video`
- **Параметры:**
  - `prompt` ✅ (required)
  - `duration` ✅ (5, 10) - strip 's'
  - `sound` ⚠️ (optional, boolean)
  - `aspect_ratio` ✅
  - `resolution` ❌ **НЕТ**

### Kling 2.6 Image-to-Video
- **Model ID:** `kling-2.6/image-to-video`
- **Параметры:**
  - `prompt` ✅ (required, use 'animate this image' if empty)
  - `image_url` ✅ (required, **ТОЛЬКО** image_url, НЕ image!)
  - `duration` ✅ (5, 10) - strip 's'
  - `sound` ⚠️ (optional, boolean)
  - `aspect_ratio` ❌ **УДАЛИТЬ** (конфликтует с source image)
  - `resolution` ❌ **НЕТ**

### Kling 2.5 Turbo Image-to-Video Pro
- **Model ID:** `kling/v2-5-turbo-image-to-video-pro`
- **Параметры:**
  - `prompt` ✅ (required)
  - `image_url` ✅ (required, singular)
  - `duration` ✅ (5, 10) - strip 's'
  - `tail_image_url` ⚠️ (optional, для end frame)
  - `cfg_scale` ⚠️ (optional)

### Kling Motion Control
- **Model ID:** `kling-2.6/motion-control`
- **Параметры:**
  - `prompt` ✅ (required, use 'animate' if empty)
  - `input_urls` ✅ (required, array with source image)
  - `video_urls` ✅ (required, array with reference video)
  - `character_orientation` ✅ ('video')
  - `mode` ✅ ('720p')

### Kling AI Avatar
- **Model ID:** `kling/ai-avatar-standard`
- **Параметры:**
  - `image_url` ✅ (required, avatar image)
  - `audio_url` ✅ (required, speech audio)
  - `prompt` ❌ (not used)

---

## 🌱 Seedance / Bytedance

### Seedance 1.5 Pro
- **Model ID:** `bytedance/seedance-1.5-pro`
- **Параметры:**
  - `prompt` ✅ (required)
  - `duration` ✅ (4, 8, 12) - strip 's'
  - `input_urls` ⚠️ (optional, array if image provided)
  - `aspect_ratio` ⚠️ (optional)
  - `resolution` ✅ (480p, 720p)
  - `generate_audio` ⚠️ (optional, boolean)
  - `fixed_lens` ⚠️ (optional, boolean)

### Bytedance Fast Image-to-Video
- **Model ID:** `bytedance/v1-pro-fast-image-to-video`
- **Параметры:**
  - `image_url` ✅ (required, singular)
  - `duration` ✅ (5, 10) - strip 's'
  - `resolution` ✅ (720p, 1080p)
  - `prompt` ❌ (not used)

---

## 🌊 Hailuo (Minimax)

### Hailuo 2.3 Image-to-Video Pro
- **Model ID:** `hailuo/2-3-image-to-video-pro`
- **Параметры:**
  - `prompt` ✅ (required)
  - `image_url` ✅ (required, singular)
  - `duration` ✅ **ФИКСИРОВАННЫЙ '6'** (не настраивается!)
  - `resolution` ❌ **КРИТИЧНО: НЕТ! Вызывает 500 error!**
  - `aspect_ratio` ✅

**⚠️ ВАЖНО:** Hailuo НЕ поддерживает `resolution`. Всегда удаляйте это поле!

---

## 🎬 Google Veo

### Veo 3.1
- **Model ID:** `google/veo`
- **Параметры:**
  - `prompt` ✅ (required)
  - `duration` ✅ (5, 10) - strip 's'
  - `resolution` ✅ **ФИКСИРОВАННЫЙ '1080p'**
  - `image_url` ⚠️ (optional, для image-to-video)
  - `aspect_ratio` ⚠️ (только для text-to-video, удалить для i2v)

---

## 🎭 Sora

### Sora 2 Pro Storyboard
- **Model ID:** `sora-2-pro-storyboard`
- **Параметры:**
  - `shots` ✅ (required, array of shot objects)
    - `shot.prompt` ✅ (required)
    - `shot.duration` ✅ ('5s', '10s' - с 's'!)
    - `shot.image_url` ⚠️ (optional, для i2v)
  - `aspect_ratio` ⚠️ (только для text-to-video, удалить для i2v)
  - `prompt` ❌ **УДАЛИТЬ** (используется shots[].prompt)

---

## 📋 Общие правила

### Duration
- **Большинство моделей:** Strip 's' (`'5s'` → `'5'`)
- **Исключения:** Sora (`'5s'` остаётся как есть)

### Image Input
- **Singular:** `image_url` (string) - Kling, Hailuo, Wan 2.5, Bytedance
- **Array:** `input_urls` (array) - Seedance, Motion Control

### Resolution Support
- ✅ **Поддерживают:** Wan, Seedance, Bytedance, Veo
- ❌ **НЕ поддерживают:** Kling, Hailuo (КРИТИЧНО!)

### Aspect Ratio
- ✅ **Text-to-Video:** Всегда отправляем
- ❌ **Image-to-Video:** Часто конфликтует с source image - удаляем для Kling, Sora, Veo

---

## 🔧 Debugging Tips

### Если получаете 500 error:

1. **Проверьте Debug Info:**
```javascript
const debugInfo = {
    model: kieModelId,
    keys: Object.keys(finalInput),
    input_urls: finalInput.input_urls,
    video_urls: finalInput.video_urls,
    mode: finalInput.mode
};
```

2. **Частые причины:**
   - ❌ Отправка `resolution` для Hailuo/Kling
   - ❌ Отправка `aspect_ratio` для Image-to-Video
   - ❌ Дублирующие ключи (`image` + `image_url`)
   - ❌ Неправильный формат duration (с/без 's')
   - ❌ Array вместо string или наоборот

3. **Используйте normalizeKieInput:**
   - Для Video моделей - **SKIP** (return early)
   - Для Image моделей - добавляем polyfills

---

## 📚 Источники

- Kie.ai Official Documentation
- Проверено на production: 25 января 2026
- Все модели протестированы и работают ✅
