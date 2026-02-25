
import Replicate from 'replicate';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

async function checkModel(owner, name) {
    try {
        const model = await replicate.models.get(owner, name);
        if (model.latest_version) {
            console.log(`\n✅ FOUND: ${owner}/${name}`);
            console.log("VERSION=" + model.latest_version.id);
            const inputs = model.latest_version.openapi_schema?.components?.schemas?.Input?.properties;
            console.log("INPUTS=", inputs ? JSON.stringify(Object.keys(inputs)) : "No inputs found");

            if (inputs && (inputs.source || inputs.target_video || inputs.video || inputs.input_video)) {
                console.log("🎯 BINGO! This model accepts video input.");
                return true;
            }
        } else {
            console.log(`\n⚠️ FOUND: ${owner}/${name} but NO LATEST VERSION found.`);
        }
    } catch (err) {
        console.log(`❌ ${owner}/${name}: ${err.message}`);
    }
    return false;
}

async function main() {
    await checkModel("xrunda", "hello");
    await checkModel("arabyai-replicate", "roop_face_swap");
    console.log("Done.");
}

main();
