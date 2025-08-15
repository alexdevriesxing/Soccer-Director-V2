"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let testLeague;
let testClub;
let testPlayer;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75;
    // Delete all child records before parents
    yield ((_b = (_a = prisma.vARDecisions) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
    yield ((_d = (_c = prisma.realTimeTacticalChanges) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
    yield ((_f = (_e = prisma.weather) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
    yield ((_h = (_g = prisma.pitchConditions) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
    yield ((_k = (_j = prisma.playerPosition) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
    yield ((_m = (_l = prisma.playerAward) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
    yield ((_p = (_o = prisma.playerRequest) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
    yield ((_r = (_q = prisma.fanGroup) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
    yield ((_t = (_s = prisma.fanEvent) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
    yield ((_v = (_u = prisma.fanSentiment) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
    yield ((_x = (_w = prisma.squadRegistration) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
    yield ((_z = (_y = prisma.tacticalFamiliarity) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
    yield ((_1 = (_0 = prisma.boardMember) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
    yield ((_3 = (_2 = prisma.boardMeeting) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
    yield ((_5 = (_4 = prisma.fanProtests) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
    yield ((_7 = (_6 = prisma.clubLegends) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
    yield ((_9 = (_8 = prisma.loan) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
    yield ((_11 = (_10 = prisma.transfer) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
    yield ((_13 = (_12 = prisma.playerTrait) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
    yield ((_15 = (_14 = prisma.playerInjury) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
    yield ((_17 = (_16 = prisma.playerAward) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
    yield ((_19 = (_18 = prisma.playerRequest) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
    yield ((_21 = (_20 = prisma.playerRelationship) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
    yield ((_23 = (_22 = prisma.playerPersonalStory) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
    yield ((_25 = (_24 = prisma.playerHabit) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
    yield ((_27 = (_26 = prisma.playerMediaEvent) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
    yield ((_29 = (_28 = prisma.releaseClauses) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
    yield ((_31 = (_30 = prisma.youthPlayerDevelopmentPlan) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
    yield ((_33 = (_32 = prisma.playerContractBonus) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
    yield ((_35 = (_34 = prisma.setPieceSpecialists) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
    yield ((_37 = (_36 = prisma.playerInstructions) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
    yield ((_39 = (_38 = prisma.playerMoraleLog) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
    yield ((_41 = (_40 = prisma.playerMentorship) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
    yield ((_43 = (_42 = prisma.playerCareerGoals) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
    yield ((_45 = (_44 = prisma.playerEndorsements) === null || _44 === void 0 ? void 0 : _44.deleteMany) === null || _45 === void 0 ? void 0 : _45.call(_44, {}));
    yield ((_47 = (_46 = prisma.youthNews) === null || _46 === void 0 ? void 0 : _46.deleteMany) === null || _47 === void 0 ? void 0 : _47.call(_46, {}));
    yield ((_49 = (_48 = prisma.offFieldEvent) === null || _48 === void 0 ? void 0 : _48.deleteMany) === null || _49 === void 0 ? void 0 : _49.call(_48, {}));
    yield ((_51 = (_50 = prisma.pressureHandling) === null || _50 === void 0 ? void 0 : _50.deleteMany) === null || _51 === void 0 ? void 0 : _51.call(_50, {}));
    yield ((_53 = (_52 = prisma.leadershipQualities) === null || _52 === void 0 ? void 0 : _52.deleteMany) === null || _53 === void 0 ? void 0 : _53.call(_52, {}));
    yield ((_55 = (_54 = prisma.careerAmbitions) === null || _54 === void 0 ? void 0 : _54.deleteMany) === null || _55 === void 0 ? void 0 : _55.call(_54, {}));
    yield ((_57 = (_56 = prisma.playerFatigue) === null || _56 === void 0 ? void 0 : _56.deleteMany) === null || _57 === void 0 ? void 0 : _57.call(_56, {}));
    yield ((_59 = (_58 = prisma.injuryRisk) === null || _58 === void 0 ? void 0 : _58.deleteMany) === null || _59 === void 0 ? void 0 : _59.call(_58, {}));
    yield ((_61 = (_60 = prisma.playerPsychology) === null || _60 === void 0 ? void 0 : _60.deleteMany) === null || _61 === void 0 ? void 0 : _61.call(_60, {}));
    yield ((_63 = (_62 = prisma.homesickness) === null || _62 === void 0 ? void 0 : _62.deleteMany) === null || _63 === void 0 ? void 0 : _63.call(_62, {}));
    yield ((_65 = (_64 = prisma.startingXISlot) === null || _64 === void 0 ? void 0 : _64.deleteMany) === null || _65 === void 0 ? void 0 : _65.call(_64, {}));
    yield ((_67 = (_66 = prisma.liveMatchEvent) === null || _66 === void 0 ? void 0 : _66.deleteMany) === null || _67 === void 0 ? void 0 : _67.call(_66, {}));
    yield ((_69 = (_68 = prisma.contractNegotiation) === null || _68 === void 0 ? void 0 : _68.deleteMany) === null || _69 === void 0 ? void 0 : _69.call(_68, {}));
    yield prisma.trainingFocus.deleteMany({});
    // Now delete players, clubs, leagues
    yield ((_71 = (_70 = prisma.player) === null || _70 === void 0 ? void 0 : _70.deleteMany) === null || _71 === void 0 ? void 0 : _71.call(_70, {}));
    yield ((_73 = (_72 = prisma.club) === null || _72 === void 0 ? void 0 : _72.deleteMany) === null || _73 === void 0 ? void 0 : _73.call(_72, {}));
    yield ((_75 = (_74 = prisma.league) === null || _74 === void 0 ? void 0 : _74.deleteMany) === null || _75 === void 0 ? void 0 : _75.call(_74, {}));
    // --- Robust test data creation ---
    // Always create a new league, club, and player for each test
    testLeague = yield prisma.league.create({
        data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
    });
    testClub = yield prisma.club.create({
        data: {
            name: 'Test Club',
            leagueId: testLeague.id,
            homeCity: 'Test City',
            regionTag: 'Test',
            boardExpectation: 'Mid',
            morale: 50,
            form: 'Good',
            isJongTeam: false
        }
    });
    testPlayer = yield prisma.player.create({
        data: { name: 'Test Player', clubId: testClub.id, position: 'MID', age: 22, skill: 70, nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 70, contractStart: new Date() }
    });
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75;
    // Delete all child records before parents
    yield ((_b = (_a = prisma.vARDecisions) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
    yield ((_d = (_c = prisma.realTimeTacticalChanges) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
    yield ((_f = (_e = prisma.weather) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
    yield ((_h = (_g = prisma.pitchConditions) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
    yield ((_k = (_j = prisma.playerPosition) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
    yield ((_m = (_l = prisma.playerAward) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
    yield ((_p = (_o = prisma.playerRequest) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
    yield ((_r = (_q = prisma.fanGroup) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
    yield ((_t = (_s = prisma.fanEvent) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
    yield ((_v = (_u = prisma.fanSentiment) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
    yield ((_x = (_w = prisma.squadRegistration) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
    yield ((_z = (_y = prisma.tacticalFamiliarity) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
    yield ((_1 = (_0 = prisma.boardMember) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
    yield ((_3 = (_2 = prisma.boardMeeting) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
    yield ((_5 = (_4 = prisma.fanProtests) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
    yield ((_7 = (_6 = prisma.clubLegends) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
    yield ((_9 = (_8 = prisma.loan) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
    yield ((_11 = (_10 = prisma.transfer) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
    yield ((_13 = (_12 = prisma.playerTrait) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
    yield ((_15 = (_14 = prisma.playerInjury) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
    yield ((_17 = (_16 = prisma.playerAward) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
    yield ((_19 = (_18 = prisma.playerRequest) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
    yield ((_21 = (_20 = prisma.playerRelationship) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
    yield ((_23 = (_22 = prisma.playerPersonalStory) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
    yield ((_25 = (_24 = prisma.playerHabit) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
    yield ((_27 = (_26 = prisma.playerMediaEvent) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
    yield ((_29 = (_28 = prisma.releaseClauses) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
    yield ((_31 = (_30 = prisma.youthPlayerDevelopmentPlan) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
    yield ((_33 = (_32 = prisma.playerContractBonus) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
    yield ((_35 = (_34 = prisma.setPieceSpecialists) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
    yield ((_37 = (_36 = prisma.playerInstructions) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
    yield ((_39 = (_38 = prisma.playerMoraleLog) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
    yield ((_41 = (_40 = prisma.playerMentorship) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
    yield ((_43 = (_42 = prisma.playerCareerGoals) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
    yield ((_45 = (_44 = prisma.playerEndorsements) === null || _44 === void 0 ? void 0 : _44.deleteMany) === null || _45 === void 0 ? void 0 : _45.call(_44, {}));
    yield ((_47 = (_46 = prisma.youthNews) === null || _46 === void 0 ? void 0 : _46.deleteMany) === null || _47 === void 0 ? void 0 : _47.call(_46, {}));
    yield ((_49 = (_48 = prisma.offFieldEvent) === null || _48 === void 0 ? void 0 : _48.deleteMany) === null || _49 === void 0 ? void 0 : _49.call(_48, {}));
    yield ((_51 = (_50 = prisma.pressureHandling) === null || _50 === void 0 ? void 0 : _50.deleteMany) === null || _51 === void 0 ? void 0 : _51.call(_50, {}));
    yield ((_53 = (_52 = prisma.leadershipQualities) === null || _52 === void 0 ? void 0 : _52.deleteMany) === null || _53 === void 0 ? void 0 : _53.call(_52, {}));
    yield ((_55 = (_54 = prisma.careerAmbitions) === null || _54 === void 0 ? void 0 : _54.deleteMany) === null || _55 === void 0 ? void 0 : _55.call(_54, {}));
    yield ((_57 = (_56 = prisma.playerFatigue) === null || _56 === void 0 ? void 0 : _56.deleteMany) === null || _57 === void 0 ? void 0 : _57.call(_56, {}));
    yield ((_59 = (_58 = prisma.injuryRisk) === null || _58 === void 0 ? void 0 : _58.deleteMany) === null || _59 === void 0 ? void 0 : _59.call(_58, {}));
    yield ((_61 = (_60 = prisma.playerPsychology) === null || _60 === void 0 ? void 0 : _60.deleteMany) === null || _61 === void 0 ? void 0 : _61.call(_60, {}));
    yield ((_63 = (_62 = prisma.homesickness) === null || _62 === void 0 ? void 0 : _62.deleteMany) === null || _63 === void 0 ? void 0 : _63.call(_62, {}));
    yield ((_65 = (_64 = prisma.startingXISlot) === null || _64 === void 0 ? void 0 : _64.deleteMany) === null || _65 === void 0 ? void 0 : _65.call(_64, {}));
    yield ((_67 = (_66 = prisma.liveMatchEvent) === null || _66 === void 0 ? void 0 : _66.deleteMany) === null || _67 === void 0 ? void 0 : _67.call(_66, {}));
    yield ((_69 = (_68 = prisma.contractNegotiation) === null || _68 === void 0 ? void 0 : _68.deleteMany) === null || _69 === void 0 ? void 0 : _69.call(_68, {}));
    yield prisma.trainingFocus.deleteMany({});
    // Now delete players, clubs, leagues
    yield ((_71 = (_70 = prisma.player) === null || _70 === void 0 ? void 0 : _70.deleteMany) === null || _71 === void 0 ? void 0 : _71.call(_70, {}));
    yield ((_73 = (_72 = prisma.club) === null || _72 === void 0 ? void 0 : _72.deleteMany) === null || _73 === void 0 ? void 0 : _73.call(_72, {}));
    yield ((_75 = (_74 = prisma.league) === null || _74 === void 0 ? void 0 : _74.deleteMany) === null || _75 === void 0 ? void 0 : _75.call(_74, {}));
}));
describe('Training API', () => {
    it('sets training focus (POST /api/training/focus)', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/training/focus')
            .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'technical', isExtra: false });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body.playerId).toBe(testPlayer.id);
        expect(res.body.clubId).toBe(testClub.id);
        expect(res.body.focus).toBe('technical');
    }));
    it('returns error for invalid player (POST /api/training/focus)', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/training/focus')
            .send({ clubId: testClub.id, playerId: 999999, focus: 'technical', isExtra: false });
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    }));
    it('sets extra training focus (POST /api/training/extra)', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/training/extra')
            .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'physical', isExtra: true });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body.isExtra).toBe(true);
    }));
    it('returns error for duplicate extra training (POST /api/training/extra)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.default)
            .post('/api/training/extra')
            .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'physical', isExtra: true });
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/training/extra')
            .send({ clubId: testClub.id, playerId: testPlayer.id, focus: 'tactical', isExtra: true });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    }));
});
