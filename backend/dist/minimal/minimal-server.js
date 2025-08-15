"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const leagues_1 = __importDefault(require("./routes/leagues"));
const clubs_1 = __importDefault(require("./routes/clubs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0-minimal'
    });
});
app.get('/api/test', (_req, res) => {
    res.json({
        message: 'Backend is working!',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/leagues', leagues_1.default);
app.use('/api/clubs', clubs_1.default);
app.get('/api/football-quotes', (_req, res) => {
    const quotes = [
        { quote: "Football is a simple game. Twenty-two men chase a ball for 90 minutes and at the end, the Germans always win.", author: "Gary Lineker" },
        { quote: "The game is about glory, it is about doing things in style and with a flourish, about going out and beating the other lot, not waiting for them to die of boredom.", author: "Danny Blanchflower" },
        { quote: "Some people think football is a matter of life and death. I assure you, it's much more serious than that.", author: "Bill Shankly" },
        { quote: "The more difficult the victory, the greater the happiness in winning.", author: "Pele" },
        { quote: "You can change your wife, your politics, your religion, but never, never can you change your favorite football team.", author: "Eric Cantona" }
    ];
    res.json({ quotes });
});
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=minimal-server.js.map