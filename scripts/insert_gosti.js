
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ktookvpqtmzfccojarwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b29rdnBxdG16ZmNjb2phcndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzc2NSwiZXhwIjoyMDgzODg5NzY1fQ.L99oEJS40e0R_l05Jm2kZkItJKdaPAEYrGM0WQ0y08Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const newTemplate = {
    id: 'gosti',
    title: "Гости из Будущего",
    description: "Сгенерируй танец под Гости из Будущего!",
    category: 'dances',
    likes: "12k",
    src: "/videos/gosti.mp4",
    media_type: 'video',
    model_id: 'kling_motion_control',
    generation_prompt: 'The character is performing an expressive dance with rhythmic arm movements and body swaying, following the nostalgic pop melody. Emotional and synchronized choreography.',
    configuration: {
        mode: '720p',
        character_orientation: 'video'
    }
};

async function insertTemplate() {
    console.log('Inserting template:', newTemplate.id);

    // Check if exists
    const { data: existing } = await supabase
        .from('templates')
        .select('id')
        .eq('id', newTemplate.id)
        .single();

    if (existing) {
        console.log('Template already exists. Updating...');
        const { error } = await supabase
            .from('templates')
            .update(newTemplate)
            .eq('id', newTemplate.id);

        if (error) console.error('Error updating:', error);
        else console.log('Successfully updated template!');
    } else {
        const { error } = await supabase
            .from('templates')
            .insert(newTemplate);

        if (error) console.error('Error inserting:', error);
        else console.log('Successfully inserted template!');
    }
}

insertTemplate();
