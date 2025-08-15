"use strict";
// Youth News Service (stubbed)
// TODO: Replace with implementation aligned to current Prisma schema once models are defined
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNews = exports.getNewsForClub = exports.getNewsForPlayer = exports.createNews = void 0;
let newsSeq = 1;
const inMemoryNews = [];
// Create a news item
const createNews = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const item = Object.assign({ id: newsSeq++, createdAt: new Date() }, data);
    inMemoryNews.push(item);
    return item;
});
exports.createNews = createNews;
// Fetch all news for a player
const getNewsForPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () {
    return inMemoryNews.filter(n => n.playerId === playerId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});
exports.getNewsForPlayer = getNewsForPlayer;
// Fetch all news for a club
const getNewsForClub = (clubId) => __awaiter(void 0, void 0, void 0, function* () {
    return inMemoryNews.filter(n => n.clubId === clubId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});
exports.getNewsForClub = getNewsForClub;
// Search news by type or keyword
const searchNews = (query) => __awaiter(void 0, void 0, void 0, function* () {
    let results = inMemoryNews.slice();
    if (query.type)
        results = results.filter(n => n.type === query.type);
    if (query.keyword) {
        const kw = query.keyword.toLowerCase();
        results = results.filter(n => n.headline.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw));
    }
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});
exports.searchNews = searchNews;
