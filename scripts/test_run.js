
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

async function main() {
    console.log("Testing replicate.run('lucataco/faceswap-video') without version...");
    try {
        // We just want to see if it resolves the model, even if inputs are wrong
        await replicate.run("lucataco/faceswap-video", {
            input: {
                // prompt: "test" 
                // We expect an input error, not a 'model not found' error
            }
        });
    } catch (err) {
        console.log("Error:", err.message);
        if (err.message.includes("Invalid version") || err.message.includes("does not exist")) {
            console.log("-> Model likely does not exist.");
        } else if (err.message.includes("Input")) {
            console.log("-> Model EXISTS! Inputs were wrong (expected).");
        }
    }
}

main();
