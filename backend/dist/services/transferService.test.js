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
const transferService_1 = __importDefault(require("./transferService"));
const client_1 = require("@prisma/client");
// Import Jest globals for type support
require("@jest/globals");
const prisma = new client_1.PrismaClient();
let testLeague;
let fromClub;
let toClub;
let testPlayer;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27;
    // Full teardown order to avoid FK constraint errors
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
    yield ((_9 = (_8 = prisma.playerCareerStat) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
    yield ((_11 = (_10 = prisma.playerTrait) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
    yield ((_13 = (_12 = prisma.playerInjury) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
    yield ((_15 = (_14 = prisma.playerHabit) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
    yield ((_17 = (_16 = prisma.playerMediaEvent) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
    yield ((_19 = (_18 = prisma.playerMoraleLog) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
    yield ((_21 = (_20 = prisma.playerMentorship) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
    yield ((_23 = (_22 = prisma.playerRelationship) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
    yield ((_25 = (_24 = prisma.playerInstructions) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
    yield ((_27 = (_26 = prisma.setPieceSpecialists) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
    // Always create a new league, two clubs, and a player for each test
    testLeague = yield prisma.league.create({
        data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
    });
    fromClub = yield prisma.club.create({
        data: { name: 'From Club', leagueId: testLeague.id, isJongTeam: false }
    });
    toClub = yield prisma.club.create({
        data: { name: 'To Club', leagueId: testLeague.id, isJongTeam: false }
    });
    testPlayer = yield prisma.player.create({
        data: { name: 'Test Player', clubId: fromClub.id, position: 'MID', age: 22, skill: 70, nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 70, contractStart: new Date() }
    });
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37;
    // Robust teardown for all player, club, and league children
    yield ((_b = (_a = prisma.playerTrait) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
    yield ((_d = (_c = prisma.playerInjury) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
    yield ((_f = (_e = prisma.playerAward) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
    yield ((_h = (_g = prisma.playerRequest) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
    yield ((_k = (_j = prisma.playerRelationship) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
    yield ((_m = (_l = prisma.playerPersonalStory) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
    yield ((_p = (_o = prisma.playerHabit) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
    yield ((_r = (_q = prisma.playerMediaEvent) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
    yield ((_t = (_s = prisma.releaseClauses) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
    yield ((_v = (_u = prisma.youthPlayerDevelopmentPlan) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
    yield ((_x = (_w = prisma.playerContractBonus) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
    yield ((_z = (_y = prisma.setPieceSpecialists) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
    yield ((_1 = (_0 = prisma.playerInstructions) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
    yield ((_3 = (_2 = prisma.playerMoraleLog) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
    yield ((_5 = (_4 = prisma.playerMentorship) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
    yield ((_7 = (_6 = prisma.playerCareerGoals) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
    yield ((_9 = (_8 = prisma.playerEndorsements) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
    yield ((_11 = (_10 = prisma.youthNews) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
    yield ((_13 = (_12 = prisma.offFieldEvent) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
    yield ((_15 = (_14 = prisma.pressureHandling) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
    yield ((_17 = (_16 = prisma.leadershipQualities) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
    yield ((_19 = (_18 = prisma.careerAmbitions) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
    yield ((_21 = (_20 = prisma.playerFatigue) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
    yield ((_23 = (_22 = prisma.injuryRisk) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
    yield ((_25 = (_24 = prisma.playerPsychology) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
    yield ((_27 = (_26 = prisma.homesickness) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
    yield ((_29 = (_28 = prisma.startingXISlot) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
    yield ((_31 = (_30 = prisma.liveMatchEvent) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
    yield ((_33 = (_32 = prisma.contractNegotiation) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
    yield ((_35 = (_34 = prisma.loan) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
    yield ((_37 = (_36 = prisma.transfer) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
    // Now delete players, clubs, leagues
    yield prisma.player.deleteMany({});
    yield prisma.club.deleteMany({});
    yield prisma.league.deleteMany({});
}));
describe('TransferService Loan Logic', () => {
    let fromClub;
    let toClub;
    let league;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43;
        // Robust teardown for all player, club, and league children
        yield ((_b = (_a = prisma.playerTrait) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
        yield ((_d = (_c = prisma.playerInjury) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
        yield ((_f = (_e = prisma.playerAward) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
        yield ((_h = (_g = prisma.playerRequest) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
        yield ((_k = (_j = prisma.playerRelationship) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
        yield ((_m = (_l = prisma.playerPersonalStory) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
        yield ((_p = (_o = prisma.playerHabit) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
        yield ((_r = (_q = prisma.playerMediaEvent) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
        yield ((_t = (_s = prisma.releaseClauses) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
        yield ((_v = (_u = prisma.youthPlayerDevelopmentPlan) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
        yield ((_x = (_w = prisma.playerContractBonus) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
        yield ((_z = (_y = prisma.setPieceSpecialists) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
        yield ((_1 = (_0 = prisma.playerInstructions) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
        yield ((_3 = (_2 = prisma.playerMoraleLog) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
        yield ((_5 = (_4 = prisma.playerMentorship) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
        yield ((_7 = (_6 = prisma.playerCareerGoals) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
        yield ((_9 = (_8 = prisma.playerEndorsements) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
        yield ((_11 = (_10 = prisma.youthNews) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
        yield ((_13 = (_12 = prisma.offFieldEvent) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
        yield ((_15 = (_14 = prisma.pressureHandling) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
        yield ((_17 = (_16 = prisma.leadershipQualities) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
        yield ((_19 = (_18 = prisma.careerAmbitions) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
        yield ((_21 = (_20 = prisma.playerFatigue) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
        yield ((_23 = (_22 = prisma.injuryRisk) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
        yield ((_25 = (_24 = prisma.playerPsychology) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
        yield ((_27 = (_26 = prisma.homesickness) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
        yield ((_29 = (_28 = prisma.startingXISlot) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
        yield ((_31 = (_30 = prisma.liveMatchEvent) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
        yield ((_33 = (_32 = prisma.contractNegotiation) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
        yield ((_35 = (_34 = prisma.loan) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
        yield ((_37 = (_36 = prisma.transfer) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
        // Now delete players, clubs, leagues
        yield ((_39 = (_38 = prisma.player) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
        yield ((_41 = (_40 = prisma.club) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
        yield ((_43 = (_42 = prisma.league) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
        // --- Robust test data creation ---
        league = yield prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        fromClub = yield prisma.club.create({ data: { name: 'Test From Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
        toClub = yield prisma.club.create({ data: { name: 'Test To Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
        yield prisma.trainingFocus.deleteMany({});
        yield ((_b = (_a = prisma.staffContract) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
        yield ((_d = (_c = prisma.staff) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
        yield ((_f = (_e = prisma.clubFormation) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
        yield ((_h = (_g = prisma.clubStrategy) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
        yield ((_k = (_j = prisma.facility) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
        yield ((_m = (_l = prisma.academyFacility) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
        yield ((_p = (_o = prisma.youthScout) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
        yield ((_r = (_q = prisma.squadRegistration) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
        yield ((_t = (_s = prisma.fixture) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
        yield ((_v = (_u = prisma.clubFinances) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
        yield ((_x = (_w = prisma.sponsorship) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
        yield ((_z = (_y = prisma.boardMember) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
        yield prisma.loan.deleteMany({});
        yield prisma.transfer.deleteMany({});
        yield prisma.player.deleteMany({});
        yield ((_1 = (_0 = prisma.gateReceipt) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
        yield ((_3 = (_2 = prisma.clubSeasonStats) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
        yield ((_5 = (_4 = prisma.matchEvent) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
        yield ((_7 = (_6 = prisma.liveMatchEvent) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
        yield prisma.club.deleteMany({});
        yield prisma.league.deleteMany({});
        yield prisma.$disconnect();
    }));
    it('creates a loan offer successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const fromClub = yield prisma.club.create({ data: {
                name: 'Test From Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const toClub = yield prisma.club.create({ data: {
                name: 'Test To Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
        const loan = yield transferService_1.default.createLoanOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            duration: 4,
            fee: 1000
        });
        expect(loan).toBeDefined();
        expect(loan.playerId).toBe(player.id);
        expect(loan.fromClubId).toBe(fromClub.id);
        expect(loan.toClubId).toBe(toClub.id);
        expect(loan.status).toBe('pending');
    }));
    it('rejects loan if player does not belong to fromClub', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const fromClub = yield prisma.club.create({ data: {
                name: 'Test From Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const toClub = yield prisma.club.create({ data: {
                name: 'Test To Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
        yield expect(transferService_1.default.createLoanOffer({
            fromClubId: toClub.id,
            toClubId: fromClub.id,
            playerId: player.id,
            duration: 4,
            fee: 1000
        })).rejects.toThrow('Player does not belong to the lending club');
    }));
    it('can accept and execute a loan offer', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const fromClub = yield prisma.club.create({ data: {
                name: 'Test From Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const toClub = yield prisma.club.create({ data: {
                name: 'Test To Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
        const loan = yield transferService_1.default.createLoanOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            duration: 4,
            fee: 1000
        });
        const accepted = yield transferService_1.default.respondToLoanOffer(loan.id, 'accepted');
        expect(accepted.status).toBe('active');
        const updatedPlayer = yield prisma.player.findUnique({ where: { id: player.id } });
        expect(updatedPlayer === null || updatedPlayer === void 0 ? void 0 : updatedPlayer.clubId).toBe(toClub.id);
    }));
    it('can recall a player from loan', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const fromClub = yield prisma.club.create({ data: {
                name: 'Test From Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const toClub = yield prisma.club.create({ data: {
                name: 'Test To Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
        let loan = yield transferService_1.default.createLoanOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            duration: 4,
            fee: 1000
        });
        yield transferService_1.default.respondToLoanOffer(loan.id, 'accepted');
        // Recall
        let recalled = yield transferService_1.default.recallPlayer(loan.id);
        expect(recalled.status).toBe('ended');
        let updatedPlayer = yield prisma.player.findUnique({ where: { id: player.id } });
        expect(updatedPlayer === null || updatedPlayer === void 0 ? void 0 : updatedPlayer.clubId).toBe(fromClub.id);
    }));
    it('can create a new loan after recall', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const fromClub = yield prisma.club.create({ data: {
                name: 'Test From Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const toClub = yield prisma.club.create({ data: {
                name: 'Test To Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: { name: 'Test Player', clubId: fromClub.id, skill: 50, age: 20, position: 'MID', nationality: 'NED', wage: 1000, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 70, currentPotential: 50, contractStart: new Date() } });
        // Accept and recall a loan
        let loan = yield transferService_1.default.createLoanOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            duration: 4,
            fee: 1000
        });
        yield transferService_1.default.respondToLoanOffer(loan.id, 'accepted');
        yield transferService_1.default.recallPlayer(loan.id);
        // Ensure player is at fromClub
        let updatedPlayer = yield prisma.player.findUnique({ where: { id: player.id } });
        if ((updatedPlayer === null || updatedPlayer === void 0 ? void 0 : updatedPlayer.clubId) !== fromClub.id) {
            yield prisma.player.update({ where: { id: player.id }, data: { clubId: fromClub.id } });
        }
        // Create a new loan
        loan = yield transferService_1.default.createLoanOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            duration: 4,
            fee: 1000
        });
        expect(loan).toBeDefined();
        expect(loan.playerId).toBe(player.id);
        expect(loan.fromClubId).toBe(fromClub.id);
        expect(loan.toClubId).toBe(toClub.id);
        expect(loan.status).toBe('pending');
    }));
    it('throws error for invalid loanId', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(transferService_1.default.respondToLoanOffer(999999, 'accepted')).rejects.toThrow('Loan offer not found');
    }));
});
describe('TransferService Transfer Logic', () => {
    let fromClub;
    let toClub;
    let league;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43;
        // Robust teardown for all player, club, and league children
        yield ((_b = (_a = prisma.playerTrait) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
        yield ((_d = (_c = prisma.playerInjury) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
        yield ((_f = (_e = prisma.playerAward) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
        yield ((_h = (_g = prisma.playerRequest) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
        yield ((_k = (_j = prisma.playerRelationship) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
        yield ((_m = (_l = prisma.playerPersonalStory) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
        yield ((_p = (_o = prisma.playerHabit) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
        yield ((_r = (_q = prisma.playerMediaEvent) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
        yield ((_t = (_s = prisma.releaseClauses) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
        yield ((_v = (_u = prisma.youthPlayerDevelopmentPlan) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
        yield ((_x = (_w = prisma.playerContractBonus) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
        yield ((_z = (_y = prisma.setPieceSpecialists) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
        yield ((_1 = (_0 = prisma.playerInstructions) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
        yield ((_3 = (_2 = prisma.playerMoraleLog) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
        yield ((_5 = (_4 = prisma.playerMentorship) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
        yield ((_7 = (_6 = prisma.playerCareerGoals) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
        yield ((_9 = (_8 = prisma.playerEndorsements) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
        yield ((_11 = (_10 = prisma.youthNews) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
        yield ((_13 = (_12 = prisma.offFieldEvent) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
        yield ((_15 = (_14 = prisma.pressureHandling) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
        yield ((_17 = (_16 = prisma.leadershipQualities) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
        yield ((_19 = (_18 = prisma.careerAmbitions) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
        yield ((_21 = (_20 = prisma.playerFatigue) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
        yield ((_23 = (_22 = prisma.injuryRisk) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
        yield ((_25 = (_24 = prisma.playerPsychology) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
        yield ((_27 = (_26 = prisma.homesickness) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
        yield ((_29 = (_28 = prisma.startingXISlot) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
        yield ((_31 = (_30 = prisma.liveMatchEvent) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
        yield ((_33 = (_32 = prisma.contractNegotiation) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
        yield ((_35 = (_34 = prisma.loan) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
        yield ((_37 = (_36 = prisma.transfer) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
        // Now delete players, clubs, leagues
        yield ((_39 = (_38 = prisma.player) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
        yield ((_41 = (_40 = prisma.club) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
        yield ((_43 = (_42 = prisma.league) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
        // --- Robust test data creation ---
        league = yield prisma.league.create({ data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        fromClub = yield prisma.club.create({ data: { name: 'Transfer From Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
        toClub = yield prisma.club.create({ data: { name: 'Transfer To Club', leagueId: league.id, homeCity: 'Test City', regionTag: 'Test', boardExpectation: 'Mid', morale: 50, form: 'Good', isJongTeam: false } });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.transfer.deleteMany({});
        yield prisma.player.deleteMany({});
        yield prisma.club.deleteMany({});
        yield prisma.league.deleteMany({});
        yield prisma.$disconnect();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59;
        yield prisma.transfer.deleteMany({});
        yield prisma.player.deleteMany({});
        yield ((_b = (_a = prisma.playerAward) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
        yield ((_d = (_c = prisma.playerCareerStat) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
        yield ((_f = (_e = prisma.clubSeasonStats) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
        yield ((_h = (_g = prisma.playerRequest) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
        yield ((_k = (_j = prisma.contractNegotiation) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
        yield ((_m = (_l = prisma.playerContractBonus) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
        yield ((_p = (_o = prisma.liveMatchEvent) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
        yield ((_r = (_q = prisma.playerMentorship) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
        yield ((_t = (_s = prisma.playerRelationship) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
        yield ((_v = (_u = prisma.startingXISlot) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
        yield ((_x = (_w = prisma.youthPlayerDevelopmentPlan) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
        yield ((_z = (_y = prisma.playerTrait) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
        yield ((_1 = (_0 = prisma.playerInjury) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
        yield ((_3 = (_2 = prisma.playerHabit) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
        yield ((_5 = (_4 = prisma.playerMediaEvent) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
        yield ((_7 = (_6 = prisma.playerMoraleLog) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
        yield ((_9 = (_8 = prisma.playerCareerGoals) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
        yield ((_11 = (_10 = prisma.releaseClauses) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
        yield ((_13 = (_12 = prisma.setPieceSpecialists) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
        yield ((_15 = (_14 = prisma.playerFatigue) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
        yield ((_17 = (_16 = prisma.vARDecisions) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
        yield ((_19 = (_18 = prisma.realTimeTacticalChanges) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
        yield ((_21 = (_20 = prisma.weather) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
        yield ((_23 = (_22 = prisma.pitchConditions) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
        yield ((_25 = (_24 = prisma.injuryRisk) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
        yield ((_27 = (_26 = prisma.playerPsychology) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
        yield ((_29 = (_28 = prisma.homesickness) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
        yield ((_31 = (_30 = prisma.clubLegends) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
        yield ((_33 = (_32 = prisma.playerEndorsements) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
        yield ((_35 = (_34 = prisma.playerInstructions) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
        yield ((_37 = (_36 = prisma.youthPlayerPersonalities) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
        yield ((_39 = (_38 = prisma.graduationEvents) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
        yield ((_41 = (_40 = prisma.socialMedia) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
        yield ((_43 = (_42 = prisma.transferRumors) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
        yield ((_45 = (_44 = prisma.newsItem) === null || _44 === void 0 ? void 0 : _44.deleteMany) === null || _45 === void 0 ? void 0 : _45.call(_44, {}));
        yield ((_47 = (_46 = prisma.managerDecision) === null || _46 === void 0 ? void 0 : _46.deleteMany) === null || _47 === void 0 ? void 0 : _47.call(_46, {}));
        yield ((_49 = (_48 = prisma.offFieldEvent) === null || _48 === void 0 ? void 0 : _48.deleteMany) === null || _49 === void 0 ? void 0 : _49.call(_48, {}));
        yield ((_51 = (_50 = prisma.playerPosition) === null || _50 === void 0 ? void 0 : _50.deleteMany) === null || _51 === void 0 ? void 0 : _51.call(_50, {}));
        yield ((_53 = (_52 = prisma.nFTPlayerCards) === null || _52 === void 0 ? void 0 : _52.deleteMany) === null || _53 === void 0 ? void 0 : _53.call(_52, {}));
        yield ((_55 = (_54 = prisma.scoutingReports) === null || _54 === void 0 ? void 0 : _54.deleteMany) === null || _55 === void 0 ? void 0 : _55.call(_54, {}));
        yield ((_57 = (_56 = prisma.hiddenGems) === null || _56 === void 0 ? void 0 : _56.deleteMany) === null || _57 === void 0 ? void 0 : _57.call(_56, {}));
        yield ((_59 = (_58 = prisma.personalRelationships) === null || _58 === void 0 ? void 0 : _58.deleteMany) === null || _59 === void 0 ? void 0 : _59.call(_58, {}));
    }));
    it('creates a transfer offer successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const player = yield prisma.player.create({ data: { name: 'Transfer Player', clubId: fromClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
        const transfer = yield transferService_1.default.createTransferOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            fee: 50000
        });
        expect(transfer).toBeDefined();
        expect(transfer.playerId).toBe(player.id);
        expect(transfer.fromClubId).toBe(fromClub.id);
        expect(transfer.toClubId).toBe(toClub.id);
        expect(transfer.status).toBe('pending');
    }));
    it('rejects transfer if player does not belong to fromClub', () => __awaiter(void 0, void 0, void 0, function* () {
        const player = yield prisma.player.create({ data: { name: 'Transfer Player', clubId: toClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
        yield expect(transferService_1.default.createTransferOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            fee: 50000
        })).rejects.toThrow('Player does not belong to the selling club');
    }));
    it('can accept and execute a transfer', () => __awaiter(void 0, void 0, void 0, function* () {
        const player = yield prisma.player.create({ data: { name: 'Transfer Player', clubId: fromClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
        const transfer = yield transferService_1.default.createTransferOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            fee: 50000
        });
        const accepted = yield transferService_1.default.respondToTransferOffer(transfer.id, 'accepted', null);
        expect(accepted.status).toBe('completed');
        const updatedPlayer = yield prisma.player.findUnique({ where: { id: player.id } });
        expect(updatedPlayer === null || updatedPlayer === void 0 ? void 0 : updatedPlayer.clubId).toBe(toClub.id);
    }));
    it('throws error for invalid transferId', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(transferService_1.default.respondToTransferOffer(999999, 'accepted', null)).rejects.toThrow('Transfer offer not found');
    }));
    it('throws error for already transferred player', () => __awaiter(void 0, void 0, void 0, function* () {
        const player = yield prisma.player.create({ data: { name: 'Transfer Player', clubId: fromClub.id, skill: 60, age: 22, position: 'DEF', nationality: 'NED', wage: 1200, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), potential: 80, currentPotential: 60, contractStart: new Date() } });
        const transfer = yield transferService_1.default.createTransferOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            fee: 50000
        });
        yield transferService_1.default.respondToTransferOffer(transfer.id, 'accepted', null);
        yield expect(transferService_1.default.createTransferOffer({
            fromClubId: fromClub.id,
            toClubId: toClub.id,
            playerId: player.id,
            fee: 50000
        })).rejects.toThrow();
    }));
    it('throws error for missing/invalid club or player', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(transferService_1.default.createTransferOffer({
            fromClubId: 999999,
            toClubId: toClub.id,
            playerId: 999999,
            fee: 50000
        })).rejects.toThrow();
    }));
});
