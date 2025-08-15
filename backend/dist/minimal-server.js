"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});
// Football quotes endpoint
app.get('/api/football-quotes', (req, res) => {
    const quotes = [
        { quote: "Football is a simple game. Twenty-two men chase a ball for 90 minutes and at the end, the Germans always win.", author: "Gary Lineker" },
        { quote: "The game is about glory, it is about doing things in style and with a flourish, about going out and beating the other lot, not waiting for them to die of boredom.", author: "Danny Blanchflower" },
        { quote: "Some people think football is a matter of life and death. I assure you, it's much more serious than that.", author: "Bill Shankly" },
        { quote: "The more difficult the victory, the greater the happiness in winning.", author: "Pele" },
        { quote: "You can change your wife, your politics, your religion, but never, never can you change your favorite football team.", author: "Eric Cantona" }
    ];
    res.json({ quotes });
});
// Error handling
// Error handling middleware
app.use((err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
