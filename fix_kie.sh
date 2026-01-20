#!/bin/bash
# Quick fix for Kie.ai API structure

FILE="src/ai-service.js"

# Backup
cp "$FILE" "$FILE.backup"

# Replace the problematic section (lines 110-133)
sed -i.tmp '110,133d' "$FILE"

# Insert correct code at line 110
sed -i.tmp '109a\
        // Convert model ID to Kie.ai format (underscore to dash)\
        const kieModelId = modelId.replace(/_/g, "-");\
\
        // Prepare input object (Kie.ai specific structure)\
        const input = {\
            prompt: prompt,\
            aspect_ratio: options.aspect_ratio || "1:1",\
            resolution: options.resolution || "1K",\
            output_format: options.output_format || "png"\
        };\
\
        // Add source files if present\
        if (options.source_files && options.source_files.length > 0) {\
            input.image_input = options.source_files;\
        }\
\
        // Create task with correct Kie.ai structure\
        const requestBody = {\
            model: kieModelId,\
            input: input\
        };\
\
        console.log("📤 Kie.ai Request:", JSON.stringify(requestBody, null, 2));\
\
        // Create task\
        const createRes = await fetch(`${KIE_API_URL}/jobs/createTask`, {\
            method: "POST",\
            headers: {\
                "Authorization": `Bearer ${apiKey}`,\
                "Content-Type": "application/json"\
            },\
            body: JSON.stringify(requestBody)\
        });
' "$FILE"

rm "$FILE.tmp"
echo "✅ Fixed Kie.ai API structure"
