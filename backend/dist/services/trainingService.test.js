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
const trainingService_1 = __importDefault(require("./trainingService"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('TrainingService', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47;
        // Full teardown order to avoid FK constraint errors
        yield ((_b = (_a = prisma.playerAward) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
        yield ((_d = (_c = prisma.playerCareerStat) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
        yield ((_f = (_e = prisma.clubSeasonStats) === null || _e === void 0 ? void 0 : _e.deleteMany) === null || _f === void 0 ? void 0 : _f.call(_e, {}));
        yield ((_h = (_g = prisma.playerRequest) === null || _g === void 0 ? void 0 : _g.deleteMany) === null || _h === void 0 ? void 0 : _h.call(_g, {}));
        yield ((_k = (_j = prisma.contractNegotiation) === null || _j === void 0 ? void 0 : _j.deleteMany) === null || _k === void 0 ? void 0 : _k.call(_j, {}));
        yield ((_m = (_l = prisma.playerContractBonus) === null || _l === void 0 ? void 0 : _l.deleteMany) === null || _m === void 0 ? void 0 : _m.call(_l, {}));
        yield ((_p = (_o = prisma.liveMatchEvent) === null || _o === void 0 ? void 0 : _o.deleteMany) === null || _p === void 0 ? void 0 : _p.call(_o, {}));
        yield ((_r = (_q = prisma.internationalMatchEvent) === null || _q === void 0 ? void 0 : _q.deleteMany) === null || _r === void 0 ? void 0 : _r.call(_q, {}));
        yield ((_t = (_s = prisma.internationalMatch) === null || _s === void 0 ? void 0 : _s.deleteMany) === null || _t === void 0 ? void 0 : _t.call(_s, {}));
        yield ((_v = (_u = prisma.internationalPlayer) === null || _u === void 0 ? void 0 : _u.deleteMany) === null || _v === void 0 ? void 0 : _v.call(_u, {}));
        yield ((_x = (_w = prisma.internationalManager) === null || _w === void 0 ? void 0 : _w.deleteMany) === null || _x === void 0 ? void 0 : _x.call(_w, {}));
        yield ((_z = (_y = prisma.competitionStage) === null || _y === void 0 ? void 0 : _y.deleteMany) === null || _z === void 0 ? void 0 : _z.call(_y, {}));
        yield ((_1 = (_0 = prisma.internationalCompetition) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
        yield ((_3 = (_2 = prisma.nationalTeam) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
        yield ((_5 = (_4 = prisma.gateReceipt) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
        yield ((_7 = (_6 = prisma.sponsorship) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
        yield ((_9 = (_8 = prisma.facility) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
        yield ((_11 = (_10 = prisma.staffContract) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
        yield ((_13 = (_12 = prisma.clubFinances) === null || _12 === void 0 ? void 0 : _12.deleteMany) === null || _13 === void 0 ? void 0 : _13.call(_12, {}));
        yield ((_15 = (_14 = prisma.tVRights) === null || _14 === void 0 ? void 0 : _14.deleteMany) === null || _15 === void 0 ? void 0 : _15.call(_14, {}));
        yield ((_17 = (_16 = prisma.trainingFocus) === null || _16 === void 0 ? void 0 : _16.deleteMany) === null || _17 === void 0 ? void 0 : _17.call(_16, {}));
        yield ((_19 = (_18 = prisma.staff) === null || _18 === void 0 ? void 0 : _18.deleteMany) === null || _19 === void 0 ? void 0 : _19.call(_18, {}));
        yield ((_21 = (_20 = prisma.loan) === null || _20 === void 0 ? void 0 : _20.deleteMany) === null || _21 === void 0 ? void 0 : _21.call(_20, {}));
        yield ((_23 = (_22 = prisma.matchEvent) === null || _22 === void 0 ? void 0 : _22.deleteMany) === null || _23 === void 0 ? void 0 : _23.call(_22, {}));
        yield ((_25 = (_24 = prisma.fixture) === null || _24 === void 0 ? void 0 : _24.deleteMany) === null || _25 === void 0 ? void 0 : _25.call(_24, {}));
        yield ((_27 = (_26 = prisma.player) === null || _26 === void 0 ? void 0 : _26.deleteMany) === null || _27 === void 0 ? void 0 : _27.call(_26, {}));
        yield ((_29 = (_28 = prisma.clubFormation) === null || _28 === void 0 ? void 0 : _28.deleteMany) === null || _29 === void 0 ? void 0 : _29.call(_28, {}));
        yield ((_31 = (_30 = prisma.clubStrategy) === null || _30 === void 0 ? void 0 : _30.deleteMany) === null || _31 === void 0 ? void 0 : _31.call(_30, {}));
        yield ((_33 = (_32 = prisma.transfer) === null || _32 === void 0 ? void 0 : _32.deleteMany) === null || _33 === void 0 ? void 0 : _33.call(_32, {}));
        yield ((_35 = (_34 = prisma.club) === null || _34 === void 0 ? void 0 : _34.deleteMany) === null || _35 === void 0 ? void 0 : _35.call(_34, {}));
        yield ((_37 = (_36 = prisma.league) === null || _36 === void 0 ? void 0 : _36.deleteMany) === null || _37 === void 0 ? void 0 : _37.call(_36, {}));
        yield ((_39 = (_38 = prisma.playerFatigue) === null || _38 === void 0 ? void 0 : _38.deleteMany) === null || _39 === void 0 ? void 0 : _39.call(_38, {}));
        yield ((_41 = (_40 = prisma.vARDecisions) === null || _40 === void 0 ? void 0 : _40.deleteMany) === null || _41 === void 0 ? void 0 : _41.call(_40, {}));
        yield ((_43 = (_42 = prisma.realTimeTacticalChanges) === null || _42 === void 0 ? void 0 : _42.deleteMany) === null || _43 === void 0 ? void 0 : _43.call(_42, {}));
        yield ((_45 = (_44 = prisma.weather) === null || _44 === void 0 ? void 0 : _44.deleteMany) === null || _45 === void 0 ? void 0 : _45.call(_44, {}));
        yield ((_47 = (_46 = prisma.pitchConditions) === null || _46 === void 0 ? void 0 : _46.deleteMany) === null || _47 === void 0 ? void 0 : _47.call(_46, {}));
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
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
        yield ((_1 = (_0 = prisma.loan) === null || _0 === void 0 ? void 0 : _0.deleteMany) === null || _1 === void 0 ? void 0 : _1.call(_0, {}));
        yield ((_3 = (_2 = prisma.transfer) === null || _2 === void 0 ? void 0 : _2.deleteMany) === null || _3 === void 0 ? void 0 : _3.call(_2, {}));
        yield prisma.player.deleteMany({});
        yield ((_5 = (_4 = prisma.gateReceipt) === null || _4 === void 0 ? void 0 : _4.deleteMany) === null || _5 === void 0 ? void 0 : _5.call(_4, {}));
        yield ((_7 = (_6 = prisma.clubSeasonStats) === null || _6 === void 0 ? void 0 : _6.deleteMany) === null || _7 === void 0 ? void 0 : _7.call(_6, {}));
        yield ((_9 = (_8 = prisma.matchEvent) === null || _8 === void 0 ? void 0 : _8.deleteMany) === null || _9 === void 0 ? void 0 : _9.call(_8, {}));
        yield ((_11 = (_10 = prisma.liveMatchEvent) === null || _10 === void 0 ? void 0 : _10.deleteMany) === null || _11 === void 0 ? void 0 : _11.call(_10, {}));
        yield prisma.club.deleteMany({});
        yield prisma.league.deleteMany({});
        yield prisma.$disconnect();
    }));
    it('sets training focus for a player', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const club = yield prisma.club.create({ data: {
                name: 'Training Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: {
                name: 'Test Player',
                clubId: club.id,
                position: 'DEF',
                skill: 60,
                age: 22,
                wage: 1000,
                contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                contractStart: new Date(),
                nationality: 'NED',
                potential: 80,
                currentPotential: 60
            } });
        const focus = yield trainingService_1.default.setTrainingFocus({
            playerId: player.id,
            clubId: club.id,
            focus: 'technical',
            isExtra: false,
            startDate: new Date()
        });
        expect(focus).toBeDefined();
        expect(focus.playerId).toBe(player.id);
        expect(focus.clubId).toBe(club.id);
        expect(focus.focus).toBe('technical');
        expect(focus.isExtra).toBe(false);
    }));
    it('prevents duplicate training focus for the same type', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const club = yield prisma.club.create({ data: {
                name: 'Training Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: {
                name: 'Test Player',
                clubId: club.id,
                position: 'DEF',
                skill: 60,
                age: 22,
                wage: 1000,
                contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                contractStart: new Date(),
                nationality: 'NED',
                potential: 80,
                currentPotential: 60
            } });
        yield trainingService_1.default.setTrainingFocus({
            playerId: player.id,
            clubId: club.id,
            focus: 'technical',
            isExtra: false,
            startDate: new Date()
        });
        // Try to set again (should update or throw, depending on logic)
        const focus = yield trainingService_1.default.setTrainingFocus({
            playerId: player.id,
            clubId: club.id,
            focus: 'tactical',
            isExtra: false,
            startDate: new Date()
        });
        expect(focus).toBeDefined();
        expect(focus.focus).toBe('tactical');
    }));
    it('sets extra training focus for a player', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const club = yield prisma.club.create({ data: {
                name: 'Training Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: {
                name: 'Test Player',
                clubId: club.id,
                position: 'DEF',
                skill: 60,
                age: 22,
                wage: 1000,
                contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                contractStart: new Date(),
                nationality: 'NED',
                potential: 80,
                currentPotential: 60
            } });
        const focus = yield trainingService_1.default.setTrainingFocus({
            playerId: player.id,
            clubId: club.id,
            focus: 'physical',
            isExtra: true,
            startDate: new Date()
        });
        expect(focus).toBeDefined();
        expect(focus.isExtra).toBe(true);
    }));
    it('prevents duplicate extra training focus', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const club = yield prisma.club.create({ data: {
                name: 'Training Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        const player = yield prisma.player.create({ data: {
                name: 'Test Player',
                clubId: club.id,
                position: 'DEF',
                skill: 60,
                age: 22,
                wage: 1000,
                contractExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                contractStart: new Date(),
                nationality: 'NED',
                potential: 80,
                currentPotential: 60
            } });
        yield trainingService_1.default.setTrainingFocus({
            playerId: player.id,
            clubId: club.id,
            focus: 'physical',
            isExtra: true,
            startDate: new Date()
        });
        yield expect(trainingService_1.default.setTrainingFocus({
            playerId: player.id,
            clubId: club.id,
            focus: 'tactical',
            isExtra: true,
            startDate: new Date()
        })).rejects.toThrow();
    }));
    it('returns error for invalid player', () => __awaiter(void 0, void 0, void 0, function* () {
        const league = yield prisma.league.create({ data: { name: 'Training League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' } });
        const club = yield prisma.club.create({ data: {
                name: 'Training Club',
                leagueId: league.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            } });
        yield expect(trainingService_1.default.setTrainingFocus({
            playerId: 999999,
            clubId: club.id,
            focus: 'technical',
            isExtra: false,
            startDate: new Date()
        })).rejects.toThrow();
    }));
});
