"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// GET /api/football-quotes
router.get('/', (req, res) => {
    // Use __dirname to resolve from the routes directory
    const quotesPath = path_1.default.resolve(__dirname, '../../locales/footballQuotes.json');
    // Check if file exists before reading
    if (!fs_1.default.existsSync(quotesPath)) {
        console.error(`[football-quotes] File not found: ${quotesPath}`);
        return res.status(500).json({ error: 'Football quotes file not found.' });
    }
    fs_1.default.readFile(quotesPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`[football-quotes] Failed to read file: ${quotesPath}`, err);
            return res.status(500).json({ error: 'Failed to load football quotes.' });
        }
        try {
            const quotes = JSON.parse(data);
            res.json({ quotes });
        }
        catch (e) {
            console.error(`[football-quotes] Invalid JSON in file: ${quotesPath}`, e);
            res.status(500).json({ error: 'Invalid football quotes data.' });
        }
    });
});
exports.default = router;
