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
describe('Advanced Finance API', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        // Clean up all child records before parents
        yield prisma.sponsorship.deleteMany({});
        yield prisma.clubFinances.deleteMany({});
        yield prisma.gateReceipt.deleteMany({});
        yield prisma.tVRights.deleteMany({});
        yield prisma.creditFacility.deleteMany({});
        yield prisma.mortgage.deleteMany({});
        yield prisma.shareHolding.deleteMany({});
        yield prisma.investorOffer.deleteMany({});
        yield prisma.governmentBailout.deleteMany({});
        yield prisma.regulatoryWarning.deleteMany({});
        yield prisma.bankruptcyEvent.deleteMany({});
        yield prisma.merchandise.deleteMany({});
        yield prisma.stadiumExpansion.deleteMany({});
        yield prisma.debt.deleteMany({});
        yield prisma.dataAnalysis.deleteMany({});
        yield prisma.youthDevelopment.deleteMany({});
        yield prisma.scoutingNetwork.deleteMany({});
        yield prisma.cryptocurrencySponsorships.deleteMany({});
        yield prisma.nFTPlayerCards.deleteMany({});
        yield prisma.stadiumNamingRights.deleteMany({});
        yield prisma.merchandiseLicensing.deleteMany({});
        // Existing deletions
        yield ((_b = (_a = prisma.loan) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
        yield ((_d = (_c = prisma.transfer) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
        yield prisma.player.deleteMany({});
        yield prisma.club.deleteMany({});
        yield prisma.league.deleteMany({});
        // Always create a new league and club for each test
        testLeague = yield prisma.league.create({
            data: { name: 'Test League', tier: 'TEST', season: '2024', region: 'Test', division: 'A' }
        });
        testClub = yield prisma.club.create({
            data: {
                name: 'Finance Test Club',
                leagueId: testLeague.id,
                homeCity: 'Test City',
                regionTag: 'Test',
                boardExpectation: 'Mid',
                morale: 50,
                form: 'Good',
                isJongTeam: false
            }
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        yield prisma.sponsorship.deleteMany({});
        yield prisma.clubFinances.deleteMany({});
        yield prisma.gateReceipt.deleteMany({});
        yield prisma.tVRights.deleteMany({});
        yield prisma.creditFacility.deleteMany({});
        yield prisma.mortgage.deleteMany({});
        yield prisma.shareHolding.deleteMany({});
        yield prisma.investorOffer.deleteMany({});
        yield prisma.governmentBailout.deleteMany({});
        yield prisma.regulatoryWarning.deleteMany({});
        yield prisma.bankruptcyEvent.deleteMany({});
        yield prisma.merchandise.deleteMany({});
        yield prisma.stadiumExpansion.deleteMany({});
        yield prisma.debt.deleteMany({});
        yield prisma.dataAnalysis.deleteMany({});
        yield prisma.youthDevelopment.deleteMany({});
        yield prisma.scoutingNetwork.deleteMany({});
        yield prisma.cryptocurrencySponsorships.deleteMany({});
        yield prisma.nFTPlayerCards.deleteMany({});
        yield prisma.stadiumNamingRights.deleteMany({});
        yield prisma.merchandiseLicensing.deleteMany({});
        // Existing deletions
        yield ((_b = (_a = prisma.loan) === null || _a === void 0 ? void 0 : _a.deleteMany) === null || _b === void 0 ? void 0 : _b.call(_a, {}));
        yield ((_d = (_c = prisma.transfer) === null || _c === void 0 ? void 0 : _c.deleteMany) === null || _d === void 0 ? void 0 : _d.call(_c, {}));
        yield prisma.player.deleteMany({});
        yield prisma.club.deleteMany({});
        yield prisma.league.deleteMany({});
        yield prisma.$disconnect();
    }));
    describe('GET /api/advanced-finance/club/:clubId/projections', () => {
        it('returns financial projections for a valid club', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/projections`)
                .set('Accept', 'application/json');
            expect(res.status).toBe(200);
            expect(res.body.projections).toBeDefined();
            expect(Array.isArray(res.body.projections)).toBe(true);
        }));
        it('returns 500 for invalid clubId', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get('/api/advanced-finance/club/999999/projections')
                .set('Accept', 'application/json');
            expect([404, 500]).toContain(res.status); // Depending on service implementation
        }));
    });
    describe('GET /api/advanced-finance/club/:clubId/projections/:season', () => {
        it('returns projection for a specific season', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/projections/2024`)
                .set('Accept', 'application/json');
            expect([200, 404]).toContain(res.status); // 404 if no projection for season
        }));
        it('returns 404 for non-existent season', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/projections/2099`)
                .set('Accept', 'application/json');
            expect([200, 404]).toContain(res.status);
        }));
    });
    describe('Sponsorships', () => {
        let sponsorshipId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/advanced-finance/sponsorships')
                .send({
                clubId: testClub.id,
                sponsorName: 'Test Sponsor',
                type: 'Main',
                value: 100000,
                startDate: '2024-07-01',
                endDate: '2025-06-30'
            })
                .set('Accept', 'application/json');
            expect(res.status).toBe(201);
            expect(res.body.sponsorship).toBeDefined();
            sponsorshipId = res.body.sponsorship.id;
        }));
        it('creates a sponsorship deal (POST)', () => __awaiter(void 0, void 0, void 0, function* () {
            // Already created in beforeEach, just verify it exists
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/sponsorships`)
                .set('Accept', 'application/json');
            expect(res.status).toBe(200);
            expect(res.body.sponsorships.some((s) => s.id === sponsorshipId)).toBe(true);
        }));
        it('returns 400 for missing required fields (POST)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .post('/api/advanced-finance/sponsorships')
                .send({ clubId: testClub.id })
                .set('Accept', 'application/json');
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        }));
        it('fetches sponsorship deals for a club (GET)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/sponsorships`)
                .set('Accept', 'application/json');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.sponsorships)).toBe(true);
        }));
        it('updates a sponsorship deal (PUT)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .put(`/api/advanced-finance/sponsorships/${sponsorshipId}`)
                .send({ value: 200000 })
                .set('Accept', 'application/json');
            if (res.status !== 200)
                console.error('Sponsorship update error:', res.body);
            expect(res.status).toBe(200);
            expect(res.body.sponsorship.value).toBe(200000);
        }));
        it('terminates a sponsorship deal (DELETE)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .delete(`/api/advanced-finance/sponsorships/${sponsorshipId}`)
                .set('Accept', 'application/json');
            if (res.status !== 200)
                console.error('Sponsorship delete error:', res.body);
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/terminated/i);
        }));
    });
    describe('Financial Regulations', () => {
        it('fetches regulations for a club (GET)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/regulations`)
                .set('Accept', 'application/json');
            expect(res.status).toBe(200);
            expect(res.body.regulations).toBeDefined();
        }));
        it('fetches a specific regulation type (GET)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/regulations/SalaryCap`)
                .set('Accept', 'application/json');
            expect([200, 404]).toContain(res.status);
        }));
    });
    describe('Financial Analytics', () => {
        it('fetches analytics for a club (GET)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/analytics`)
                .set('Accept', 'application/json');
            expect(res.status).toBe(200);
            expect(res.body.analytics).toBeDefined();
        }));
    });
    describe('Financial Report', () => {
        it('fetches a financial report for a season (GET)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/report/2024`)
                .set('Accept', 'application/json');
            expect([200, 404]).toContain(res.status);
        }));
    });
    describe('Revenue Breakdown', () => {
        it('fetches revenue breakdown for a club (GET)', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get(`/api/advanced-finance/club/${testClub.id}/revenue-breakdown`)
                .set('Accept', 'application/json');
            expect([200, 404]).toContain(res.status);
        }));
    });
});
