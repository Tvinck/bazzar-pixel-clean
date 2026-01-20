import app from '../bot.js';

export default async function handler(req, res) {
    return app(req, res);
}
