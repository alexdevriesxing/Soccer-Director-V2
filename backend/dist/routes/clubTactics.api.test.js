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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104, _105, _106, _107, _108, _109;
    // --- Full teardown for all child records referencing clubId, playerId, leagueId ---
    yield ((_b = (_a = prisma.liveMatchEvent) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
    yield ((_d = (_c = prisma.playerAward) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
    yield ((_f = (_e = prisma.playerCareerStat) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
    yield ((_h = (_g = prisma.playerRequest) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
    yield ((_k = (_j = prisma.contractNegotiation) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
    yield ((_m = (_l = prisma.playerContractBonus) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
    yield ((_p = (_o = prisma.trainingFocus) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
    yield ((_r = (_q = prisma.loan) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
    yield ((_t = (_s = prisma.transfer) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
    yield ((_v = (_u = prisma.transferOffer) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
    yield ((_x = (_w = prisma.clubFormation) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
    yield ((_z = (_y = prisma.clubStrategy) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
    yield ((_1 = (_0 = prisma.clubFinances) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
    yield ((_3 = (_2 = prisma.sponsorship) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
    yield ((_5 = (_4 = prisma.facility) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
    yield ((_7 = (_6 = prisma.staffContract) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
    yield ((_9 = (_8 = prisma.staff) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
    yield ((_11 = (_10 = prisma.gateReceipt) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
    yield ((_13 = (_12 = prisma.mortgage) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
    yield ((_15 = (_14 = prisma.creditFacility) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
    yield ((_17 = (_16 = prisma.shareHolding) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
    yield ((_19 = (_18 = prisma.investorOffer) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
    yield ((_21 = (_20 = prisma.governmentBailout) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
    yield ((_23 = (_22 = prisma.regulatoryWarning) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
    yield ((_25 = (_24 = prisma.bankruptcyEvent) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
    yield ((_27 = (_26 = prisma.squadRegistration) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
    yield ((_29 = (_28 = prisma.clubSeasonStats) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
    yield ((_31 = (_30 = prisma.startingXI) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
    yield ((_33 = (_32 = prisma.managerProfile) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
    yield ((_35 = (_34 = prisma.youthScout) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
    yield ((_37 = (_36 = prisma.youthAcademy) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
    yield ((_39 = (_38 = prisma.academyFacility) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
    yield ((_41 = (_40 = prisma.fanProtests) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
    yield ((_43 = (_42 = prisma.clubLegends) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
    yield ((_45 = (_44 = prisma.internationalScouting) === null || _44 === void 0 ? void 0 : _44.deleteMany) === null || _45 === void 0 ? void 0 : _45.call(_44, {}));
    yield ((_47 = (_46 = prisma.agentRelationships) === null || _46 === void 0 ? void 0 : _46.deleteMany) === null || _47 === void 0 ? void 0 : _47.call(_46, {}));
    yield ((_49 = (_48 = prisma.europeanQualification) === null || _48 === void 0 ? void 0 : _48.deleteMany) === null || _49 === void 0 ? void 0 : _49.call(_48, {}));
    yield ((_51 = (_50 = prisma.scoutingNetwork) === null || _50 === void 0 ? void 0 : _50.deleteMany) === null || _51 === void 0 ? void 0 : _51.call(_50, {}));
    yield ((_53 = (_52 = prisma.youthIntakeEvent) === null || _52 === void 0 ? void 0 : _52.deleteMany) === null || _53 === void 0 ? void 0 : _53.call(_52, {}));
    yield ((_55 = (_54 = prisma.youthCompetitionEntry) === null || _54 === void 0 ? void 0 : _54.deleteMany) === null || _55 === void 0 ? void 0 : _55.call(_54, {}));
    yield ((_57 = (_56 = prisma.tacticalFamiliarity) === null || _56 === void 0 ? void 0 : _56.deleteMany) === null || _57 === void 0 ? void 0 : _57.call(_56, {}));
    yield ((_59 = (_58 = prisma.newsItem) === null || _58 === void 0 ? void 0 : _58.deleteMany) === null || _59 === void 0 ? void 0 : _59.call(_58, {}));
    yield ((_61 = (_60 = prisma.socialMedia) === null || _60 === void 0 ? void 0 : _60.deleteMany) === null || _61 === void 0 ? void 0 : _61.call(_60, {}));
    yield ((_63 = (_62 = prisma.transferRumors) === null || _62 === void 0 ? void 0 : _62.deleteMany) === null || _63 === void 0 ? void 0 : _63.call(_62, {}));
    yield ((_65 = (_64 = prisma.promotionRelegationPlayoffs) === null || _64 === void 0 ? void 0 : _64.deleteMany) === null || _65 === void 0 ? void 0 : _65.call(_64, {}));
    yield ((_67 = (_66 = prisma.cupCompetitions) === null || _66 === void 0 ? void 0 : _66.deleteMany) === null || _67 === void 0 ? void 0 : _67.call(_66, {}));
    yield ((_69 = (_68 = prisma.leagueReputation) === null || _68 === void 0 ? void 0 : _68.deleteMany) === null || _69 === void 0 ? void 0 : _69.call(_68, {}));
    yield ((_71 = (_70 = prisma.seasonHistory) === null || _70 === void 0 ? void 0 : _70.deleteMany) === null || _71 === void 0 ? void 0 : _71.call(_70, {}));
    yield ((_73 = (_72 = prisma.tVRights) === null || _72 === void 0 ? void 0 : _72.deleteMany) === null || _73 === void 0 ? void 0 : _73.call(_72, {}));
    yield ((_75 = (_74 = prisma.fixture) === null || _74 === void 0 ? void 0 : _74.deleteMany) === null || _75 === void 0 ? void 0 : _75.call(_74, {}));
    yield ((_77 = (_76 = prisma.matchEvent) === null || _76 === void 0 ? void 0 : _76.deleteMany) === null || _77 === void 0 ? void 0 : _77.call(_76, {}));
    yield ((_79 = (_78 = prisma.startingXISlot) === null || _78 === void 0 ? void 0 : _78.deleteMany) === null || _79 === void 0 ? void 0 : _79.call(_78, {}));
    yield ((_81 = (_80 = prisma.playerRelationship) === null || _80 === void 0 ? void 0 : _80.deleteMany) === null || _81 === void 0 ? void 0 : _81.call(_80, {}));
    yield ((_83 = (_82 = prisma.playerTrait) === null || _82 === void 0 ? void 0 : _82.deleteMany) === null || _83 === void 0 ? void 0 : _83.call(_82, {}));
    yield ((_85 = (_84 = prisma.playerInjury) === null || _84 === void 0 ? void 0 : _84.deleteMany) === null || _85 === void 0 ? void 0 : _85.call(_84, {}));
    yield ((_87 = (_86 = prisma.playerHabit) === null || _86 === void 0 ? void 0 : _86.deleteMany) === null || _87 === void 0 ? void 0 : _87.call(_86, {}));
    yield ((_89 = (_88 = prisma.playerMediaEvent) === null || _88 === void 0 ? void 0 : _88.deleteMany) === null || _89 === void 0 ? void 0 : _89.call(_88, {}));
    yield ((_91 = (_90 = prisma.releaseClauses) === null || _90 === void 0 ? void 0 : _90.deleteMany) === null || _91 === void 0 ? void 0 : _91.call(_90, {}));
    yield ((_93 = (_92 = prisma.youthPlayerDevelopmentPlan) === null || _92 === void 0 ? void 0 : _92.deleteMany) === null || _93 === void 0 ? void 0 : _93.call(_92, {}));
    yield ((_95 = (_94 = prisma.playerPersonalStory) === null || _94 === void 0 ? void 0 : _94.deleteMany) === null || _95 === void 0 ? void 0 : _95.call(_94, {}));
    yield ((_97 = (_96 = prisma.youthNews) === null || _96 === void 0 ? void 0 : _96.deleteMany) === null || _97 === void 0 ? void 0 : _97.call(_96, {}));
    yield ((_99 = (_98 = prisma.setPieceSpecialists) === null || _98 === void 0 ? void 0 : _98.deleteMany) === null || _99 === void 0 ? void 0 : _99.call(_98, {}));
    yield ((_101 = (_100 = prisma.loan) === null || _100 === void 0 ? void 0 : _100.deleteMany) === null || _101 === void 0 ? void 0 : _101.call(_100, {}));
    yield ((_103 = (_102 = prisma.transfer) === null || _102 === void 0 ? void 0 : _102.deleteMany) === null || _103 === void 0 ? void 0 : _103.call(_102, {}));
    // Now delete players, clubs, leagues
    yield ((_105 = (_104 = prisma.player) === null || _104 === void 0 ? void 0 : _104.deleteMany) === null || _105 === void 0 ? void 0 : _105.call(_104, {}));
    yield ((_107 = (_106 = prisma.club) === null || _106 === void 0 ? void 0 : _106.deleteMany) === null || _107 === void 0 ? void 0 : _107.call(_106, {}));
    yield ((_109 = (_108 = prisma.league) === null || _108 === void 0 ? void 0 : _108.deleteMany) === null || _109 === void 0 ? void 0 : _109.call(_108, {}));
    // --- Robust test data creation ---
    // Always create a new league, club, and player for each test
    testLeague = yield prisma.league.create({
        data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
    });
    testClub = yield prisma.club.create({
        data: { name: 'Test Club', leagueId: testLeague.id, isJongTeam: false }
    });
    testPlayer = yield prisma.player.create({
        data: {
            name: 'Test Player',
            position: 'MF',
            age: 22,
            skill: 80,
            nationality: 'Testland',
            wage: 1000,
            contractExpiry: new Date('2025-06-30T00:00:00.000Z'),
            contractStart: new Date('2024-07-01T00:00:00.000Z'),
            potential: 85,
            currentPotential: 80,
            clubId: testClub.id
        }
    });
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104, _105, _106, _107, _108, _109;
    // --- Full teardown for all child records referencing clubId, playerId, leagueId ---
    yield ((_b = (_a = prisma.liveMatchEvent) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
    yield ((_d = (_c = prisma.playerAward) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
    yield ((_f = (_e = prisma.playerCareerStat) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
    yield ((_h = (_g = prisma.playerRequest) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
    yield ((_k = (_j = prisma.contractNegotiation) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
    yield ((_m = (_l = prisma.playerContractBonus) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
    yield ((_p = (_o = prisma.trainingFocus) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
    yield ((_r = (_q = prisma.loan) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
    yield ((_t = (_s = prisma.transfer) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
    yield ((_v = (_u = prisma.transferOffer) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
    yield ((_x = (_w = prisma.clubFormation) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
    yield ((_z = (_y = prisma.clubStrategy) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
    yield ((_1 = (_0 = prisma.clubFinances) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
    yield ((_3 = (_2 = prisma.sponsorship) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
    yield ((_5 = (_4 = prisma.facility) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
    yield ((_7 = (_6 = prisma.staffContract) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
    yield ((_9 = (_8 = prisma.staff) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
    yield ((_11 = (_10 = prisma.gateReceipt) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
    yield ((_13 = (_12 = prisma.mortgage) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
    yield ((_15 = (_14 = prisma.creditFacility) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
    yield ((_17 = (_16 = prisma.shareHolding) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
    yield ((_19 = (_18 = prisma.investorOffer) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
    yield ((_21 = (_20 = prisma.governmentBailout) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
    yield ((_23 = (_22 = prisma.regulatoryWarning) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
    yield ((_25 = (_24 = prisma.bankruptcyEvent) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
    yield ((_27 = (_26 = prisma.squadRegistration) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
    yield ((_29 = (_28 = prisma.clubSeasonStats) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
    yield ((_31 = (_30 = prisma.startingXI) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
    yield ((_33 = (_32 = prisma.managerProfile) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
    yield ((_35 = (_34 = prisma.youthScout) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
    yield ((_37 = (_36 = prisma.youthAcademy) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
    yield ((_39 = (_38 = prisma.academyFacility) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
    yield ((_41 = (_40 = prisma.fanProtests) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
    yield ((_43 = (_42 = prisma.clubLegends) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
    yield ((_45 = (_44 = prisma.internationalScouting) === null || _44 === void 0 ? void 0 : _44.deleteMany) === null || _45 === void 0 ? void 0 : _45.call(_44, {}));
    yield ((_47 = (_46 = prisma.agentRelationships) === null || _46 === void 0 ? void 0 : _46.deleteMany) === null || _47 === void 0 ? void 0 : _47.call(_46, {}));
    yield ((_49 = (_48 = prisma.europeanQualification) === null || _48 === void 0 ? void 0 : _48.deleteMany) === null || _49 === void 0 ? void 0 : _49.call(_48, {}));
    yield ((_51 = (_50 = prisma.scoutingNetwork) === null || _50 === void 0 ? void 0 : _50.deleteMany) === null || _51 === void 0 ? void 0 : _51.call(_50, {}));
    yield ((_53 = (_52 = prisma.youthIntakeEvent) === null || _52 === void 0 ? void 0 : _52.deleteMany) === null || _53 === void 0 ? void 0 : _53.call(_52, {}));
    yield ((_55 = (_54 = prisma.youthCompetitionEntry) === null || _54 === void 0 ? void 0 : _54.deleteMany) === null || _55 === void 0 ? void 0 : _55.call(_54, {}));
    yield ((_57 = (_56 = prisma.tacticalFamiliarity) === null || _56 === void 0 ? void 0 : _56.deleteMany) === null || _57 === void 0 ? void 0 : _57.call(_56, {}));
    yield ((_59 = (_58 = prisma.newsItem) === null || _58 === void 0 ? void 0 : _58.deleteMany) === null || _59 === void 0 ? void 0 : _59.call(_58, {}));
    yield ((_61 = (_60 = prisma.socialMedia) === null || _60 === void 0 ? void 0 : _60.deleteMany) === null || _61 === void 0 ? void 0 : _61.call(_60, {}));
    yield ((_63 = (_62 = prisma.transferRumors) === null || _62 === void 0 ? void 0 : _62.deleteMany) === null || _63 === void 0 ? void 0 : _63.call(_62, {}));
    yield ((_65 = (_64 = prisma.promotionRelegationPlayoffs) === null || _64 === void 0 ? void 0 : _64.deleteMany) === null || _65 === void 0 ? void 0 : _65.call(_64, {}));
    yield ((_67 = (_66 = prisma.cupCompetitions) === null || _66 === void 0 ? void 0 : _66.deleteMany) === null || _67 === void 0 ? void 0 : _67.call(_66, {}));
    yield ((_69 = (_68 = prisma.leagueReputation) === null || _68 === void 0 ? void 0 : _68.deleteMany) === null || _69 === void 0 ? void 0 : _69.call(_68, {}));
    yield ((_71 = (_70 = prisma.seasonHistory) === null || _70 === void 0 ? void 0 : _70.deleteMany) === null || _71 === void 0 ? void 0 : _71.call(_70, {}));
    yield ((_73 = (_72 = prisma.tVRights) === null || _72 === void 0 ? void 0 : _72.deleteMany) === null || _73 === void 0 ? void 0 : _73.call(_72, {}));
    yield ((_75 = (_74 = prisma.fixture) === null || _74 === void 0 ? void 0 : _74.deleteMany) === null || _75 === void 0 ? void 0 : _75.call(_74, {}));
    yield ((_77 = (_76 = prisma.matchEvent) === null || _76 === void 0 ? void 0 : _76.deleteMany) === null || _77 === void 0 ? void 0 : _77.call(_76, {}));
    yield ((_79 = (_78 = prisma.startingXISlot) === null || _78 === void 0 ? void 0 : _78.deleteMany) === null || _79 === void 0 ? void 0 : _79.call(_78, {}));
    yield ((_81 = (_80 = prisma.playerRelationship) === null || _80 === void 0 ? void 0 : _80.deleteMany) === null || _81 === void 0 ? void 0 : _81.call(_80, {}));
    yield ((_83 = (_82 = prisma.playerTrait) === null || _82 === void 0 ? void 0 : _82.deleteMany) === null || _83 === void 0 ? void 0 : _83.call(_82, {}));
    yield ((_85 = (_84 = prisma.playerInjury) === null || _84 === void 0 ? void 0 : _84.deleteMany) === null || _85 === void 0 ? void 0 : _85.call(_84, {}));
    yield ((_87 = (_86 = prisma.playerHabit) === null || _86 === void 0 ? void 0 : _86.deleteMany) === null || _87 === void 0 ? void 0 : _87.call(_86, {}));
    yield ((_89 = (_88 = prisma.playerMediaEvent) === null || _88 === void 0 ? void 0 : _88.deleteMany) === null || _89 === void 0 ? void 0 : _89.call(_88, {}));
    yield ((_91 = (_90 = prisma.releaseClauses) === null || _90 === void 0 ? void 0 : _90.deleteMany) === null || _91 === void 0 ? void 0 : _91.call(_90, {}));
    yield ((_93 = (_92 = prisma.youthPlayerDevelopmentPlan) === null || _92 === void 0 ? void 0 : _92.deleteMany) === null || _93 === void 0 ? void 0 : _93.call(_92, {}));
    yield ((_95 = (_94 = prisma.playerPersonalStory) === null || _94 === void 0 ? void 0 : _94.deleteMany) === null || _95 === void 0 ? void 0 : _95.call(_94, {}));
    yield ((_97 = (_96 = prisma.youthNews) === null || _96 === void 0 ? void 0 : _96.deleteMany) === null || _97 === void 0 ? void 0 : _97.call(_96, {}));
    yield ((_99 = (_98 = prisma.setPieceSpecialists) === null || _98 === void 0 ? void 0 : _98.deleteMany) === null || _99 === void 0 ? void 0 : _99.call(_98, {}));
    yield ((_101 = (_100 = prisma.loan) === null || _100 === void 0 ? void 0 : _100.deleteMany) === null || _101 === void 0 ? void 0 : _101.call(_100, {}));
    yield ((_103 = (_102 = prisma.transfer) === null || _102 === void 0 ? void 0 : _102.deleteMany) === null || _103 === void 0 ? void 0 : _103.call(_102, {}));
    // Now delete players, clubs, leagues
    yield ((_105 = (_104 = prisma.player) === null || _104 === void 0 ? void 0 : _104.deleteMany) === null || _105 === void 0 ? void 0 : _105.call(_104, {}));
    yield ((_107 = (_106 = prisma.club) === null || _106 === void 0 ? void 0 : _106.deleteMany) === null || _107 === void 0 ? void 0 : _107.call(_106, {}));
    yield ((_109 = (_108 = prisma.league) === null || _108 === void 0 ? void 0 : _108.deleteMany) === null || _109 === void 0 ? void 0 : _109.call(_108, {}));
}));
describe('Club Tactics & Set Piece Specialists API', () => {
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () { yield prisma.$disconnect(); }));
    it('creates, fetches, updates, and deletes a set piece specialist (happy path)', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create
        let res = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/clubs/${testClub.id}/set-piece-specialist`)
            .send({ playerId: testPlayer.id, type: 'FreeKick', skill: 85 });
        expect(res.status).toBe(201);
        expect(res.body.specialist).toBeDefined();
        const specialistId = res.body.specialist.id;
        // Fetch
        res = yield (0, supertest_1.default)(app_1.default).get(`/api/clubs/${testClub.id}/set-piece-specialists`);
        expect(res.status).toBe(200);
        expect(res.body.specialists.length).toBe(1);
        // Update
        res = yield (0, supertest_1.default)(app_1.default).patch(`/api/clubs/set-piece-specialist/${specialistId}`).send({ skill: 90 });
        expect(res.status).toBe(200);
        expect(res.body.specialist.skill).toBe(90);
        // Delete
        res = yield (0, supertest_1.default)(app_1.default).delete(`/api/clubs/set-piece-specialist/${specialistId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    }));
    it('returns 400 if player does not belong to club', () => __awaiter(void 0, void 0, void 0, function* () {
        const otherClub = yield prisma.club.create({ data: { name: 'Other Club', leagueId: testLeague.id, homeCity: 'Other City', regionTag: 'Other', boardExpectation: 'Low', morale: 40, form: 'Bad', isJongTeam: false } });
        const otherPlayer = yield prisma.player.create({ data: { name: 'Other Player', clubId: otherClub.id, position: 'DEF', skill: 70, age: 22, wage: 800, contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), contractStart: new Date(), nationality: 'NED', potential: 80, currentPotential: 70 } });
        const res = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/clubs/${testClub.id}/set-piece-specialist`)
            .send({ playerId: otherPlayer.id, type: 'FreeKick', skill: 75 });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/does not belong/);
    }));
    it('returns 409 for duplicate specialist for same player/type', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.default).post(`/api/clubs/${testClub.id}/set-piece-specialist`).send({ playerId: testPlayer.id, type: 'FreeKick', skill: 85 });
        const res = yield (0, supertest_1.default)(app_1.default).post(`/api/clubs/${testClub.id}/set-piece-specialist`).send({ playerId: testPlayer.id, type: 'FreeKick', skill: 90 });
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already exists/);
    }));
    it('returns 404 for updating/deleting non-existent specialist', () => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield (0, supertest_1.default)(app_1.default).patch(`/api/clubs/set-piece-specialist/999999`).send({ skill: 80 });
        expect(res.status).toBe(404);
        res = yield (0, supertest_1.default)(app_1.default).delete(`/api/clubs/set-piece-specialist/999999`);
        expect(res.status).toBe(404);
    }));
    it('returns 400 for missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield (0, supertest_1.default)(app_1.default).post(`/api/clubs/${testClub.id}/set-piece-specialist`).send({ type: 'FreeKick', skill: 85 });
        expect(res.status).toBe(400);
        res = yield (0, supertest_1.default)(app_1.default).patch(`/api/clubs/set-piece-specialist/1`).send({});
        expect(res.status).toBe(400);
    }));
    it('fetches and updates tactics (happy path)', () => __awaiter(void 0, void 0, void 0, function* () {
        // Update tactics
        let res = yield (0, supertest_1.default)(app_1.default).patch(`/api/clubs/${testClub.id}/tactics`).send({ formation: '4-3-3', style: 'attacking', intensity: 80, width: 60, tempo: 70, approach: 'possession', defensiveStyle: 'high_line', attackingStyle: 'build_up', setPieces: 'short', marking: 'zonal' });
        expect(res.status).toBe(200);
        expect(res.body.formation).toBeDefined();
        expect(res.body.strategy).toBeDefined();
        // Fetch tactics
        res = yield (0, supertest_1.default)(app_1.default).get(`/api/clubs/${testClub.id}/tactics`);
        expect(res.status).toBe(200);
        expect(res.body.formation).toBeDefined();
        expect(res.body.strategy).toBeDefined();
    }));
});
