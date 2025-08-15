"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var eredivisie, eersteDivisie, tweedeDivisie, derdeDivisie, vierdeDivisie, zaterdagRegions, zondagRegions, amateurDivisions, zaterdagLeagues, zondagLeagues, _i, zaterdagRegions_1, region, _a, amateurDivisions_1, division, league, vijfdeKlasseGroups, _b, vijfdeKlasseGroups_1, group, league, _c, zondagRegions_1, region, _d, amateurDivisions_2, division, league, zondagOostSpecialLeagues, _e, zondagOostSpecialLeagues_1, leagueData, league, zondagNoordSpecialLeagues, _f, zondagNoordSpecialLeagues_1, leagueData, league, zondagNoordVijfdeKlasseGroups, _g, zondagNoordVijfdeKlasseGroups_1, group, league, zondagOostVijfdeKlasseGroups, _h, zondagOostVijfdeKlasseGroups_1, group, league, zondagWest1VijfdeKlasseGroups, _j, zondagWest1VijfdeKlasseGroups_1, group, league, zondagWest2VijfdeKlasseGroups, _k, zondagWest2VijfdeKlasseGroups_1, group, league, zondagZuid1VijfdeKlasseGroups, _l, zondagZuid1VijfdeKlasseGroups_1, group, league, zondagZuid2VijfdeKlasseGroups, _m, zondagZuid2VijfdeKlasseGroups_1, group, league, eredivisieClubs, _o, eredivisieClubs_1, clubData, zondagNoordLeagues, eersteKlasseH_Zondag, eersteKlasseHClubs_Zondag, _p, eersteKlasseHClubs_Zondag_1, clubData, zondagOostLeagues, eersteKlasseD_Zondag, eersteKlasseDClubs, _q, eersteKlasseDClubs_1, clubData, tweedeKlasseH_Zondag, tweedeKlasseHClubs_Oost, _r, tweedeKlasseHClubs_Oost_1, clubData, tweedeKlasseI_Zondag, tweedeKlasseIClubs, _s, tweedeKlasseIClubs_1, clubData, derdeKlasseA_Zondag, derdeKlasseAClubs_Oost, _t, derdeKlasseAClubs_Oost_1, clubData, derdeKlasseB_Zondag, derdeKlasseBClubs_Oost, _u, derdeKlasseBClubs_Oost_1, clubData, derdeKlasseC_Zondag, derdeKlasseCClubs_Oost, _v, derdeKlasseCClubs_Oost_1, clubData, derdeKlasseD_Zondag, derdeKlasseDClubs_Oost, _w, derdeKlasseDClubs_Oost_1, clubData, vierdeKlasseA_Zondag_Oost, vierdeKlasseAClubs_Oost, _x, vierdeKlasseAClubs_Oost_1, clubData, vierdeKlasseB_Zondag_Oost, vierdeKlasseBClubs_Oost, _y, vierdeKlasseBClubs_Oost_1, clubData, vierdeKlasseC_Zondag_Oost, vierdeKlasseCClubs_Oost, _z, vierdeKlasseCClubs_Oost_1, clubData, vierdeKlasseD_Zondag_Oost, vierdeKlasseDClubs_Oost, _0, vierdeKlasseDClubs_Oost_1, clubData, vierdeKlasseE_Zondag_Oost, vierdeKlasseEClubs_Oost, _1, vierdeKlasseEClubs_Oost_1, clubData, vierdeKlasseF_Zondag_Oost, vierdeKlasseFClubs_Oost, _2, vierdeKlasseFClubs_Oost_1, clubData, vierdeKlasseG_Zondag_Oost, vierdeKlasseGClubs_Oost, _3, vierdeKlasseGClubs_Oost_1, clubData, vijfdeKlasseA_Zondag_Oost, vijfdeKlasseAClubs_Oost, _4, vijfdeKlasseAClubs_Oost_1, clubData, vijfdeKlasseB_Zondag_Oost, vijfdeKlasseBClubs_Oost, _5, vijfdeKlasseBClubs_Oost_1, clubData, vijfdeKlasseC_Zondag_Oost, vijfdeKlasseCClubs_Oost, _6, vijfdeKlasseCClubs_Oost_1, clubData, vijfdeKlasseD_Zondag_Oost, vijfdeKlasseDClubs_Oost, _7, vijfdeKlasseDClubs_Oost_1, clubData, vijfdeKlasseE_Zondag_Oost, vijfdeKlasseEClubs_Oost, _8, vijfdeKlasseEClubs_Oost_1, clubData, zondagWestLeagues, eersteKlasseA_Zondag, eersteKlasseAClubs_West, _9, eersteKlasseAClubs_West_1, clubData, zondagZuid1Leagues, eersteKlasseE_ZondagZuid1, eersteKlasseEClubs_Zuid1, _10, eersteKlasseEClubs_Zuid1_1, clubData, tweedeKlasseC_ZondagZuid1, tweedeKlasseCClubs_Zuid1, _11, tweedeKlasseCClubs_Zuid1_1, clubData, tweedeKlasseD_ZondagZuid1, tweedeKlasseDClubs_Zuid1, _12, tweedeKlasseDClubs_Zuid1_1, clubData, derdeKlasseA_ZondagZuid1, derdeKlasseAClubs_Zuid1, _13, derdeKlasseAClubs_Zuid1_1, clubData, derdeKlasseB_ZondagZuid1, derdeKlasseBClubs_Zuid1, _14, derdeKlasseBClubs_Zuid1_1, clubData, derdeKlasseC_ZondagZuid1, derdeKlasseCClubs_Zuid1, _15, derdeKlasseCClubs_Zuid1_1, clubData, derdeKlasseD_ZondagZuid1, derdeKlasseDClubs_Zuid1, _16, derdeKlasseDClubs_Zuid1_1, clubData, vierdeKlasseA_ZondagZuid1, vierdeKlasseAClubs_Zuid1, _17, vierdeKlasseAClubs_Zuid1_1, clubData, vierdeKlasseB_ZondagZuid1, vierdeKlasseBClubs_Zuid1, _18, vierdeKlasseBClubs_Zuid1_1, clubData, vierdeKlasseC_ZondagZuid1, vierdeKlasseCClubs_Zuid1, _19, vierdeKlasseCClubs_Zuid1_1, clubData, vierdeKlasseD_ZondagZuid1, vierdeKlasseDClubs_Zuid1, _20, vierdeKlasseDClubs_Zuid1_1, clubData, vierdeKlasseE_ZondagZuid1, vierdeKlasseEClubs_Zuid1, _21, vierdeKlasseEClubs_Zuid1_1, clubData, vijfdeKlasseA_ZondagZuid1, vijfdeKlasseAClubs_Zuid1, _22, vijfdeKlasseAClubs_Zuid1_1, clubData, vijfdeKlasseB_ZondagZuid1, vijfdeKlasseBClubs_Zuid1, _23, vijfdeKlasseBClubs_Zuid1_1, clubData, vijfdeKlasseC_ZondagZuid1, vijfdeKlasseCClubs_Zuid1, _24, vijfdeKlasseCClubs_Zuid1_1, clubData, vijfdeKlasseD_ZondagZuid1, vijfdeKlasseDClubs_Zuid1, _25, vijfdeKlasseDClubs_Zuid1_1, clubData, vijfdeKlasseE_ZondagZuid1, vijfdeKlasseEClubs_Zuid1, _26, vijfdeKlasseEClubs_Zuid1_1, clubData, zondagZuid2Leagues, eersteKlasseE_ZondagZuid2, eersteKlasseEClubs_Zuid2, _27, eersteKlasseEClubs_Zuid2_1, clubData, tweedeKlasseD_ZondagZuid2, tweedeKlasseDClubs_Zuid2, _28, tweedeKlasseDClubs_Zuid2_1, clubData, tweedeKlasseE_ZondagZuid2, tweedeKlasseEClubs_Zuid2, _29, tweedeKlasseEClubs_Zuid2_1, clubData, derdeKlasseG_ZondagZuid2, derdeKlasseGClubs_Zuid2, _30, derdeKlasseGClubs_Zuid2_1, clubData, derdeKlasseH_ZondagZuid2, derdeKlasseHClubs_Zuid2, _31, derdeKlasseHClubs_Zuid2_1, clubData, derdeKlasseI_ZondagZuid2, derdeKlasseIClubs_Zuid2, _32, derdeKlasseIClubs_Zuid2_1, clubData, derdeKlasseJ_ZondagZuid2, derdeKlasseJClubs_Zuid2, _33, derdeKlasseJClubs_Zuid2_1, clubData, vierdeKlasseA_ZondagZuid2, vierdeKlasseAClubs_Zuid2, _34, vierdeKlasseAClubs_Zuid2_1, clubData, vierdeKlasseB_ZondagZuid2, vierdeKlasseBClubs_Zuid2, _35, vierdeKlasseBClubs_Zuid2_1, clubData, vierdeKlasseC_ZondagZuid2, vierdeKlasseCClubs_Zuid2, _36, vierdeKlasseCClubs_Zuid2_1, clubData, vierdeKlasseD_ZondagZuid2, vierdeKlasseDClubs_Zuid2, _37, vierdeKlasseDClubs_Zuid2_1, clubData, vierdeKlasseE_ZondagZuid2, vierdeKlasseEClubs_Zuid2, _38, vierdeKlasseEClubs_Zuid2_1, clubData, vierdeKlasseF_ZondagZuid2, vierdeKlasseFClubs_Zuid2, _39, vierdeKlasseFClubs_Zuid2_1, clubData, vierdeKlasseG_ZondagZuid2, vierdeKlasseGClubs_Zuid2, _40, vierdeKlasseGClubs_Zuid2_1, clubData, vierdeKlasseH_ZondagZuid2, vierdeKlasseHClubs_Zuid2, _41, vierdeKlasseHClubs_Zuid2_1, clubData, vierdeKlasseI_ZondagZuid2, vierdeKlasseIClubs_Zuid2, _42, vierdeKlasseIClubs_Zuid2_1, clubData, vijfdeKlasseA_ZondagZuid2, vijfdeKlasseAClubs_Zuid2, _43, vijfdeKlasseAClubs_Zuid2_1, clubData, vijfdeKlasseB_ZondagZuid2, vijfdeKlasseBClubs_Zuid2, _44, vijfdeKlasseBClubs_Zuid2_1, clubData, vijfdeKlasseC_ZondagZuid2, vijfdeKlasseCClubs_Zuid2, _45, vijfdeKlasseCClubs_Zuid2_1, clubData, vijfdeKlasseD_ZondagZuid2, vijfdeKlasseDClubs_Zuid2, _46, vijfdeKlasseDClubs_Zuid2_1, clubData, vijfdeKlasseE_ZondagZuid2, vijfdeKlasseEClubs_Zuid2, _47, vijfdeKlasseEClubs_Zuid2_1, clubData, vijfdeKlasseF_ZondagZuid2, vijfdeKlasseFClubs_Zuid2, _48, vijfdeKlasseFClubs_Zuid2_1, clubData, vijfdeKlasseG_ZondagZuid2, vijfdeKlasseGClubs_Zuid2, _49, vijfdeKlasseGClubs_Zuid2_1, clubData, allClubs, _50, allClubs_1, club, playerCount, positions, nationalities, i, position, nationality, age, skill, wage, firstName, lastName, dutchFirstNames, dutchLastNames, germanFirstNames, germanLastNames, englishFirstNames, englishLastNames, genericFirstNames, genericLastNames, playerName, contractExpiry, netherlands, germany, england, ajaxPlayers, _51, ajaxPlayers_1, p, psvPlayers, _52, psvPlayers_1, p, feyenoordPlayers, _53, feyenoordPlayers_1, p, azPlayers, _54, azPlayers_1, p, FixtureSchedulerService, o21Div1, o21Div2, o21Div3, o21Div4, eersteDivisieClubs, clubNameToId, _55, eersteDivisieClubs_1, club, parentClub, _56, created, tweedeDivisieJongTeams, _57, tweedeDivisieJongTeams_1, jong, parent_1, o21JongTeams, _58, o21JongTeams_1, jong, parent_2;
        var _59, _60, _61, _62;
        return __generator(this, function (_63) {
            switch (_63.label) {
                case 0: 
                // Clear existing data in correct order to avoid FK constraint errors
                // International models first (they reference clubs/players)
                return [4 /*yield*/, prisma.internationalMatchEvent.deleteMany()];
                case 1:
                    // Clear existing data in correct order to avoid FK constraint errors
                    // International models first (they reference clubs/players)
                    _63.sent();
                    return [4 /*yield*/, prisma.internationalMatch.deleteMany()];
                case 2:
                    _63.sent();
                    return [4 /*yield*/, prisma.internationalPlayer.deleteMany()];
                case 3:
                    _63.sent();
                    return [4 /*yield*/, prisma.internationalManager.deleteMany()];
                case 4:
                    _63.sent();
                    return [4 /*yield*/, prisma.competitionStage.deleteMany()];
                case 5:
                    _63.sent();
                    return [4 /*yield*/, prisma.internationalCompetition.deleteMany()];
                case 6:
                    _63.sent();
                    return [4 /*yield*/, prisma.nationalTeam.deleteMany()];
                case 7:
                    _63.sent();
                    // Financial and regulatory models
                    return [4 /*yield*/, prisma.gateReceipt.deleteMany()];
                case 8:
                    // Financial and regulatory models
                    _63.sent();
                    return [4 /*yield*/, prisma.sponsorship.deleteMany()];
                case 9:
                    _63.sent();
                    return [4 /*yield*/, prisma.facility.deleteMany()];
                case 10:
                    _63.sent();
                    return [4 /*yield*/, prisma.staffContract.deleteMany()];
                case 11:
                    _63.sent();
                    return [4 /*yield*/, prisma.clubFinances.deleteMany()];
                case 12:
                    _63.sent();
                    return [4 /*yield*/, prisma.tVRights.deleteMany()];
                case 13:
                    _63.sent();
                    return [4 /*yield*/, prisma.trainingFocus.deleteMany()];
                case 14:
                    _63.sent();
                    return [4 /*yield*/, prisma.staff.deleteMany()];
                case 15:
                    _63.sent();
                    return [4 /*yield*/, prisma.loan.deleteMany()];
                case 16:
                    _63.sent();
                    return [4 /*yield*/, prisma.matchEvent.deleteMany()];
                case 17:
                    _63.sent();
                    return [4 /*yield*/, prisma.fixture.deleteMany()];
                case 18:
                    _63.sent();
                    return [4 /*yield*/, prisma.player.deleteMany()];
                case 19:
                    _63.sent();
                    return [4 /*yield*/, prisma.clubFormation.deleteMany()];
                case 20:
                    _63.sent();
                    return [4 /*yield*/, prisma.clubStrategy.deleteMany()];
                case 21:
                    _63.sent();
                    return [4 /*yield*/, prisma.transfer.deleteMany()];
                case 22:
                    _63.sent();
                    return [4 /*yield*/, prisma.club.deleteMany()];
                case 23:
                    _63.sent();
                    return [4 /*yield*/, prisma.league.deleteMany()];
                case 24:
                    _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: 'Eredivisie',
                                tier: 'EREDIVISIE',
                                season: '2024-2025',
                            },
                        })];
                case 25:
                    eredivisie = _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: 'Eerste Divisie',
                                tier: 'EERSTE_DIVISIE',
                                season: '2024-2025',
                            },
                        })];
                case 26:
                    eersteDivisie = _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: 'Tweede Divisie',
                                tier: 'TWEEDE_DIVISIE',
                                season: '2024-2025',
                            },
                        })];
                case 27:
                    tweedeDivisie = _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: 'Derde Divisie',
                                tier: 'DERDE_DIVISIE',
                                season: '2024-2025',
                            },
                        })];
                case 28:
                    derdeDivisie = _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: 'Vierde Divisie',
                                tier: 'VIERDE_DIVISIE',
                                season: '2024-2025',
                            },
                        })];
                case 29:
                    vierdeDivisie = _63.sent();
                    zaterdagRegions = ['Noord', 'Oost', 'Zuid'];
                    zondagRegions = ['Noord', 'Oost', 'West 1', 'West 2', 'Zuid 1', 'Zuid 2'];
                    amateurDivisions = ['Eerste Klasse', 'Tweede Klasse', 'Derde Klasse', 'Vierde Klasse'];
                    zaterdagLeagues = [];
                    zondagLeagues = [];
                    _i = 0, zaterdagRegions_1 = zaterdagRegions;
                    _63.label = 30;
                case 30:
                    if (!(_i < zaterdagRegions_1.length)) return [3 /*break*/, 35];
                    region = zaterdagRegions_1[_i];
                    _a = 0, amateurDivisions_1 = amateurDivisions;
                    _63.label = 31;
                case 31:
                    if (!(_a < amateurDivisions_1.length)) return [3 /*break*/, 34];
                    division = amateurDivisions_1[_a];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zaterdag ".concat(region, " ").concat(division),
                                tier: 'AMATEUR',
                                region: "Zaterdag ".concat(region),
                                division: division,
                                season: '2024-2025',
                            },
                        })];
                case 32:
                    league = _63.sent();
                    zaterdagLeagues.push(league);
                    _63.label = 33;
                case 33:
                    _a++;
                    return [3 /*break*/, 31];
                case 34:
                    _i++;
                    return [3 /*break*/, 30];
                case 35:
                    vijfdeKlasseGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
                    _b = 0, vijfdeKlasseGroups_1 = vijfdeKlasseGroups;
                    _63.label = 36;
                case 36:
                    if (!(_b < vijfdeKlasseGroups_1.length)) return [3 /*break*/, 39];
                    group = vijfdeKlasseGroups_1[_b];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zaterdag Noord 5e Klasse ".concat(group),
                                tier: 'AMATEUR',
                                region: 'Zaterdag Noord',
                                division: "Vijfde Klasse ".concat(group),
                                season: '2024-2025',
                            },
                        })];
                case 37:
                    league = _63.sent();
                    zaterdagLeagues.push(league);
                    _63.label = 38;
                case 38:
                    _b++;
                    return [3 /*break*/, 36];
                case 39:
                    _c = 0, zondagRegions_1 = zondagRegions;
                    _63.label = 40;
                case 40:
                    if (!(_c < zondagRegions_1.length)) return [3 /*break*/, 45];
                    region = zondagRegions_1[_c];
                    _d = 0, amateurDivisions_2 = amateurDivisions;
                    _63.label = 41;
                case 41:
                    if (!(_d < amateurDivisions_2.length)) return [3 /*break*/, 44];
                    division = amateurDivisions_2[_d];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zondag ".concat(region, " ").concat(division),
                                tier: 'AMATEUR',
                                region: "Zondag ".concat(region),
                                division: division,
                                season: '2024-2025',
                            },
                        })];
                case 42:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 43;
                case 43:
                    _d++;
                    return [3 /*break*/, 41];
                case 44:
                    _c++;
                    return [3 /*break*/, 40];
                case 45:
                    zondagOostSpecialLeagues = [
                        { name: 'Zondag Oost 1e klasse D', division: 'Eerste Klasse D' },
                        { name: 'Zondag Oost 2e klasse H', division: 'Tweede Klasse H' },
                        { name: 'Zondag Oost 2e klasse I', division: 'Tweede Klasse I' },
                        { name: 'Zondag Oost 3e klasse A', division: 'Derde Klasse A' },
                        { name: 'Zondag Oost 3e klasse B', division: 'Derde Klasse B' },
                        { name: 'Zondag Oost 3e klasse C', division: 'Derde Klasse C' },
                        { name: 'Zondag Oost 3e klasse D', division: 'Derde Klasse D' },
                        { name: 'Zondag Oost 4e klasse A', division: 'Vierde Klasse A' },
                        { name: 'Zondag Oost 4e klasse B', division: 'Vierde Klasse B' },
                        { name: 'Zondag Oost 4e klasse C', division: 'Vierde Klasse C' },
                        { name: 'Zondag Oost 4e klasse D', division: 'Vierde Klasse D' },
                        { name: 'Zondag Oost 4e klasse E', division: 'Vierde Klasse E' },
                        { name: 'Zondag Oost 4e klasse F', division: 'Vierde Klasse F' },
                        { name: 'Zondag Oost 4e klasse G', division: 'Vierde Klasse G' },
                    ];
                    _e = 0, zondagOostSpecialLeagues_1 = zondagOostSpecialLeagues;
                    _63.label = 46;
                case 46:
                    if (!(_e < zondagOostSpecialLeagues_1.length)) return [3 /*break*/, 49];
                    leagueData = zondagOostSpecialLeagues_1[_e];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: leagueData.name,
                                tier: 'AMATEUR',
                                region: 'Zondag Oost',
                                division: leagueData.division,
                                season: '2024-2025',
                            },
                        })];
                case 47:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 48;
                case 48:
                    _e++;
                    return [3 /*break*/, 46];
                case 49:
                    zondagNoordSpecialLeagues = [
                        { name: 'Zondag Noord 1e klasse H', division: 'Eerste Klasse H' },
                        { name: 'Zondag Noord 2e klasse G', division: 'Tweede Klasse G' },
                        { name: 'Zondag Noord 2e klasse H', division: 'Tweede Klasse H' },
                        { name: 'Zondag Noord 3e klasse N', division: 'Derde Klasse N' },
                        { name: 'Zondag Noord 3e klasse O', division: 'Derde Klasse O' },
                        { name: 'Zondag Noord 3e klasse P', division: 'Derde Klasse P' },
                        { name: 'Zondag Noord 4e klasse A', division: 'Vierde Klasse A' },
                        { name: 'Zondag Noord 4e klasse B', division: 'Vierde Klasse B' },
                        { name: 'Zondag Noord 4e klasse C', division: 'Vierde Klasse C' },
                    ];
                    _f = 0, zondagNoordSpecialLeagues_1 = zondagNoordSpecialLeagues;
                    _63.label = 50;
                case 50:
                    if (!(_f < zondagNoordSpecialLeagues_1.length)) return [3 /*break*/, 53];
                    leagueData = zondagNoordSpecialLeagues_1[_f];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: leagueData.name,
                                tier: 'AMATEUR',
                                region: 'Zondag Noord',
                                division: leagueData.division,
                                season: '2024-2025',
                            },
                        })];
                case 51:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 52;
                case 52:
                    _f++;
                    return [3 /*break*/, 50];
                case 53:
                    zondagNoordVijfdeKlasseGroups = ['A', 'B', 'C', 'D'];
                    _g = 0, zondagNoordVijfdeKlasseGroups_1 = zondagNoordVijfdeKlasseGroups;
                    _63.label = 54;
                case 54:
                    if (!(_g < zondagNoordVijfdeKlasseGroups_1.length)) return [3 /*break*/, 57];
                    group = zondagNoordVijfdeKlasseGroups_1[_g];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zondag Noord 5e Klasse ".concat(group),
                                tier: 'AMATEUR',
                                region: 'Zondag Noord',
                                division: "Vijfde Klasse ".concat(group),
                                season: '2024-2025',
                            },
                        })];
                case 55:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 56;
                case 56:
                    _g++;
                    return [3 /*break*/, 54];
                case 57:
                    zondagOostVijfdeKlasseGroups = ['A', 'B', 'C', 'D', 'E'];
                    _h = 0, zondagOostVijfdeKlasseGroups_1 = zondagOostVijfdeKlasseGroups;
                    _63.label = 58;
                case 58:
                    if (!(_h < zondagOostVijfdeKlasseGroups_1.length)) return [3 /*break*/, 61];
                    group = zondagOostVijfdeKlasseGroups_1[_h];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zondag Oost 5e Klasse ".concat(group),
                                tier: 'AMATEUR',
                                region: 'Zondag Oost',
                                division: "Vijfde Klasse ".concat(group),
                                season: '2024-2025',
                            },
                        })];
                case 59:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 60;
                case 60:
                    _h++;
                    return [3 /*break*/, 58];
                case 61:
                    zondagWest1VijfdeKlasseGroups = ['A', 'B', 'C', 'D'];
                    _j = 0, zondagWest1VijfdeKlasseGroups_1 = zondagWest1VijfdeKlasseGroups;
                    _63.label = 62;
                case 62:
                    if (!(_j < zondagWest1VijfdeKlasseGroups_1.length)) return [3 /*break*/, 65];
                    group = zondagWest1VijfdeKlasseGroups_1[_j];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zondag West 1 5e Klasse ".concat(group),
                                tier: 'AMATEUR',
                                region: 'Zondag West 1',
                                division: "Vijfde Klasse ".concat(group),
                                season: '2024-2025',
                            },
                        })];
                case 63:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 64;
                case 64:
                    _j++;
                    return [3 /*break*/, 62];
                case 65:
                    zondagWest2VijfdeKlasseGroups = ['A', 'B', 'C', 'D'];
                    _k = 0, zondagWest2VijfdeKlasseGroups_1 = zondagWest2VijfdeKlasseGroups;
                    _63.label = 66;
                case 66:
                    if (!(_k < zondagWest2VijfdeKlasseGroups_1.length)) return [3 /*break*/, 69];
                    group = zondagWest2VijfdeKlasseGroups_1[_k];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zondag West 2 5e Klasse ".concat(group),
                                tier: 'AMATEUR',
                                region: 'Zondag West 2',
                                division: "Vijfde Klasse ".concat(group),
                                season: '2024-2025',
                            },
                        })];
                case 67:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 68;
                case 68:
                    _k++;
                    return [3 /*break*/, 66];
                case 69:
                    zondagZuid1VijfdeKlasseGroups = ['A', 'B', 'C', 'D'];
                    _l = 0, zondagZuid1VijfdeKlasseGroups_1 = zondagZuid1VijfdeKlasseGroups;
                    _63.label = 70;
                case 70:
                    if (!(_l < zondagZuid1VijfdeKlasseGroups_1.length)) return [3 /*break*/, 73];
                    group = zondagZuid1VijfdeKlasseGroups_1[_l];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zondag Zuid 1 5e Klasse ".concat(group),
                                tier: 'AMATEUR',
                                region: 'Zondag Zuid 1',
                                division: "Vijfde Klasse ".concat(group),
                                season: '2024-2025',
                            },
                        })];
                case 71:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 72;
                case 72:
                    _l++;
                    return [3 /*break*/, 70];
                case 73:
                    zondagZuid2VijfdeKlasseGroups = ['A', 'B', 'C', 'D'];
                    _m = 0, zondagZuid2VijfdeKlasseGroups_1 = zondagZuid2VijfdeKlasseGroups;
                    _63.label = 74;
                case 74:
                    if (!(_m < zondagZuid2VijfdeKlasseGroups_1.length)) return [3 /*break*/, 77];
                    group = zondagZuid2VijfdeKlasseGroups_1[_m];
                    return [4 /*yield*/, prisma.league.create({
                            data: {
                                name: "Zondag Zuid 2 5e Klasse ".concat(group),
                                tier: 'AMATEUR',
                                region: 'Zondag Zuid 2',
                                division: "Vijfde Klasse ".concat(group),
                                season: '2024-2025',
                            },
                        })];
                case 75:
                    league = _63.sent();
                    zondagLeagues.push(league);
                    _63.label = 76;
                case 76:
                    _m++;
                    return [3 /*break*/, 74];
                case 77:
                    console.log('Created league structure successfully');
                    eredivisieClubs = [
                        { name: 'AFC Ajax', homeCity: 'Amsterdam', boardExpectation: 'Win the league', morale: 85, form: 'WWWDL', regionTag: 'West 1' },
                        { name: 'PSV Eindhoven', homeCity: 'Eindhoven', boardExpectation: 'Challenge for the title', morale: 82, form: 'WWWWD', regionTag: 'Zuid' },
                        { name: 'Feyenoord', homeCity: 'Rotterdam', boardExpectation: 'Qualify for Europe', morale: 80, form: 'WDLWW', regionTag: 'West 2' },
                        { name: 'AZ Alkmaar', homeCity: 'Alkmaar', boardExpectation: 'Top 6 finish', morale: 78, form: 'DLWWW', regionTag: 'West 1' },
                        { name: 'FC Twente', homeCity: 'Enschede', boardExpectation: 'Top 8 finish', morale: 75, form: 'LWWDL', regionTag: 'Oost' },
                        { name: 'SC Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Mid-table finish', morale: 72, form: 'DLWWD', regionTag: 'Noord' },
                        { name: 'FC Utrecht', homeCity: 'Utrecht', boardExpectation: 'Top 10 finish', morale: 70, form: 'WDLWL', regionTag: 'West 1' },
                        { name: 'Vitesse', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 65, form: 'LDLWW', regionTag: 'Oost' },
                        { name: 'Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 68, form: 'WLDLW', regionTag: 'West 2' },
                        { name: 'Heracles Almelo', homeCity: 'Almelo', boardExpectation: 'Avoid relegation', morale: 65, form: 'DLWLL', regionTag: 'Oost' },
                        { name: 'PEC Zwolle', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 67, form: 'LWDLL', regionTag: 'Oost' },
                        { name: 'NEC Nijmegen', homeCity: 'Nijmegen', boardExpectation: 'Avoid relegation', morale: 66, form: 'DLWDL', regionTag: 'Oost' },
                        { name: 'Go Ahead Eagles', homeCity: 'Deventer', boardExpectation: 'Avoid relegation', morale: 64, form: 'LDLWL', regionTag: 'Oost' },
                        { name: 'Fortuna Sittard', homeCity: 'Sittard', boardExpectation: 'Avoid relegation', morale: 63, form: 'LLDWL', regionTag: 'Zuid' },
                        { name: 'RKC Waalwijk', homeCity: 'Waalwijk', boardExpectation: 'Avoid relegation', morale: 62, form: 'DLWLL', regionTag: 'Zuid' },
                        { name: 'FC Volendam', homeCity: 'Volendam', boardExpectation: 'Avoid relegation', morale: 60, form: 'LLDLL', regionTag: 'West 1' },
                        { name: 'Excelsior', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 61, form: 'LDLWL', regionTag: 'West 2' },
                        { name: 'Almere City FC', homeCity: 'Almere', boardExpectation: 'Avoid relegation', morale: 58, form: 'LLDLL', regionTag: 'West 1' }
                    ];
                    _o = 0, eredivisieClubs_1 = eredivisieClubs;
                    _63.label = 78;
                case 78:
                    if (!(_o < eredivisieClubs_1.length)) return [3 /*break*/, 81];
                    clubData = eredivisieClubs_1[_o];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: eredivisie.id }),
                        })];
                case 79:
                    _63.sent();
                    _63.label = 80;
                case 80:
                    _o++;
                    return [3 /*break*/, 78];
                case 81:
                    // --- REMOVE/COMMENT OUT THE OLD EERSTEDIVISIECLUBS BLOCK BELOW ---
                    /*
                    // Seed Eerste Divisie clubs (national level)
                    const eersteDivisieClubs = [
                      { name: 'Willem II', homeCity: 'Tilburg', boardExpectation: 'Promotion', morale: 85, form: 'WWWWD', regionTag: 'Zuid' },
                      { name: 'FC Groningen', homeCity: 'Groningen', boardExpectation: 'Promotion', morale: 82, form: 'WWWDL', regionTag: 'Noord' },
                      { name: 'Roda JC', homeCity: 'Kerkrade', boardExpectation: 'Play-off spot', morale: 78, form: 'WWDLW', regionTag: 'Zuid' },
                      { name: 'NAC Breda', homeCity: 'Breda', boardExpectation: 'Play-off spot', morale: 76, form: 'WDLWW', regionTag: 'Zuid' },
                      { name: 'FC Emmen', homeCity: 'Emmen', boardExpectation: 'Play-off spot', morale: 74, form: 'DLWWW', regionTag: 'Noord' },
                      { name: 'Helmond Sport', homeCity: 'Helmond', boardExpectation: 'Mid-table finish', morale: 70, form: 'LWWDL', regionTag: 'Zuid' },
                      { name: 'MVV Maastricht', homeCity: 'Maastricht', boardExpectation: 'Mid-table finish', morale: 68, form: 'DLWWD', regionTag: 'Zuid' },
                      { name: 'FC Den Bosch', homeCity: 'Den Bosch', boardExpectation: 'Mid-table finish', morale: 66, form: 'WWDLW', regionTag: 'Zuid' },
                      { name: 'FC Dordrecht', homeCity: 'Dordrecht', boardExpectation: 'Mid-table finish', morale: 64, form: 'LWWDL', regionTag: 'West 2' },
                      { name: 'Jong Ajax', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 62, form: 'DLWLL', regionTag: 'West 1' },
                      { name: 'Jong PSV', homeCity: 'Eindhoven', boardExpectation: 'Mid-table finish', morale: 60, form: 'LLDWL', regionTag: 'Zuid' },
                      { name: 'Jong AZ', homeCity: 'Alkmaar', boardExpectation: 'Mid-table finish', morale: 58, form: 'LDLWL', regionTag: 'West 1' },
                      { name: 'Jong FC Utrecht', homeCity: 'Utrecht', boardExpectation: 'Mid-table finish', morale: 56, form: 'LLDLL', regionTag: 'West 1' },
                      { name: 'Jong Feyenoord', homeCity: 'Rotterdam', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWLL', regionTag: 'West 2' },
                      { name: 'Jong Vitesse', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 52, form: 'LDLWL', regionTag: 'Oost' },
                      { name: 'Jong Sparta Rotterdam', homeCity: 'Rotterdam', boardExpectation: 'Avoid relegation', morale: 50, form: 'LLDLL', regionTag: 'West 2' },
                      { name: 'Jong FC Twente', homeCity: 'Enschede', boardExpectation: 'Avoid relegation', morale: 48, form: 'DLWLL', regionTag: 'Oost' },
                      { name: 'Jong SC Heerenveen', homeCity: 'Heerenveen', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL', regionTag: 'Noord' },
                      { name: 'Jong PEC Zwolle', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL', regionTag: 'Oost' }
                    ];
                  
                    for (const clubData of eersteDivisieClubs) {
                      await prisma.club.create({
                        data: {
                          ...clubData,
                          leagueId: eersteDivisie.id,
                        },
                      });
                    }
                    */
                    // ... existing code ...
                    console.log('Created national clubs successfully');
                    zondagNoordLeagues = zondagLeagues.filter(function (l) { return l.region === 'Zondag Noord'; });
                    eersteKlasseH_Zondag = zondagNoordLeagues.find(function (l) { return l.division === 'Eerste Klasse'; });
                    if (!eersteKlasseH_Zondag) return [3 /*break*/, 85];
                    eersteKlasseHClubs_Zondag = [
                        { name: 'VV Dalen', homeCity: 'Dalen', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
                        { name: 'SV Dalfsen', homeCity: 'Dalfsen', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
                        { name: 'EHS \'85', homeCity: 'Emmen', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
                        { name: 'CVV Germanicus', homeCity: 'Groningen', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
                        { name: 'Sportclub Markelo', homeCity: 'Markelo', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
                        { name: 'MVV \'29', homeCity: 'Musselkanaal', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
                        { name: 'Raptim', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
                        { name: 'RSC', homeCity: 'Groningen', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
                        { name: 'VV Sellingen', homeCity: 'Sellingen', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
                        { name: 'De Tukkers', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
                        { name: 'Twedo', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
                        { name: 'VV Valthermond', homeCity: 'Valthermond', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
                        { name: 'WKE \'16', homeCity: 'Groningen', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
                    ];
                    _p = 0, eersteKlasseHClubs_Zondag_1 = eersteKlasseHClubs_Zondag;
                    _63.label = 82;
                case 82:
                    if (!(_p < eersteKlasseHClubs_Zondag_1.length)) return [3 /*break*/, 85];
                    clubData = eersteKlasseHClubs_Zondag_1[_p];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: eersteKlasseH_Zondag.id }),
                        })];
                case 83:
                    _63.sent();
                    _63.label = 84;
                case 84:
                    _p++;
                    return [3 /*break*/, 82];
                case 85:
                    console.log('Created Zondag Noord clubs successfully');
                    zondagOostLeagues = zondagLeagues.filter(function (l) { return l.region === 'Zondag Oost'; });
                    eersteKlasseD_Zondag = zondagOostLeagues.find(function (l) { return l.division === 'Eerste Klasse D'; });
                    if (!eersteKlasseD_Zondag) return [3 /*break*/, 89];
                    eersteKlasseDClubs = [
                        { name: 'De Bataven', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
                        { name: 'Sportclub Bemmel', homeCity: 'Bemmel', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
                        { name: 'Berghem Sport', homeCity: 'Berghem', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
                        { name: 'AVV Columbia', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
                        { name: 'SV Leones', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
                        { name: 'MASV', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
                        { name: 'RKHVV', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
                        { name: 'SDO Bussum', homeCity: 'Bussum', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
                        { name: 'SV TOP', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
                        { name: 'Voorwaarts T', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
                        { name: 'FC Winterswijk', homeCity: 'Winterswijk', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
                        { name: 'SC Woezik', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
                        { name: 'WSV', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
                    ];
                    _q = 0, eersteKlasseDClubs_1 = eersteKlasseDClubs;
                    _63.label = 86;
                case 86:
                    if (!(_q < eersteKlasseDClubs_1.length)) return [3 /*break*/, 89];
                    clubData = eersteKlasseDClubs_1[_q];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: eersteKlasseD_Zondag.id }),
                        })];
                case 87:
                    _63.sent();
                    _63.label = 88;
                case 88:
                    _q++;
                    return [3 /*break*/, 86];
                case 89:
                    tweedeKlasseH_Zondag = zondagOostLeagues.find(function (l) { return l.division === 'Tweede Klasse H'; });
                    if (!tweedeKlasseH_Zondag) return [3 /*break*/, 93];
                    tweedeKlasseHClubs_Oost = [
                        { name: 'Beuningse Boys', homeCity: 'Beuningen', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
                        { name: 'DCS', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
                        { name: 'DIO \'30', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
                        { name: 'DVC\'26', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
                        { name: 'SV Grol', homeCity: 'Groenlo', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
                        { name: 'NEC', homeCity: 'Nijmegen', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
                        { name: 'OBW', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
                        { name: 'SDOUC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
                        { name: 'Spero', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
                        { name: 'Theole', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
                        { name: 'Union', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
                        { name: 'SC Varsseveld', homeCity: 'Varsseveld', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
                        { name: 'VVG \'25', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
                    ];
                    _r = 0, tweedeKlasseHClubs_Oost_1 = tweedeKlasseHClubs_Oost;
                    _63.label = 90;
                case 90:
                    if (!(_r < tweedeKlasseHClubs_Oost_1.length)) return [3 /*break*/, 93];
                    clubData = tweedeKlasseHClubs_Oost_1[_r];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: tweedeKlasseH_Zondag.id }),
                        })];
                case 91:
                    _63.sent();
                    _63.label = 92;
                case 92:
                    _r++;
                    return [3 /*break*/, 90];
                case 93:
                    tweedeKlasseI_Zondag = zondagOostLeagues.find(function (l) { return l.division === 'Tweede Klasse I'; });
                    if (!tweedeKlasseI_Zondag) return [3 /*break*/, 97];
                    tweedeKlasseIClubs = [
                        { name: 'ATC \'65', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 72, form: 'WWWWD' },
                        { name: 'AZC', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 70, form: 'WWWDL' },
                        { name: 'Bon Boys', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 68, form: 'WWDLW' },
                        { name: 'BWO', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 66, form: 'WDLWW' },
                        { name: 'GVV Eilermark', homeCity: 'Eilermark', boardExpectation: 'Mid-table finish', morale: 64, form: 'DLWWW' },
                        { name: 'VV Lemelerveld', homeCity: 'Lemelerveld', boardExpectation: 'Mid-table finish', morale: 62, form: 'LWWDL' },
                        { name: 'VV Reutum', homeCity: 'Reutum', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWD' },
                        { name: 'SV Schalkhaar', homeCity: 'Schalkhaar', boardExpectation: 'Mid-table finish', morale: 58, form: 'WWDLW' },
                        { name: 'SDC \'12', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 56, form: 'LWWDL' },
                        { name: 'STEVO', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 52, form: 'LLDWL' },
                        { name: 'FC Suryoye/Mediterraneo', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 50, form: 'LDLWL' },
                        { name: 'De Tukkers', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDLL' },
                        { name: 'VV Vorden', homeCity: 'Vorden', boardExpectation: 'Avoid relegation', morale: 46, form: 'DLWLL' },
                        { name: 'VV Witkampers', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
                    ];
                    _s = 0, tweedeKlasseIClubs_1 = tweedeKlasseIClubs;
                    _63.label = 94;
                case 94:
                    if (!(_s < tweedeKlasseIClubs_1.length)) return [3 /*break*/, 97];
                    clubData = tweedeKlasseIClubs_1[_s];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: tweedeKlasseI_Zondag.id }),
                        })];
                case 95:
                    _63.sent();
                    _63.label = 96;
                case 96:
                    _s++;
                    return [3 /*break*/, 94];
                case 97:
                    derdeKlasseA_Zondag = zondagOostLeagues.find(function (l) { return l.division === 'Derde Klasse A'; });
                    if (!derdeKlasseA_Zondag) return [3 /*break*/, 101];
                    derdeKlasseAClubs_Oost = [
                        { name: 'Avanti Wilskracht', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
                        { name: 'Barbaros', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
                        { name: 'DSVD', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
                        { name: 'VC Fleringen', homeCity: 'Fleringen', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
                        { name: 'AVC Luctor et Emergo', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
                        { name: 'MVV \'29', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
                        { name: 'RSC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
                        { name: 'VV Ruurlo', homeCity: 'Ruurlo', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
                        { name: 'Saasveldia', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'FC Trias', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
                        { name: 'TVO', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
                        { name: 'SV Vasse', homeCity: 'Vasse', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
                        { name: 'VOGIDO', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
                        { name: 'WVV \'34', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 40, form: 'LLDLL' },
                    ];
                    _t = 0, derdeKlasseAClubs_Oost_1 = derdeKlasseAClubs_Oost;
                    _63.label = 98;
                case 98:
                    if (!(_t < derdeKlasseAClubs_Oost_1.length)) return [3 /*break*/, 101];
                    clubData = derdeKlasseAClubs_Oost_1[_t];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: derdeKlasseA_Zondag.id }),
                        })];
                case 99:
                    _63.sent();
                    _63.label = 100;
                case 100:
                    _t++;
                    return [3 /*break*/, 98];
                case 101:
                    derdeKlasseB_Zondag = zondagOostLeagues.find(function (l) { return l.division === 'Derde Klasse B'; });
                    if (!derdeKlasseB_Zondag) return [3 /*break*/, 105];
                    derdeKlasseBClubs_Oost = [
                        { name: 'FC Bergh', homeCity: 'Berg', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
                        { name: 'SV Concordia-Wehl', homeCity: 'Wehl', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
                        { name: 'FC Dinxperlo', homeCity: 'Dinxperlo', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
                        { name: 'VV Doetinchem', homeCity: 'Doetinchem', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
                        { name: 'DVV Duiven', homeCity: 'Duiven', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
                        { name: 'VV Eldenia', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
                        { name: 'VV Gendringen', homeCity: 'Gendringen', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
                        { name: 'HC \'03', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
                        { name: 'Pax Hengelo', homeCity: 'Hengelo', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'SML', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
                        { name: 'VDZ', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
                        { name: 'VIOD D', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
                        { name: 'VVO', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
                        { name: 'SC Westervoort', homeCity: 'Westervoort', boardExpectation: 'Avoid relegation', morale: 40, form: 'LLDLL' },
                    ];
                    _u = 0, derdeKlasseBClubs_Oost_1 = derdeKlasseBClubs_Oost;
                    _63.label = 102;
                case 102:
                    if (!(_u < derdeKlasseBClubs_Oost_1.length)) return [3 /*break*/, 105];
                    clubData = derdeKlasseBClubs_Oost_1[_u];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: derdeKlasseB_Zondag.id }),
                        })];
                case 103:
                    _63.sent();
                    _63.label = 104;
                case 104:
                    _u++;
                    return [3 /*break*/, 102];
                case 105:
                    derdeKlasseC_Zondag = zondagOostLeagues.find(function (l) { return l.division === 'Derde Klasse C'; });
                    if (!derdeKlasseC_Zondag) return [3 /*break*/, 109];
                    derdeKlasseCClubs_Oost = [
                        { name: 'SV Angeren', homeCity: 'Angeren', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
                        { name: 'SV Blauw Wit', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
                        { name: 'RKSV Brakkenstein', homeCity: 'Nijmegen', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
                        { name: 'RKSV Driel', homeCity: 'Driel', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
                        { name: 'DSZ', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
                        { name: 'DVOL', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
                        { name: 'GVA', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
                        { name: 'HAVO', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
                        { name: 'FC Jeugd \'90', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'Jonge Kracht', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
                        { name: 'Quick 1888', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
                        { name: 'VV Rood Wit', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
                        { name: 'SCE', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
                        { name: 'Vv Trekvogels', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 40, form: 'LLDLL' },
                    ];
                    _v = 0, derdeKlasseCClubs_Oost_1 = derdeKlasseCClubs_Oost;
                    _63.label = 106;
                case 106:
                    if (!(_v < derdeKlasseCClubs_Oost_1.length)) return [3 /*break*/, 109];
                    clubData = derdeKlasseCClubs_Oost_1[_v];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: derdeKlasseC_Zondag.id }),
                        })];
                case 107:
                    _63.sent();
                    _63.label = 108;
                case 108:
                    _v++;
                    return [3 /*break*/, 106];
                case 109:
                    derdeKlasseD_Zondag = zondagOostLeagues.find(function (l) { return l.division === 'Derde Klasse D'; });
                    if (!derdeKlasseD_Zondag) return [3 /*break*/, 113];
                    derdeKlasseDClubs_Oost = [
                        { name: 'ABS Bathmen', homeCity: 'Bathmen', boardExpectation: 'Promotion', morale: 68, form: 'WWWWD' },
                        { name: 'UVV Albatross', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 66, form: 'WWWDL' },
                        { name: 'VV Beekbergen', homeCity: 'Beekbergen', boardExpectation: 'Play-off spot', morale: 64, form: 'WWDLW' },
                        { name: 'SV Colmschate \'33', homeCity: 'Colmschate', boardExpectation: 'Play-off spot', morale: 62, form: 'WDLWW' },
                        { name: 'DSC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 60, form: 'DLWWW' },
                        { name: 'Groen Wit \'62', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 58, form: 'LWWDL' },
                        { name: 'VV Holten', homeCity: 'Holten', boardExpectation: 'Mid-table finish', morale: 56, form: 'DLWWD' },
                        { name: 'KCVO', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 54, form: 'WWDLW' },
                        { name: 'Sportclub Markelo', homeCity: 'Markelo', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'SC Overwetering', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 48, form: 'LLDWL' },
                        { name: 'Robur et Velocitas', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 46, form: 'LDLWL' },
                        { name: 'DVV Turkse Kracht', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 44, form: 'LLDLL' },
                        { name: 'Warnsveldse Boys', homeCity: 'Warnsveld', boardExpectation: 'Avoid relegation', morale: 42, form: 'DLWLL' },
                        { name: 'Wijhe \'92', homeCity: 'Wijhe', boardExpectation: 'Avoid relegation', morale: 40, form: 'LLDLL' },
                    ];
                    _w = 0, derdeKlasseDClubs_Oost_1 = derdeKlasseDClubs_Oost;
                    _63.label = 110;
                case 110:
                    if (!(_w < derdeKlasseDClubs_Oost_1.length)) return [3 /*break*/, 113];
                    clubData = derdeKlasseDClubs_Oost_1[_w];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: derdeKlasseD_Zondag.id }),
                        })];
                case 111:
                    _63.sent();
                    _63.label = 112;
                case 112:
                    _w++;
                    return [3 /*break*/, 110];
                case 113:
                    vierdeKlasseA_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vierde Klasse A'; });
                    if (!vierdeKlasseA_Zondag_Oost) return [3 /*break*/, 117];
                    vierdeKlasseAClubs_Oost = [
                        { name: 'SV Almelo', homeCity: 'Almelo', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
                        { name: 'BVV Borne', homeCity: 'Borne', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
                        { name: 'DTC \'07', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
                        { name: 'SV Enter', homeCity: 'Enter', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
                        { name: 'KOSC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
                        { name: 'AVC La Première', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
                        { name: 'LSV Lonneker', homeCity: 'Lonneker', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
                        { name: 'RKSV De Lutte', homeCity: 'De Lutte', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
                        { name: 'VV Manderveen', homeCity: 'Manderveen', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
                        { name: 'Sportclub Overdinkel', homeCity: 'Overdinkel', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
                        { name: 'Sportlust Vroomshoop', homeCity: 'Vroomshoop', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
                        { name: 'UD Weerselo', homeCity: 'Weerselo', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
                    ];
                    _x = 0, vierdeKlasseAClubs_Oost_1 = vierdeKlasseAClubs_Oost;
                    _63.label = 114;
                case 114:
                    if (!(_x < vierdeKlasseAClubs_Oost_1.length)) return [3 /*break*/, 117];
                    clubData = vierdeKlasseAClubs_Oost_1[_x];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vierdeKlasseA_Zondag_Oost.id }),
                        })];
                case 115:
                    _63.sent();
                    _63.label = 116;
                case 116:
                    _x++;
                    return [3 /*break*/, 114];
                case 117:
                    vierdeKlasseB_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vierde Klasse B'; });
                    if (!vierdeKlasseB_Zondag_Oost) return [3 /*break*/, 121];
                    vierdeKlasseBClubs_Oost = [
                        { name: 'BSC Unisson', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
                        { name: 'SV Delden', homeCity: 'Delden', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
                        { name: 'FC Eibergen', homeCity: 'Eibergen', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
                        { name: 'SV Hector', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
                        { name: 'Hoeve Vooruit', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
                        { name: 'SP Neede', homeCity: 'Neede', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
                        { name: 'SP Rekken', homeCity: 'Rekken', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
                        { name: 'VV Rood Zwart', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
                        { name: 'De Tubanters 1897', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
                        { name: 'vv Twenthe', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
                        { name: 'UDI', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
                        { name: 'VV Victoria \'28', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
                    ];
                    _y = 0, vierdeKlasseBClubs_Oost_1 = vierdeKlasseBClubs_Oost;
                    _63.label = 118;
                case 118:
                    if (!(_y < vierdeKlasseBClubs_Oost_1.length)) return [3 /*break*/, 121];
                    clubData = vierdeKlasseBClubs_Oost_1[_y];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vierdeKlasseB_Zondag_Oost.id }),
                        })];
                case 119:
                    _63.sent();
                    _63.label = 120;
                case 120:
                    _y++;
                    return [3 /*break*/, 118];
                case 121:
                    vierdeKlasseC_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vierde Klasse C'; });
                    if (!vierdeKlasseC_Zondag_Oost) return [3 /*break*/, 125];
                    vierdeKlasseCClubs_Oost = [
                        { name: 'AD \'69', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
                        { name: 'SV Basteom', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
                        { name: 'VV Erix', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
                        { name: 'VV Etten', homeCity: 'Etten', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
                        { name: 'GWVV', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
                        { name: 'Keijenburgse Boys', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
                        { name: 'KSV Vragender', homeCity: 'Vragender', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
                        { name: 'SP Lochem', homeCity: 'Lochem', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
                        { name: 'SC Meddo', homeCity: 'Meddo', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
                        { name: 'VV Reünie', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
                        { name: 'Ulftse Boys', homeCity: 'Ulft', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
                        { name: 'VIOS B', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
                    ];
                    _z = 0, vierdeKlasseCClubs_Oost_1 = vierdeKlasseCClubs_Oost;
                    _63.label = 122;
                case 122:
                    if (!(_z < vierdeKlasseCClubs_Oost_1.length)) return [3 /*break*/, 125];
                    clubData = vierdeKlasseCClubs_Oost_1[_z];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vierdeKlasseC_Zondag_Oost.id }),
                        })];
                case 123:
                    _63.sent();
                    _63.label = 124;
                case 124:
                    _z++;
                    return [3 /*break*/, 122];
                case 125:
                    vierdeKlasseD_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vierde Klasse D'; });
                    if (!vierdeKlasseD_Zondag_Oost) return [3 /*break*/, 129];
                    vierdeKlasseDClubs_Oost = [
                        { name: 'Angerlo Vooruit', homeCity: 'Angerlo', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
                        { name: 'SC Doesburg', homeCity: 'Doesburg', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
                        { name: 'SC Groessen', homeCity: 'Groessen', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
                        { name: 'GSV \'38', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
                        { name: 'SV Kilder', homeCity: 'Kilder', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
                        { name: 'SV Loil', homeCity: 'Loil', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
                        { name: 'SV Loo', homeCity: 'Loo', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
                        { name: 'VV Montferland', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
                        { name: 'RKSV \'t Peeske', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
                        { name: 'SC Rijnland', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
                        { name: 'VV Sprinkhanen', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
                    ];
                    _0 = 0, vierdeKlasseDClubs_Oost_1 = vierdeKlasseDClubs_Oost;
                    _63.label = 126;
                case 126:
                    if (!(_0 < vierdeKlasseDClubs_Oost_1.length)) return [3 /*break*/, 129];
                    clubData = vierdeKlasseDClubs_Oost_1[_0];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vierdeKlasseD_Zondag_Oost.id }),
                        })];
                case 127:
                    _63.sent();
                    _63.label = 128;
                case 128:
                    _0++;
                    return [3 /*break*/, 126];
                case 129:
                    vierdeKlasseE_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vierde Klasse E'; });
                    if (!vierdeKlasseE_Zondag_Oost) return [3 /*break*/, 133];
                    vierdeKlasseEClubs_Oost = [
                        { name: 'DIOSA', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
                        { name: 'VV Ewijk', homeCity: 'Ewijk', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
                        { name: 'VV Germania', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
                        { name: 'SV Heumen', homeCity: 'Heumen', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
                        { name: 'Vv Krayenhoff', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
                        { name: 'NSVV FC Kunde', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
                        { name: 'SC Millingen', homeCity: 'Millingen', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
                        { name: 'VV OSC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
                        { name: 'Overasseltse Boys', homeCity: 'Overasselt', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
                        { name: 'RODA \'28', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
                        { name: 'SSA-SJO SVO/VVLK', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
                        { name: 'UHC', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
                    ];
                    _1 = 0, vierdeKlasseEClubs_Oost_1 = vierdeKlasseEClubs_Oost;
                    _63.label = 130;
                case 130:
                    if (!(_1 < vierdeKlasseEClubs_Oost_1.length)) return [3 /*break*/, 133];
                    clubData = vierdeKlasseEClubs_Oost_1[_1];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vierdeKlasseE_Zondag_Oost.id }),
                        })];
                case 131:
                    _63.sent();
                    _63.label = 132;
                case 132:
                    _1++;
                    return [3 /*break*/, 130];
                case 133:
                    vierdeKlasseF_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vierde Klasse F'; });
                    if (!vierdeKlasseF_Zondag_Oost) return [3 /*break*/, 137];
                    vierdeKlasseFClubs_Oost = [
                        { name: 'VV Activia', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
                        { name: 'EDS', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
                        { name: 'SC Klarenbeek', homeCity: 'Klarenbeek', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
                        { name: 'VV Loenermark', homeCity: 'Loenermark', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
                        { name: 'SV Orderbos', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
                        { name: 'SC Rheden', homeCity: 'Rheden', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
                        { name: 'TKA', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
                        { name: 'SV Vaassen', homeCity: 'Vaassen', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
                        { name: 'SC Veluwezoom', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
                        { name: 'Victoria Boys', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
                        { name: 'WWNA', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
                    ];
                    _2 = 0, vierdeKlasseFClubs_Oost_1 = vierdeKlasseFClubs_Oost;
                    _63.label = 134;
                case 134:
                    if (!(_2 < vierdeKlasseFClubs_Oost_1.length)) return [3 /*break*/, 137];
                    clubData = vierdeKlasseFClubs_Oost_1[_2];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vierdeKlasseF_Zondag_Oost.id }),
                        })];
                case 135:
                    _63.sent();
                    _63.label = 136;
                case 136:
                    _2++;
                    return [3 /*break*/, 134];
                case 137:
                    vierdeKlasseG_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vierde Klasse G'; });
                    if (!vierdeKlasseG_Zondag_Oost) return [3 /*break*/, 141];
                    vierdeKlasseGClubs_Oost = [
                        { name: 'SV Broekland', homeCity: 'Broekland', boardExpectation: 'Promotion', morale: 65, form: 'WWWWD' },
                        { name: 'VV De Gazelle', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 63, form: 'WWWDL' },
                        { name: 'SV Haarle', homeCity: 'Haarle', boardExpectation: 'Play-off spot', morale: 61, form: 'WWDLW' },
                        { name: 'SV Heeten', homeCity: 'Heeten', boardExpectation: 'Play-off spot', morale: 59, form: 'WDLWW' },
                        { name: 'VV Hoonhorst', homeCity: 'Hoonhorst', boardExpectation: 'Mid-table finish', morale: 57, form: 'DLWWW' },
                        { name: 'DVV IJsselstreek', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 55, form: 'LWWDL' },
                        { name: 'VV Lettele', homeCity: 'Lettele', boardExpectation: 'Mid-table finish', morale: 53, form: 'DLWWD' },
                        { name: 'SV Nieuw Heeten', homeCity: 'Nieuw Heeten', boardExpectation: 'Mid-table finish', morale: 51, form: 'WWDLW' },
                        { name: 'SV Raalte', homeCity: 'Raalte', boardExpectation: 'Mid-table finish', morale: 49, form: 'LWWDL' },
                        { name: 'DVV Sallandia', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDWL' },
                        { name: 'SDOL', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 43, form: 'LDLWL' },
                        { name: 'USV Nieuwleusen', homeCity: 'Nieuwleusen', boardExpectation: 'Avoid relegation', morale: 41, form: 'LLDLL' },
                    ];
                    _3 = 0, vierdeKlasseGClubs_Oost_1 = vierdeKlasseGClubs_Oost;
                    _63.label = 138;
                case 138:
                    if (!(_3 < vierdeKlasseGClubs_Oost_1.length)) return [3 /*break*/, 141];
                    clubData = vierdeKlasseGClubs_Oost_1[_3];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vierdeKlasseG_Zondag_Oost.id }),
                        })];
                case 139:
                    _63.sent();
                    _63.label = 140;
                case 140:
                    _3++;
                    return [3 /*break*/, 138];
                case 141:
                    vijfdeKlasseA_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vijfde Klasse A'; });
                    if (!vijfdeKlasseA_Zondag_Oost) return [3 /*break*/, 145];
                    vijfdeKlasseAClubs_Oost = [
                        { name: 'VV Bentelo', homeCity: 'Bentelo', boardExpectation: 'Promotion', morale: 62, form: 'WWWWD' },
                        { name: 'VV Buurse', homeCity: 'Buurse', boardExpectation: 'Promotion', morale: 60, form: 'WWWDL' },
                        { name: 'FC het Centrum', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 58, form: 'WWDLW' },
                        { name: 'VV Diepenheim', homeCity: 'Diepenheim', boardExpectation: 'Play-off spot', morale: 56, form: 'WDLWW' },
                        { name: 'VV Haaksbergen', homeCity: 'Haaksbergen', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWW' },
                        { name: 'HVV Hengelo', homeCity: 'Hengelo', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'VV Langeveen', homeCity: 'Langeveen', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWWD' },
                        { name: 'EVV Phenix', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 48, form: 'WWDLW' },
                        { name: 'VV Rietmolen', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 46, form: 'LWWDL' },
                        { name: 'TVV', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDWL' },
                        { name: 'VOSTA', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 40, form: 'LDLWL' },
                        { name: 'Zenderen Vooruit', homeCity: 'Zenderen', boardExpectation: 'Avoid relegation', morale: 38, form: 'LLDLL' },
                    ];
                    _4 = 0, vijfdeKlasseAClubs_Oost_1 = vijfdeKlasseAClubs_Oost;
                    _63.label = 142;
                case 142:
                    if (!(_4 < vijfdeKlasseAClubs_Oost_1.length)) return [3 /*break*/, 145];
                    clubData = vijfdeKlasseAClubs_Oost_1[_4];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vijfdeKlasseA_Zondag_Oost.id }),
                        })];
                case 143:
                    _63.sent();
                    _63.label = 144;
                case 144:
                    _4++;
                    return [3 /*break*/, 142];
                case 145:
                    vijfdeKlasseB_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vijfde Klasse B'; });
                    if (!vijfdeKlasseB_Zondag_Oost) return [3 /*break*/, 149];
                    vijfdeKlasseBClubs_Oost = [
                        { name: 'SV Bredevoort', homeCity: 'Bredevoort', boardExpectation: 'Promotion', morale: 62, form: 'WWWWD' },
                        { name: 'DEO', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 60, form: 'WWWDL' },
                        { name: 'GSV \'63', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 58, form: 'WWDLW' },
                        { name: 'SP Haarlo', homeCity: 'Haarlo', boardExpectation: 'Play-off spot', morale: 56, form: 'WDLWW' },
                        { name: 'SV Halle', homeCity: 'Halle', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWW' },
                        { name: 'SJO/SSA HMC \'17 (H/M)', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'ZVV De Hoven', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWWD' },
                        { name: 'VV Lochuizen', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 48, form: 'WWDLW' },
                        { name: 'MEC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 46, form: 'LWWDL' },
                        { name: 'SSA Ratti-Socii', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDWL' },
                        { name: 'SVBV', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 40, form: 'LDLWL' },
                        { name: 'VV Wolfersveen', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 38, form: 'LLDLL' },
                        { name: 'ZZC \'20', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 36, form: 'DLWLL' },
                    ];
                    _5 = 0, vijfdeKlasseBClubs_Oost_1 = vijfdeKlasseBClubs_Oost;
                    _63.label = 146;
                case 146:
                    if (!(_5 < vijfdeKlasseBClubs_Oost_1.length)) return [3 /*break*/, 149];
                    clubData = vijfdeKlasseBClubs_Oost_1[_5];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vijfdeKlasseB_Zondag_Oost.id }),
                        })];
                case 147:
                    _63.sent();
                    _63.label = 148;
                case 148:
                    _5++;
                    return [3 /*break*/, 146];
                case 149:
                    vijfdeKlasseC_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vijfde Klasse C'; });
                    if (!vijfdeKlasseC_Zondag_Oost) return [3 /*break*/, 153];
                    vijfdeKlasseCClubs_Oost = [
                        { name: 'Ajax Breedenbroek', homeCity: 'Breedenbroek', boardExpectation: 'Promotion', morale: 62, form: 'WWWWD' },
                        { name: 'SV Babberich', homeCity: 'Babberich', boardExpectation: 'Promotion', morale: 60, form: 'WWWDL' },
                        { name: 'VV Den Dam', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 58, form: 'WWDLW' },
                        { name: 'Dierensche Boys', homeCity: 'Dieren', boardExpectation: 'Play-off spot', morale: 56, form: 'WDLWW' },
                        { name: 'Eendracht Arnhem', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWW' },
                        { name: 'VV Elsweide', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'SV Gelders Eiland', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWWD' },
                        { name: 'NVC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 48, form: 'WWDLW' },
                        { name: 'RKPSC', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 46, form: 'LWWDL' },
                        { name: 'RVW', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDWL' },
                        { name: 'SDZZ', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 40, form: 'LDLWL' },
                        { name: 'SHE', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 38, form: 'LLDLL' },
                        { name: 'SVGG', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 36, form: 'DLWLL' },
                    ];
                    _6 = 0, vijfdeKlasseCClubs_Oost_1 = vijfdeKlasseCClubs_Oost;
                    _63.label = 150;
                case 150:
                    if (!(_6 < vijfdeKlasseCClubs_Oost_1.length)) return [3 /*break*/, 153];
                    clubData = vijfdeKlasseCClubs_Oost_1[_6];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vijfdeKlasseC_Zondag_Oost.id }),
                        })];
                case 151:
                    _63.sent();
                    _63.label = 152;
                case 152:
                    _6++;
                    return [3 /*break*/, 150];
                case 153:
                    vijfdeKlasseD_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vijfde Klasse D'; });
                    if (!vijfdeKlasseD_Zondag_Oost) return [3 /*break*/, 157];
                    vijfdeKlasseDClubs_Oost = [
                        { name: 'AAC-Olympia', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 62, form: 'WWWWD' },
                        { name: 'Aquila', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 60, form: 'WWWDL' },
                        { name: 'SV AVIOS-DBV', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 58, form: 'WWDLW' },
                        { name: 'Batavia', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 56, form: 'WDLWW' },
                        { name: 'DVSG', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWW' },
                        { name: 'VV Niftrik', homeCity: 'Niftrik', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'SV Nijmegen', homeCity: 'Nijmegen', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWWD' },
                        { name: 'SCD \'33', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 48, form: 'WWDLW' },
                        { name: 'VV SCP', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 46, form: 'LWWDL' },
                        { name: 'Unitas \'28', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDWL' },
                        { name: 'Victoria \'25', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 40, form: 'LDLWL' },
                        { name: 'WVW Weurt', homeCity: 'Weurt', boardExpectation: 'Avoid relegation', morale: 38, form: 'LLDLL' },
                    ];
                    _7 = 0, vijfdeKlasseDClubs_Oost_1 = vijfdeKlasseDClubs_Oost;
                    _63.label = 154;
                case 154:
                    if (!(_7 < vijfdeKlasseDClubs_Oost_1.length)) return [3 /*break*/, 157];
                    clubData = vijfdeKlasseDClubs_Oost_1[_7];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vijfdeKlasseD_Zondag_Oost.id }),
                        })];
                case 155:
                    _63.sent();
                    _63.label = 156;
                case 156:
                    _7++;
                    return [3 /*break*/, 154];
                case 157:
                    vijfdeKlasseE_Zondag_Oost = zondagOostLeagues.find(function (l) { return l.division === 'Vijfde Klasse E'; });
                    if (!vijfdeKlasseE_Zondag_Oost) return [3 /*break*/, 161];
                    vijfdeKlasseEClubs_Oost = [
                        { name: 'SV Batavia \'90', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 62, form: 'WWWWD' },
                        { name: 'CCW \'16', homeCity: 'Arnhem', boardExpectation: 'Promotion', morale: 60, form: 'WWWDL' },
                        { name: 'DVV Davo', homeCity: 'Arnhem', boardExpectation: 'Play-off spot', morale: 58, form: 'WWDLW' },
                        { name: 'VV Emst', homeCity: 'Emst', boardExpectation: 'Play-off spot', morale: 56, form: 'WDLWW' },
                        { name: 'SV Epse', homeCity: 'Epse', boardExpectation: 'Mid-table finish', morale: 54, form: 'DLWWW' },
                        { name: 'DVV Go-Ahead', homeCity: 'Arnhem', boardExpectation: 'Mid-table finish', morale: 52, form: 'LWWDL' },
                        { name: 'SV Terwolde', homeCity: 'Terwolde', boardExpectation: 'Mid-table finish', morale: 50, form: 'DLWWD' },
                        { name: 'VV Vilsteren', homeCity: 'Vilsteren', boardExpectation: 'Mid-table finish', morale: 48, form: 'WWDLW' },
                        { name: 'VV Voorst', homeCity: 'Voorst', boardExpectation: 'Mid-table finish', morale: 46, form: 'LWWDL' },
                        { name: 'SC Wesepe', homeCity: 'Wesepe', boardExpectation: 'Avoid relegation', morale: 42, form: 'LLDWL' },
                        { name: 'SV Wissel', homeCity: 'Arnhem', boardExpectation: 'Avoid relegation', morale: 40, form: 'LDLWL' },
                        { name: 'SV Zwolle', homeCity: 'Zwolle', boardExpectation: 'Avoid relegation', morale: 38, form: 'LLDLL' },
                    ];
                    _8 = 0, vijfdeKlasseEClubs_Oost_1 = vijfdeKlasseEClubs_Oost;
                    _63.label = 158;
                case 158:
                    if (!(_8 < vijfdeKlasseEClubs_Oost_1.length)) return [3 /*break*/, 161];
                    clubData = vijfdeKlasseEClubs_Oost_1[_8];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: vijfdeKlasseE_Zondag_Oost.id }),
                        })];
                case 159:
                    _63.sent();
                    _63.label = 160;
                case 160:
                    _8++;
                    return [3 /*break*/, 158];
                case 161:
                    console.log('Created Zondag Oost clubs successfully');
                    zondagWestLeagues = zondagLeagues.filter(function (l) { return l.region === 'Zondag West'; });
                    eersteKlasseA_Zondag = zondagWestLeagues.find(function (l) { return l.division === 'Eerste Klasse'; });
                    if (!eersteKlasseA_Zondag) return [3 /*break*/, 165];
                    eersteKlasseAClubs_West = [
                        { name: 'AFC \'34', homeCity: 'Amsterdam', boardExpectation: 'Promotion', morale: 75, form: 'WWWWD' },
                        { name: 'AGB', homeCity: 'Amsterdam', boardExpectation: 'Promotion', morale: 73, form: 'WWWDL' },
                        { name: 'VV Assendelft', homeCity: 'Assendelft', boardExpectation: 'Play-off spot', morale: 70, form: 'WWDLW' },
                        { name: 'Fortuna Wormerveer', homeCity: 'Wormerveer', boardExpectation: 'Play-off spot', morale: 68, form: 'WDLWW' },
                        { name: 'HBC', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 65, form: 'DLWWW' },
                        { name: 'SV Hillegom', homeCity: 'Hillegom', boardExpectation: 'Mid-table finish', morale: 63, form: 'LWWDL' },
                        { name: 'SV Hoofddorp', homeCity: 'Hoofddorp', boardExpectation: 'Mid-table finish', morale: 61, form: 'DLWWD' },
                        { name: 'IVV', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 59, form: 'WWDLW' },
                        { name: 'Kolping Boys', homeCity: 'Amsterdam', boardExpectation: 'Mid-table finish', morale: 57, form: 'LWWDL' },
                        { name: 'LSVV', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 53, form: 'LLDWL' },
                        { name: 'SV De Meer', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 51, form: 'LDLWL' },
                        { name: 'SDZ', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 49, form: 'LLDLL' },
                        { name: 'FC Uitgeest', homeCity: 'Uitgeest', boardExpectation: 'Avoid relegation', morale: 47, form: 'DLWLL' },
                        { name: 'Vitesse \'22', homeCity: 'Amsterdam', boardExpectation: 'Avoid relegation', morale: 45, form: 'LLDLL' },
                    ];
                    _9 = 0, eersteKlasseAClubs_West_1 = eersteKlasseAClubs_West;
                    _63.label = 162;
                case 162:
                    if (!(_9 < eersteKlasseAClubs_West_1.length)) return [3 /*break*/, 165];
                    clubData = eersteKlasseAClubs_West_1[_9];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { leagueId: eersteKlasseA_Zondag.id }),
                        })];
                case 163:
                    _63.sent();
                    _63.label = 164;
                case 164:
                    _9++;
                    return [3 /*break*/, 162];
                case 165:
                    console.log('Created Zondag West clubs successfully');
                    zondagZuid1Leagues = zondagLeagues.filter(function (l) { return l.region === 'Zondag Zuid 1'; });
                    eersteKlasseE_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Eerste Klasse'; });
                    if (!eersteKlasseE_ZondagZuid1) return [3 /*break*/, 169];
                    eersteKlasseEClubs_Zuid1 = [
                        { name: 'Almkerk', homeCity: 'Almkerk', regionTag: 'Zondag Zuid 1' },
                        { name: 'EFC', homeCity: 'Eersel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Emplina', homeCity: 'Empel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Erp', homeCity: 'Erp', regionTag: 'Zondag Zuid 1' },
                        { name: 'Moerse Boys', homeCity: 'Zundert', regionTag: 'Zondag Zuid 1' },
                        { name: 'RBC', homeCity: 'Roosendaal', regionTag: 'Zondag Zuid 1' },
                        { name: "SC 't Zand", homeCity: "Tilburg", regionTag: 'Zondag Zuid 1' },
                        { name: 'Sarto', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: "Sparta '25", homeCity: 'Beek en Donk', regionTag: 'Zondag Zuid 1' },
                        { name: 'SV TOP', homeCity: 'Oss', regionTag: 'Zondag Zuid 1' },
                        { name: 'TSC', homeCity: 'Oosterhout', regionTag: 'Zondag Zuid 1' },
                        { name: 'VOAB', homeCity: 'Goirle', regionTag: 'Zondag Zuid 1' },
                        { name: 'WNC', homeCity: 'Waardenburg', regionTag: 'Zondag Zuid 1' },
                    ];
                    _10 = 0, eersteKlasseEClubs_Zuid1_1 = eersteKlasseEClubs_Zuid1;
                    _63.label = 166;
                case 166:
                    if (!(_10 < eersteKlasseEClubs_Zuid1_1.length)) return [3 /*break*/, 169];
                    clubData = eersteKlasseEClubs_Zuid1_1[_10];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 60, form: '', leagueId: eersteKlasseE_ZondagZuid1.id }),
                        })];
                case 167:
                    _63.sent();
                    _63.label = 168;
                case 168:
                    _10++;
                    return [3 /*break*/, 166];
                case 169:
                    console.log('Created Zondag Zuid 1 clubs successfully');
                    tweedeKlasseC_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Tweede Klasse'; });
                    if (!tweedeKlasseC_ZondagZuid1) return [3 /*break*/, 173];
                    tweedeKlasseCClubs_Zuid1 = [
                        { name: 'Bavel', homeCity: 'Bavel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Beek Vooruit', homeCity: 'Beek', regionTag: 'Zondag Zuid 1' },
                        { name: 'CHC', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Cluzona', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'DOSKO', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'FC Engelen', homeCity: 'Engelen', regionTag: 'Zondag Zuid 1' },
                        { name: 'VV Gilze', homeCity: 'Gilze', regionTag: 'Zondag Zuid 1' },
                        { name: 'JEKA', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Roosendaal', homeCity: 'Roosendaal', regionTag: 'Zondag Zuid 1' },
                        { name: 'SvSSS', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Uno Animo', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: "Victoria '03", homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Zwaluw VFC', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                    ];
                    _11 = 0, tweedeKlasseCClubs_Zuid1_1 = tweedeKlasseCClubs_Zuid1;
                    _63.label = 170;
                case 170:
                    if (!(_11 < tweedeKlasseCClubs_Zuid1_1.length)) return [3 /*break*/, 173];
                    clubData = tweedeKlasseCClubs_Zuid1_1[_11];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 55, form: '', leagueId: tweedeKlasseC_ZondagZuid1.id }),
                        })];
                case 171:
                    _63.sent();
                    _63.label = 172;
                case 172:
                    _11++;
                    return [3 /*break*/, 170];
                case 173:
                    tweedeKlasseD_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Tweede Klasse'; });
                    if (!tweedeKlasseD_ZondagZuid1) return [3 /*break*/, 177];
                    tweedeKlasseDClubs_Zuid1 = [
                        { name: 'Bladella', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Brabantia', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'De Valk', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'FC Eindhoven AV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Geldrop', homeCity: 'Geldrop', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hilvaria', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'NWC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Oirschot Vooruit', homeCity: 'Oirschot', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKSV Heeze', homeCity: 'Heeze', regionTag: 'Zondag Zuid 1' },
                        { name: 'Reusel Sport/CoTrans', homeCity: 'Reusel', regionTag: 'Zondag Zuid 1' },
                        { name: "Wilhelmina '08", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'ZSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'SV Laar', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                    ];
                    _12 = 0, tweedeKlasseDClubs_Zuid1_1 = tweedeKlasseDClubs_Zuid1;
                    _63.label = 174;
                case 174:
                    if (!(_12 < tweedeKlasseDClubs_Zuid1_1.length)) return [3 /*break*/, 177];
                    clubData = tweedeKlasseDClubs_Zuid1_1[_12];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 55, form: '', leagueId: tweedeKlasseD_ZondagZuid1.id }),
                        })];
                case 175:
                    _63.sent();
                    _63.label = 176;
                case 176:
                    _12++;
                    return [3 /*break*/, 174];
                case 177:
                    console.log('Created Zondag Zuid 1 2e klasse clubs successfully');
                    derdeKlasseA_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseA_ZondagZuid1) return [3 /*break*/, 181];
                    derdeKlasseAClubs_Zuid1 = [
                        { name: 'BSC', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Breskens', homeCity: 'Breskens', regionTag: 'Zondag Zuid 1' },
                        { name: "HVV '24", homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hontenisse', homeCity: 'Hontenisse', regionTag: 'Zondag Zuid 1' },
                        { name: 'Rimboe', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Rood Wit W', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'SC Gastel', homeCity: 'Gastel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Schijf', homeCity: 'Schijf', regionTag: 'Zondag Zuid 1' },
                        { name: 'Steen', homeCity: 'Steen', regionTag: 'Zondag Zuid 1' },
                        { name: 'VVR', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Virtus', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Wernhout', homeCity: 'Wernhout', regionTag: 'Zondag Zuid 1' },
                        { name: 'Zundert', homeCity: 'Zundert', regionTag: 'Zondag Zuid 1' },
                    ];
                    _13 = 0, derdeKlasseAClubs_Zuid1_1 = derdeKlasseAClubs_Zuid1;
                    _63.label = 178;
                case 178:
                    if (!(_13 < derdeKlasseAClubs_Zuid1_1.length)) return [3 /*break*/, 181];
                    clubData = derdeKlasseAClubs_Zuid1_1[_13];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseA_ZondagZuid1.id }),
                        })];
                case 179:
                    _63.sent();
                    _63.label = 180;
                case 180:
                    _13++;
                    return [3 /*break*/, 178];
                case 181:
                    derdeKlasseB_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseB_ZondagZuid1) return [3 /*break*/, 185];
                    derdeKlasseBClubs_Zuid1 = [
                        { name: 'COAL', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'DIA', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'GSBW', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Groen Wit', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Madese Boys', homeCity: 'Made', regionTag: 'Zondag Zuid 1' },
                        { name: 'Oosterhout', homeCity: 'Oosterhout', regionTag: 'Zondag Zuid 1' },
                        { name: 'Rijen', homeCity: 'Rijen', regionTag: 'Zondag Zuid 1' },
                        { name: 'SC Emma', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'SV Reeshof', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'TSV Gudok', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Terheijden', homeCity: 'Terheijden', regionTag: 'Zondag Zuid 1' },
                        { name: 'VV Trinitas', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'WSJ', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'ZIGO', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                    ];
                    _14 = 0, derdeKlasseBClubs_Zuid1_1 = derdeKlasseBClubs_Zuid1;
                    _63.label = 182;
                case 182:
                    if (!(_14 < derdeKlasseBClubs_Zuid1_1.length)) return [3 /*break*/, 185];
                    clubData = derdeKlasseBClubs_Zuid1_1[_14];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseB_ZondagZuid1.id }),
                        })];
                case 183:
                    _63.sent();
                    _63.label = 184;
                case 184:
                    _14++;
                    return [3 /*break*/, 182];
                case 185:
                    derdeKlasseC_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseC_ZondagZuid1) return [3 /*break*/, 189];
                    derdeKlasseCClubs_Zuid1 = [
                        { name: 'Alem', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: "DBN '22", homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'DSC', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Den Dungen', homeCity: 'Den Dungen', regionTag: 'Zondag Zuid 1' },
                        { name: 'EVVC', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Haarsteeg', homeCity: 'Haarsteeg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Helvoirt', homeCity: 'Helvoirt', regionTag: 'Zondag Zuid 1' },
                        { name: 'Margriet', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Nieuwkuijk', homeCity: 'Nieuwkuijk', regionTag: 'Zondag Zuid 1' },
                        { name: 'Nooit Gedacht', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Nulandia', homeCity: 'Nuland', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKDVC', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Real Lunet', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: "SCG '18", homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                    ];
                    _15 = 0, derdeKlasseCClubs_Zuid1_1 = derdeKlasseCClubs_Zuid1;
                    _63.label = 186;
                case 186:
                    if (!(_15 < derdeKlasseCClubs_Zuid1_1.length)) return [3 /*break*/, 189];
                    clubData = derdeKlasseCClubs_Zuid1_1[_15];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseC_ZondagZuid1.id }),
                        })];
                case 187:
                    _63.sent();
                    _63.label = 188;
                case 188:
                    _15++;
                    return [3 /*break*/, 186];
                case 189:
                    derdeKlasseD_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseD_ZondagZuid1) return [3 /*break*/, 193];
                    derdeKlasseDClubs_Zuid1 = [
                        { name: 'Acht', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Beerse Boys', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Braakhuizen', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'DBS', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Gestel', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hoogeloon', homeCity: 'Hoogeloon', regionTag: 'Zondag Zuid 1' },
                        { name: 'Nijnsel', homeCity: 'Nijnsel', regionTag: 'Zondag Zuid 1' },
                        { name: 'PSV/av', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKVVO', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'RPC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Rood-Wit V', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'SBC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Vessem', homeCity: 'Vessem', regionTag: 'Zondag Zuid 1' },
                        { name: 'Wilhelmina Boys', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                    ];
                    _16 = 0, derdeKlasseDClubs_Zuid1_1 = derdeKlasseDClubs_Zuid1;
                    _63.label = 190;
                case 190:
                    if (!(_16 < derdeKlasseDClubs_Zuid1_1.length)) return [3 /*break*/, 193];
                    clubData = derdeKlasseDClubs_Zuid1_1[_16];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseD_ZondagZuid1.id }),
                        })];
                case 191:
                    _63.sent();
                    _63.label = 192;
                case 192:
                    _16++;
                    return [3 /*break*/, 190];
                case 193:
                    console.log('Created Zondag Zuid 1 3e klasse clubs successfully');
                    vierdeKlasseA_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseA_ZondagZuid1) return [3 /*break*/, 197];
                    vierdeKlasseAClubs_Zuid1 = [
                        { name: 'Clinge', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'DSE', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'De Markiezaten', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Grenswachters', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Groede', homeCity: 'Groede', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hoeven', homeCity: 'Hoeven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hulsterloo', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'ODIO', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Philippine', homeCity: 'Philippine', regionTag: 'Zondag Zuid 1' },
                        { name: 'RSV', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Sprundel', homeCity: 'Sprundel', regionTag: 'Zondag Zuid 1' },
                        { name: "WVV '67", homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                    ];
                    _17 = 0, vierdeKlasseAClubs_Zuid1_1 = vierdeKlasseAClubs_Zuid1;
                    _63.label = 194;
                case 194:
                    if (!(_17 < vierdeKlasseAClubs_Zuid1_1.length)) return [3 /*break*/, 197];
                    clubData = vierdeKlasseAClubs_Zuid1_1[_17];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseA_ZondagZuid1.id }),
                        })];
                case 195:
                    _63.sent();
                    _63.label = 196;
                case 196:
                    _17++;
                    return [3 /*break*/, 194];
                case 197:
                    vierdeKlasseB_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseB_ZondagZuid1) return [3 /*break*/, 201];
                    vierdeKlasseBClubs_Zuid1 = [
                        { name: 'Be Ready', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Chaam', homeCity: 'Chaam', regionTag: 'Zondag Zuid 1' },
                        { name: 'Dubbeldam', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'FC Right-Oh', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Gesta', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'HOVDJSCR', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'HWD', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Molenschot', homeCity: 'Molenschot', regionTag: 'Zondag Zuid 1' },
                        { name: "Neerlandia '31", homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'RCD', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Raamsdonk', homeCity: 'Raamsdonk', regionTag: 'Zondag Zuid 1' },
                        { name: 'TVC Breda', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: "WDS '19", homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Waspik', homeCity: 'Waspik', regionTag: 'Zondag Zuid 1' },
                    ];
                    _18 = 0, vierdeKlasseBClubs_Zuid1_1 = vierdeKlasseBClubs_Zuid1;
                    _63.label = 198;
                case 198:
                    if (!(_18 < vierdeKlasseBClubs_Zuid1_1.length)) return [3 /*break*/, 201];
                    clubData = vierdeKlasseBClubs_Zuid1_1[_18];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseB_ZondagZuid1.id }),
                        })];
                case 199:
                    _63.sent();
                    _63.label = 200;
                case 200:
                    _18++;
                    return [3 /*break*/, 198];
                case 201:
                    vierdeKlasseC_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseC_ZondagZuid1) return [3 /*break*/, 205];
                    vierdeKlasseCClubs_Zuid1 = [
                        { name: 'Baardwijk', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Berkdijk', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: "Blauw Wit '81", homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: "EDN'56", homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'FC Tilburg', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Jong Brabant', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKDSV', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Spoordonkse Boys', homeCity: 'Spoordonk', regionTag: 'Zondag Zuid 1' },
                        { name: 'Tuldania', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'VCB', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Viola', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                    ];
                    _19 = 0, vierdeKlasseCClubs_Zuid1_1 = vierdeKlasseCClubs_Zuid1;
                    _63.label = 202;
                case 202:
                    if (!(_19 < vierdeKlasseCClubs_Zuid1_1.length)) return [3 /*break*/, 205];
                    clubData = vierdeKlasseCClubs_Zuid1_1[_19];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseC_ZondagZuid1.id }),
                        })];
                case 203:
                    _63.sent();
                    _63.label = 204;
                case 204:
                    _19++;
                    return [3 /*break*/, 202];
                case 205:
                    vierdeKlasseD_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseD_ZondagZuid1) return [3 /*break*/, 209];
                    vierdeKlasseDClubs_Zuid1 = [
                        { name: 'BVV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'BMC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Buren', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'DVG', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Essche Boys', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: "HRC '14", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Maliskamp', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'ODC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKKSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKVSC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'SC Elshout', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Wilhelmina', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                    ];
                    _20 = 0, vierdeKlasseDClubs_Zuid1_1 = vierdeKlasseDClubs_Zuid1;
                    _63.label = 206;
                case 206:
                    if (!(_20 < vierdeKlasseDClubs_Zuid1_1.length)) return [3 /*break*/, 209];
                    clubData = vierdeKlasseDClubs_Zuid1_1[_20];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseD_ZondagZuid1.id }),
                        })];
                case 207:
                    _63.sent();
                    _63.label = 208;
                case 208:
                    _20++;
                    return [3 /*break*/, 206];
                case 209:
                    vierdeKlasseE_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseE_ZondagZuid1) return [3 /*break*/, 213];
                    vierdeKlasseEClubs_Zuid1 = [
                        { name: 'Bergeijk', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'DOSL', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'De Raven', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Dommelen', homeCity: 'Dommelen', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hapert', homeCity: 'Hapert', regionTag: 'Zondag Zuid 1' },
                        { name: 'Nederwetten', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Netersel', homeCity: 'Netersel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Nieuw Woensel', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Pusphaira', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKGSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: "Unitas '59", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Terlo', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'ZSC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                    ];
                    _21 = 0, vierdeKlasseEClubs_Zuid1_1 = vierdeKlasseEClubs_Zuid1;
                    _63.label = 210;
                case 210:
                    if (!(_21 < vierdeKlasseEClubs_Zuid1_1.length)) return [3 /*break*/, 213];
                    clubData = vierdeKlasseEClubs_Zuid1_1[_21];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseE_ZondagZuid1.id }),
                        })];
                case 211:
                    _63.sent();
                    _63.label = 212;
                case 212:
                    _21++;
                    return [3 /*break*/, 210];
                case 213:
                    console.log('Created Zondag Zuid 1 4e klasse clubs successfully');
                    vijfdeKlasseA_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseA_ZondagZuid1) return [3 /*break*/, 217];
                    vijfdeKlasseAClubs_Zuid1 = [
                        { name: "Berg '28", homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'Brunssum', homeCity: 'Brunssum', regionTag: 'Zondag Zuid 1' },
                        { name: 'DBSV', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'Geulsche Boys', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hellas', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'Partij', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKIVV', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKMVC', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKSVB', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'RKTSV', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: 'Wijnandia', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                        { name: "Zwart-Wit'19", homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 1' },
                    ];
                    _22 = 0, vijfdeKlasseAClubs_Zuid1_1 = vijfdeKlasseAClubs_Zuid1;
                    _63.label = 214;
                case 214:
                    if (!(_22 < vijfdeKlasseAClubs_Zuid1_1.length)) return [3 /*break*/, 217];
                    clubData = vijfdeKlasseAClubs_Zuid1_1[_22];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseA_ZondagZuid1.id }),
                        })];
                case 215:
                    _63.sent();
                    _63.label = 216;
                case 216:
                    _22++;
                    return [3 /*break*/, 214];
                case 217:
                    vijfdeKlasseB_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseB_ZondagZuid1) return [3 /*break*/, 221];
                    vijfdeKlasseBClubs_Zuid1 = [
                        { name: 'Advendo', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'DEVO', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'DIOZ', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Gloria-UC', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: "HZ '75", homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'Noordhoek', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: "OVV '67", homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'SAB', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'SVC', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'TPO', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                        { name: 'VCW', homeCity: 'Breda', regionTag: 'Zondag Zuid 1' },
                    ];
                    _23 = 0, vijfdeKlasseBClubs_Zuid1_1 = vijfdeKlasseBClubs_Zuid1;
                    _63.label = 218;
                case 218:
                    if (!(_23 < vijfdeKlasseBClubs_Zuid1_1.length)) return [3 /*break*/, 221];
                    clubData = vijfdeKlasseBClubs_Zuid1_1[_23];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseB_ZondagZuid1.id }),
                        })];
                case 219:
                    _63.sent();
                    _63.label = 220;
                case 220:
                    _23++;
                    return [3 /*break*/, 218];
                case 221:
                    vijfdeKlasseC_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseC_ZondagZuid1) return [3 /*break*/, 225];
                    vijfdeKlasseCClubs_Zuid1 = [
                        { name: 'BZS', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: "DSS '14", homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Dussense Boys', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'FC Drunen', homeCity: 'Drunen', regionTag: 'Zondag Zuid 1' },
                        { name: "HHC '09", homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hedel', homeCity: 'Hedel', regionTag: 'Zondag Zuid 1' },
                        { name: "MEC '07", homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Ophemert', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'SCZ', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Teisterbanders', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                        { name: 'Wadenoyen', homeCity: 'Tilburg', regionTag: 'Zondag Zuid 1' },
                    ];
                    _24 = 0, vijfdeKlasseCClubs_Zuid1_1 = vijfdeKlasseCClubs_Zuid1;
                    _63.label = 222;
                case 222:
                    if (!(_24 < vijfdeKlasseCClubs_Zuid1_1.length)) return [3 /*break*/, 225];
                    clubData = vijfdeKlasseCClubs_Zuid1_1[_24];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseC_ZondagZuid1.id }),
                        })];
                case 223:
                    _63.sent();
                    _63.label = 224;
                case 224:
                    _24++;
                    return [3 /*break*/, 222];
                case 225:
                    vijfdeKlasseD_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseD_ZondagZuid1) return [3 /*break*/, 229];
                    vijfdeKlasseDClubs_Zuid1 = [
                        { name: 'Audacia', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Boxtel', homeCity: 'Boxtel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Casteren', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: "De Bocht '80", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'HMVV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Hulsel', homeCity: 'Hulsel', regionTag: 'Zondag Zuid 1' },
                        { name: 'LSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Riel', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: "SDO '39", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'SVG', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'SVSOS', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Were Di', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                    ];
                    _25 = 0, vijfdeKlasseDClubs_Zuid1_1 = vijfdeKlasseDClubs_Zuid1;
                    _63.label = 226;
                case 226:
                    if (!(_25 < vijfdeKlasseDClubs_Zuid1_1.length)) return [3 /*break*/, 229];
                    clubData = vijfdeKlasseDClubs_Zuid1_1[_25];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseD_ZondagZuid1.id }),
                        })];
                case 227:
                    _63.sent();
                    _63.label = 228;
                case 228:
                    _25++;
                    return [3 /*break*/, 226];
                case 229:
                    vijfdeKlasseE_ZondagZuid1 = zondagZuid1Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseE_ZondagZuid1) return [3 /*break*/, 233];
                    vijfdeKlasseEClubs_Zuid1 = [
                        { name: 'De Weebosch', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'DEES', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: "DOSKO '32", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'DVS', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'EMK', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'FC Cranendonck', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Knegselse Boys', homeCity: 'Knegsel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Riethoven', homeCity: 'Riethoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'SV Tongelre', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Steensel', homeCity: 'Steensel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Sterksel', homeCity: 'Sterksel', regionTag: 'Zondag Zuid 1' },
                        { name: 'Tivoli', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                        { name: 'Waalre', homeCity: 'Waalre', regionTag: 'Zondag Zuid 1' },
                        { name: 'Woenselse Boys', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 1' },
                    ];
                    _26 = 0, vijfdeKlasseEClubs_Zuid1_1 = vijfdeKlasseEClubs_Zuid1;
                    _63.label = 230;
                case 230:
                    if (!(_26 < vijfdeKlasseEClubs_Zuid1_1.length)) return [3 /*break*/, 233];
                    clubData = vijfdeKlasseEClubs_Zuid1_1[_26];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseE_ZondagZuid1.id }),
                        })];
                case 231:
                    _63.sent();
                    _63.label = 232;
                case 232:
                    _26++;
                    return [3 /*break*/, 230];
                case 233:
                    console.log('Created Zondag Zuid 1 5e klasse clubs successfully');
                    zondagZuid2Leagues = zondagLeagues.filter(function (l) { return l.region === 'Zondag Zuid 2'; });
                    eersteKlasseE_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Eerste Klasse'; });
                    if (!eersteKlasseE_ZondagZuid2) return [3 /*break*/, 237];
                    eersteKlasseEClubs_Zuid2 = [
                        { name: 'Bekkerveld', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Boekel Sport', homeCity: 'Boekel', regionTag: 'Zondag Zuid 2' },
                        { name: 'Limburgia', homeCity: 'Brunssum', regionTag: 'Zondag Zuid 2' },
                        { name: 'Chevremont', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Deurne', homeCity: 'Deurne', regionTag: 'Zondag Zuid 2' },
                        { name: 'EFC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "GSV'28", homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Laar', homeCity: 'Laar', regionTag: 'Zondag Zuid 2' },
                        { name: "Sparta'25", homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'De Ster', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'SC Susteren', homeCity: 'Susteren', regionTag: 'Zondag Zuid 2' },
                        { name: 'De Valk', homeCity: 'Valkenburg', regionTag: 'Zondag Zuid 2' },
                        { name: 'Volharding', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                    ];
                    _27 = 0, eersteKlasseEClubs_Zuid2_1 = eersteKlasseEClubs_Zuid2;
                    _63.label = 234;
                case 234:
                    if (!(_27 < eersteKlasseEClubs_Zuid2_1.length)) return [3 /*break*/, 237];
                    clubData = eersteKlasseEClubs_Zuid2_1[_27];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 60, form: '', leagueId: eersteKlasseE_ZondagZuid2.id }),
                        })];
                case 235:
                    _63.sent();
                    _63.label = 236;
                case 236:
                    _27++;
                    return [3 /*break*/, 234];
                case 237:
                    tweedeKlasseD_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Tweede Klasse'; });
                    if (!tweedeKlasseD_ZondagZuid2) return [3 /*break*/, 241];
                    tweedeKlasseDClubs_Zuid2 = [
                        { name: "Avanti '31", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Bruheze', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Erp', homeCity: 'Erp', regionTag: 'Zondag Zuid 2' },
                        { name: 'Handel', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Heeze', homeCity: 'Heeze', regionTag: 'Zondag Zuid 2' },
                        { name: 'NWC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Oirschot Vooruit', homeCity: 'Oirschot', regionTag: 'Zondag Zuid 2' },
                        { name: "Olympia'18", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Rhode/VSB', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'RPC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SBC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Schijndel', homeCity: 'Schijndel', regionTag: 'Zondag Zuid 2' },
                        { name: 'Stiphout Vooruit', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'ZSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                    ];
                    _28 = 0, tweedeKlasseDClubs_Zuid2_1 = tweedeKlasseDClubs_Zuid2;
                    _63.label = 238;
                case 238:
                    if (!(_28 < tweedeKlasseDClubs_Zuid2_1.length)) return [3 /*break*/, 241];
                    clubData = tweedeKlasseDClubs_Zuid2_1[_28];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 55, form: '', leagueId: tweedeKlasseD_ZondagZuid2.id }),
                        })];
                case 239:
                    _63.sent();
                    _63.label = 240;
                case 240:
                    _28++;
                    return [3 /*break*/, 238];
                case 241:
                    tweedeKlasseE_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Tweede Klasse'; });
                    if (!tweedeKlasseE_ZondagZuid2) return [3 /*break*/, 245];
                    tweedeKlasseEClubs_Zuid2 = [
                        { name: 'Alfa Sport', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Budel', homeCity: 'Budel', regionTag: 'Zondag Zuid 2' },
                        { name: 'Caesar', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Geusselt Sport', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Maastricht West', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Merefeldia', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Minor', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'RVU', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Schaesberg', homeCity: 'Schaesberg', regionTag: 'Zondag Zuid 2' },
                        { name: 'SHH', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Someren', homeCity: 'Someren', regionTag: 'Zondag Zuid 2' },
                        { name: "Sportclub'25", homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Sporting Heerlen', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Veritas', homeCity: 'Heerlen', regionTag: 'Zondag Zuid 2' },
                    ];
                    _29 = 0, tweedeKlasseEClubs_Zuid2_1 = tweedeKlasseEClubs_Zuid2;
                    _63.label = 242;
                case 242:
                    if (!(_29 < tweedeKlasseEClubs_Zuid2_1.length)) return [3 /*break*/, 245];
                    clubData = tweedeKlasseEClubs_Zuid2_1[_29];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 55, form: '', leagueId: tweedeKlasseE_ZondagZuid2.id }),
                        })];
                case 243:
                    _63.sent();
                    _63.label = 244;
                case 244:
                    _29++;
                    return [3 /*break*/, 242];
                case 245:
                    console.log('Created Zondag Zuid 2 1e and 2e klasse clubs successfully');
                    derdeKlasseG_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseG_ZondagZuid2) return [3 /*break*/, 249];
                    derdeKlasseGClubs_Zuid2 = [
                        { name: 'Avesteyn', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'DSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "EGS'20", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Excellent', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Festilent', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Heeswijk', homeCity: 'Heeswijk', regionTag: 'Zondag Zuid 2' },
                        { name: 'Prinses Irene', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SES Langenboom', homeCity: 'Langenboom', regionTag: 'Zondag Zuid 2' },
                        { name: "SSS'18", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Venhorst', homeCity: 'Venhorst', regionTag: 'Zondag Zuid 2' },
                        { name: 'Vianen Vooruit', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Volkel', homeCity: 'Volkel', regionTag: 'Zondag Zuid 2' },
                    ];
                    _30 = 0, derdeKlasseGClubs_Zuid2_1 = derdeKlasseGClubs_Zuid2;
                    _63.label = 246;
                case 246:
                    if (!(_30 < derdeKlasseGClubs_Zuid2_1.length)) return [3 /*break*/, 249];
                    clubData = derdeKlasseGClubs_Zuid2_1[_30];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseG_ZondagZuid2.id }),
                        })];
                case 247:
                    _63.sent();
                    _63.label = 248;
                case 248:
                    _30++;
                    return [3 /*break*/, 246];
                case 249:
                    derdeKlasseH_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseH_ZondagZuid2) return [3 /*break*/, 253];
                    derdeKlasseHClubs_Zuid2 = [
                        { name: 'ELI', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Geldrop', homeCity: 'Geldrop', regionTag: 'Zondag Zuid 2' },
                        { name: 'Hegelsom', homeCity: 'Hegelsom', regionTag: 'Zondag Zuid 2' },
                        { name: 'Helden', homeCity: 'Helden', regionTag: 'Zondag Zuid 2' },
                        { name: 'HVV Helmond', homeCity: 'Helmond', regionTag: 'Zondag Zuid 2' },
                        { name: 'Lierop', homeCity: 'Lierop', regionTag: 'Zondag Zuid 2' },
                        { name: 'Mariahout', homeCity: 'Mariahout', regionTag: 'Zondag Zuid 2' },
                        { name: 'MMC Weert', homeCity: 'Weert', regionTag: 'Zondag Zuid 2' },
                        { name: 'Neerkandia', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "PEC'20", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKSVO', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "Sparta'18", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                    ];
                    _31 = 0, derdeKlasseHClubs_Zuid2_1 = derdeKlasseHClubs_Zuid2;
                    _63.label = 250;
                case 250:
                    if (!(_31 < derdeKlasseHClubs_Zuid2_1.length)) return [3 /*break*/, 253];
                    clubData = derdeKlasseHClubs_Zuid2_1[_31];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseH_ZondagZuid2.id }),
                        })];
                case 251:
                    _63.sent();
                    _63.label = 252;
                case 252:
                    _31++;
                    return [3 /*break*/, 250];
                case 253:
                    derdeKlasseI_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseI_ZondagZuid2) return [3 /*break*/, 257];
                    derdeKlasseIClubs_Zuid2 = [
                        { name: 'Baarlo', homeCity: 'Baarlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'SV Blerick', homeCity: 'Blerick', regionTag: 'Zondag Zuid 2' },
                        { name: 'VV DVO', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'FCV-Venlo', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Haslou', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'HBSV', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'VV HEBES', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Sportclub Irene', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Maasgouw', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKSVN', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'VV Sittard', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'Spaubeek', homeCity: 'Spaubeek', regionTag: 'Zondag Zuid 2' },
                        { name: 'Venlosche Boys', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                    ];
                    _32 = 0, derdeKlasseIClubs_Zuid2_1 = derdeKlasseIClubs_Zuid2;
                    _63.label = 254;
                case 254:
                    if (!(_32 < derdeKlasseIClubs_Zuid2_1.length)) return [3 /*break*/, 257];
                    clubData = derdeKlasseIClubs_Zuid2_1[_32];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseI_ZondagZuid2.id }),
                        })];
                case 255:
                    _63.sent();
                    _63.label = 256;
                case 256:
                    _32++;
                    return [3 /*break*/, 254];
                case 257:
                    derdeKlasseJ_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Derde Klasse'; });
                    if (!derdeKlasseJ_ZondagZuid2) return [3 /*break*/, 261];
                    derdeKlasseJClubs_Zuid2 = [
                        { name: 'Bunde', homeCity: 'Bunde', regionTag: 'Zondag Zuid 2' },
                        { name: 'Eijsden', homeCity: 'Eijsden', regionTag: 'Zondag Zuid 2' },
                        { name: 'Gulpen', homeCity: 'Gulpen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Heer', homeCity: 'Heer', regionTag: 'Zondag Zuid 2' },
                        { name: 'Hoensbroek', homeCity: 'Hoensbroek', regionTag: 'Zondag Zuid 2' },
                        { name: 'Hulsberg', homeCity: 'Hulsberg', regionTag: 'Zondag Zuid 2' },
                        { name: 'Jekerdal', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Langeberg', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKHSV', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKUVC', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Scharn', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Vaesrade', homeCity: 'Vaesrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Walram', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Weltania', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                    ];
                    _33 = 0, derdeKlasseJClubs_Zuid2_1 = derdeKlasseJClubs_Zuid2;
                    _63.label = 258;
                case 258:
                    if (!(_33 < derdeKlasseJClubs_Zuid2_1.length)) return [3 /*break*/, 261];
                    clubData = derdeKlasseJClubs_Zuid2_1[_33];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 50, form: '', leagueId: derdeKlasseJ_ZondagZuid2.id }),
                        })];
                case 259:
                    _63.sent();
                    _63.label = 260;
                case 260:
                    _33++;
                    return [3 /*break*/, 258];
                case 261:
                    console.log('Created Zondag Zuid 2 3e klasse clubs successfully');
                    vierdeKlasseA_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseA_ZondagZuid2) return [3 /*break*/, 265];
                    vierdeKlasseAClubs_Zuid2 = [
                        { name: 'FC Bemelen', homeCity: 'Bemelen', regionTag: 'Zondag Zuid 2' },
                        { name: 'BMR', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Daalhof', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Geertruidse Boys', homeCity: 'Geertruidenberg', regionTag: 'Zondag Zuid 2' },
                        { name: 'Keer', homeCity: 'Keer', regionTag: 'Zondag Zuid 2' },
                        { name: 'Leonidas-W', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKASV', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKVVM', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'SCG', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: "SNC'14", homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'SVME', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                        { name: 'Willem I', homeCity: 'Maastricht', regionTag: 'Zondag Zuid 2' },
                    ];
                    _34 = 0, vierdeKlasseAClubs_Zuid2_1 = vierdeKlasseAClubs_Zuid2;
                    _63.label = 262;
                case 262:
                    if (!(_34 < vierdeKlasseAClubs_Zuid2_1.length)) return [3 /*break*/, 265];
                    clubData = vierdeKlasseAClubs_Zuid2_1[_34];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseA_ZondagZuid2.id }),
                        })];
                case 263:
                    _63.sent();
                    _63.label = 264;
                case 264:
                    _34++;
                    return [3 /*break*/, 262];
                case 265:
                    vierdeKlasseB_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseB_ZondagZuid2) return [3 /*break*/, 269];
                    vierdeKlasseBClubs_Zuid2 = [
                        { name: 'Eikenderveld', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'FC Kerkrade-West', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'KVC Oranje', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'FC Landgraaf', homeCity: 'Landgraaf', regionTag: 'Zondag Zuid 2' },
                        { name: 'Laura-Hopel Combinatie', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKHBS', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Rood Groen LVC\'01', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Simpelveld', homeCity: 'Simpelveld', regionTag: 'Zondag Zuid 2' },
                        { name: "UOW'02", homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Vijlen', homeCity: 'Vijlen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Voerendaal', homeCity: 'Voerendaal', regionTag: 'Zondag Zuid 2' },
                        { name: 'WDZ', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                    ];
                    _35 = 0, vierdeKlasseBClubs_Zuid2_1 = vierdeKlasseBClubs_Zuid2;
                    _63.label = 266;
                case 266:
                    if (!(_35 < vierdeKlasseBClubs_Zuid2_1.length)) return [3 /*break*/, 269];
                    clubData = vierdeKlasseBClubs_Zuid2_1[_35];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseB_ZondagZuid2.id }),
                        })];
                case 267:
                    _63.sent();
                    _63.label = 268;
                case 268:
                    _35++;
                    return [3 /*break*/, 266];
                case 269:
                    vierdeKlasseC_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseC_ZondagZuid2) return [3 /*break*/, 273];
                    vierdeKlasseCClubs_Zuid2 = [
                        { name: 'Amstenrade', homeCity: 'Amstenrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'FC Geleen Zuid', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Geuldal', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Heksenberg-NEC', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'De Leeuw', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Lindenheuvel-Heidebloem Combinatie', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Neerbeek', homeCity: 'Neerbeek', regionTag: 'Zondag Zuid 2' },
                        { name: 'Olympia Schinveld', homeCity: 'Schinveld', regionTag: 'Zondag Zuid 2' },
                        { name: 'Schimmert', homeCity: 'Schimmert', regionTag: 'Zondag Zuid 2' },
                        { name: "Sporting Sittard '13", homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'Urmondia', homeCity: 'Urmond', regionTag: 'Zondag Zuid 2' },
                        { name: 'Woander Forest', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                    ];
                    _36 = 0, vierdeKlasseCClubs_Zuid2_1 = vierdeKlasseCClubs_Zuid2;
                    _63.label = 270;
                case 270:
                    if (!(_36 < vierdeKlasseCClubs_Zuid2_1.length)) return [3 /*break*/, 273];
                    clubData = vierdeKlasseCClubs_Zuid2_1[_36];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseC_ZondagZuid2.id }),
                        })];
                case 271:
                    _63.sent();
                    _63.label = 272;
                case 272:
                    _36++;
                    return [3 /*break*/, 270];
                case 273:
                    vierdeKlasseD_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseD_ZondagZuid2) return [3 /*break*/, 277];
                    vierdeKlasseDClubs_Zuid2 = [
                        { name: 'Born', homeCity: 'Born', regionTag: 'Zondag Zuid 2' },
                        { name: 'Haelen', homeCity: 'Haelen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Heythuysen', homeCity: 'Heythuysen', regionTag: 'Zondag Zuid 2' },
                        { name: 'IVS', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Leeuwen', homeCity: 'Leeuwen', regionTag: 'Zondag Zuid 2' },
                        { name: "Oranje Blauw '15", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'RIA', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Roerdalen', homeCity: 'Roerdalen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Roggel', homeCity: 'Roggel', regionTag: 'Zondag Zuid 2' },
                        { name: 'Roosteren', homeCity: 'Roosteren', regionTag: 'Zondag Zuid 2' },
                        { name: 'Slekker Boys', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: "SVH'39", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                    ];
                    _37 = 0, vierdeKlasseDClubs_Zuid2_1 = vierdeKlasseDClubs_Zuid2;
                    _63.label = 274;
                case 274:
                    if (!(_37 < vierdeKlasseDClubs_Zuid2_1.length)) return [3 /*break*/, 277];
                    clubData = vierdeKlasseDClubs_Zuid2_1[_37];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseD_ZondagZuid2.id }),
                        })];
                case 275:
                    _63.sent();
                    _63.label = 276;
                case 276:
                    _37++;
                    return [3 /*break*/, 274];
                case 277:
                    vierdeKlasseE_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseE_ZondagZuid2) return [3 /*break*/, 281];
                    vierdeKlasseEClubs_Zuid2 = [
                        { name: 'BEVO', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Brevendia', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "DFO'20", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'DOSL', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Liessel', homeCity: 'Liessel', regionTag: 'Zondag Zuid 2' },
                        { name: 'Maarheeze', homeCity: 'Maarheeze', regionTag: 'Zondag Zuid 2' },
                        { name: 'ODA', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'ONDO', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "Rood-Wit'67", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SPV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SSE', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SVSH', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                    ];
                    _38 = 0, vierdeKlasseEClubs_Zuid2_1 = vierdeKlasseEClubs_Zuid2;
                    _63.label = 278;
                case 278:
                    if (!(_38 < vierdeKlasseEClubs_Zuid2_1.length)) return [3 /*break*/, 281];
                    clubData = vierdeKlasseEClubs_Zuid2_1[_38];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseE_ZondagZuid2.id }),
                        })];
                case 279:
                    _63.sent();
                    _63.label = 280;
                case 280:
                    _38++;
                    return [3 /*break*/, 278];
                case 281:
                    vierdeKlasseF_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseF_ZondagZuid2) return [3 /*break*/, 285];
                    vierdeKlasseFClubs_Zuid2 = [
                        { name: 'Belfeldia', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'IVO', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Kessel', homeCity: 'Kessel', regionTag: 'Zondag Zuid 2' },
                        { name: 'Kronenberg', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Leunen', homeCity: 'Leunen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Melderslo', homeCity: 'Melderslo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Meterik', homeCity: 'Meterik', regionTag: 'Zondag Zuid 2' },
                        { name: 'MVC', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Reuver', homeCity: 'Reuver', regionTag: 'Zondag Zuid 2' },
                        { name: "SVOC'01", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Ysselsteyn', homeCity: 'Ysselsteyn', regionTag: 'Zondag Zuid 2' },
                    ];
                    _39 = 0, vierdeKlasseFClubs_Zuid2_1 = vierdeKlasseFClubs_Zuid2;
                    _63.label = 282;
                case 282:
                    if (!(_39 < vierdeKlasseFClubs_Zuid2_1.length)) return [3 /*break*/, 285];
                    clubData = vierdeKlasseFClubs_Zuid2_1[_39];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseF_ZondagZuid2.id }),
                        })];
                case 283:
                    _63.sent();
                    _63.label = 284;
                case 284:
                    _39++;
                    return [3 /*break*/, 282];
                case 285:
                    vierdeKlasseG_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseG_ZondagZuid2) return [3 /*break*/, 289];
                    vierdeKlasseGClubs_Zuid2 = [
                        { name: "ASV'33", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Braakhuizen', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Brandevoort', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'DVG', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Mifano', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Milheezer Boys', homeCity: 'Milheeze', regionTag: 'Zondag Zuid 2' },
                        { name: 'Nieuw Woensel', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SV Olland', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKGSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "Rood-wit'62", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'VOW', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                    ];
                    _40 = 0, vierdeKlasseGClubs_Zuid2_1 = vierdeKlasseGClubs_Zuid2;
                    _63.label = 286;
                case 286:
                    if (!(_40 < vierdeKlasseGClubs_Zuid2_1.length)) return [3 /*break*/, 289];
                    clubData = vierdeKlasseGClubs_Zuid2_1[_40];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseG_ZondagZuid2.id }),
                        })];
                case 287:
                    _63.sent();
                    _63.label = 288;
                case 288:
                    _40++;
                    return [3 /*break*/, 286];
                case 289:
                    vierdeKlasseH_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseH_ZondagZuid2) return [3 /*break*/, 293];
                    vierdeKlasseHClubs_Zuid2 = [
                        { name: 'Astrantia', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Constantia', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: "DWSH'18", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Hapse Boys', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'HBV', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Heijen', homeCity: 'Heijen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Juliana Mill', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Milsbeek', homeCity: 'Milsbeek', regionTag: 'Zondag Zuid 2' },
                        { name: 'MSH Maasduinen', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'SV United', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: "VIOS'38", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: "Vitesse'08", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                    ];
                    _41 = 0, vierdeKlasseHClubs_Zuid2_1 = vierdeKlasseHClubs_Zuid2;
                    _63.label = 290;
                case 290:
                    if (!(_41 < vierdeKlasseHClubs_Zuid2_1.length)) return [3 /*break*/, 293];
                    clubData = vierdeKlasseHClubs_Zuid2_1[_41];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseH_ZondagZuid2.id }),
                        })];
                case 291:
                    _63.sent();
                    _63.label = 292;
                case 292:
                    _41++;
                    return [3 /*break*/, 290];
                case 293:
                    console.log('Created Zondag Zuid 2 4e klasse clubs successfully');
                    vierdeKlasseI_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vierde Klasse'; });
                    if (!vierdeKlasseI_ZondagZuid2) return [3 /*break*/, 297];
                    vierdeKlasseIClubs_Zuid2 = [
                        { name: 'Achilles Reek', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'BMC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Herpinia', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Maliskamp', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Nooit Gedacht', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'FC de Rakt', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Schadewijk', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Uden', homeCity: 'Uden', regionTag: 'Zondag Zuid 2' },
                        { name: "Vesta'19", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'VITA VC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Vorstenbossche Boys', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'WEC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                    ];
                    _42 = 0, vierdeKlasseIClubs_Zuid2_1 = vierdeKlasseIClubs_Zuid2;
                    _63.label = 294;
                case 294:
                    if (!(_42 < vierdeKlasseIClubs_Zuid2_1.length)) return [3 /*break*/, 297];
                    clubData = vierdeKlasseIClubs_Zuid2_1[_42];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 45, form: '', leagueId: vierdeKlasseI_ZondagZuid2.id }),
                        })];
                case 295:
                    _63.sent();
                    _63.label = 296;
                case 296:
                    _42++;
                    return [3 /*break*/, 294];
                case 297:
                    vijfdeKlasseA_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseA_ZondagZuid2) return [3 /*break*/, 301];
                    vijfdeKlasseAClubs_Zuid2 = [
                        { name: "Berg '28", homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Brunssum', homeCity: 'Brunssum', regionTag: 'Zondag Zuid 2' },
                        { name: 'DBSV', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Geulsche Boys', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Hellas', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Partij', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKIVV', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKMVC', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKSVB', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKTSV', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: 'Wijnandia', homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                        { name: "Zwart-Wit'19", homeCity: 'Kerkrade', regionTag: 'Zondag Zuid 2' },
                    ];
                    _43 = 0, vijfdeKlasseAClubs_Zuid2_1 = vijfdeKlasseAClubs_Zuid2;
                    _63.label = 298;
                case 298:
                    if (!(_43 < vijfdeKlasseAClubs_Zuid2_1.length)) return [3 /*break*/, 301];
                    clubData = vijfdeKlasseAClubs_Zuid2_1[_43];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseA_ZondagZuid2.id }),
                        })];
                case 299:
                    _63.sent();
                    _63.label = 300;
                case 300:
                    _43++;
                    return [3 /*break*/, 298];
                case 301:
                    vijfdeKlasseB_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseB_ZondagZuid2) return [3 /*break*/, 305];
                    vijfdeKlasseBClubs_Zuid2 = [
                        { name: 'Abdissenbosch', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Argo', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Centrum Boys', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'SV De Dem', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Kakertse Boys', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'OVCS', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Passart-VKC', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Rimburg', homeCity: 'Rimburg', regionTag: 'Zondag Zuid 2' },
                        { name: 'Sanderbout', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Sporting HAC', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Munstergeleen', homeCity: 'Munstergeleen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Zwentibold', homeCity: 'Geleen', regionTag: 'Zondag Zuid 2' },
                    ];
                    _44 = 0, vijfdeKlasseBClubs_Zuid2_1 = vijfdeKlasseBClubs_Zuid2;
                    _63.label = 302;
                case 302:
                    if (!(_44 < vijfdeKlasseBClubs_Zuid2_1.length)) return [3 /*break*/, 305];
                    clubData = vijfdeKlasseBClubs_Zuid2_1[_44];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseB_ZondagZuid2.id }),
                        })];
                case 303:
                    _63.sent();
                    _63.label = 304;
                case 304:
                    _44++;
                    return [3 /*break*/, 302];
                case 305:
                    vijfdeKlasseC_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseC_ZondagZuid2) return [3 /*break*/, 309];
                    vijfdeKlasseCClubs_Zuid2 = [
                        { name: "Conventus'03", homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'Horn', homeCity: 'Horn', regionTag: 'Zondag Zuid 2' },
                        { name: 'Linne', homeCity: 'Linne', regionTag: 'Zondag Zuid 2' },
                        { name: "MBC'13", homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: "RIOS'31", homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKAVC', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKSVV', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKVB', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'Sint Joost', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'SNA', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                        { name: 'Susterse Boys', homeCity: 'Susteren', regionTag: 'Zondag Zuid 2' },
                        { name: 'SVC 2000', homeCity: 'Sittard', regionTag: 'Zondag Zuid 2' },
                    ];
                    _45 = 0, vijfdeKlasseCClubs_Zuid2_1 = vijfdeKlasseCClubs_Zuid2;
                    _63.label = 306;
                case 306:
                    if (!(_45 < vijfdeKlasseCClubs_Zuid2_1.length)) return [3 /*break*/, 309];
                    clubData = vijfdeKlasseCClubs_Zuid2_1[_45];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseC_ZondagZuid2.id }),
                        })];
                case 307:
                    _63.sent();
                    _63.label = 308;
                case 308:
                    _45++;
                    return [3 /*break*/, 306];
                case 309:
                    vijfdeKlasseD_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseD_ZondagZuid2) return [3 /*break*/, 313];
                    vijfdeKlasseDClubs_Zuid2 = [
                        { name: 'America', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Bieslo', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'DESM', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'DEV-Arcen', homeCity: 'Arcen', regionTag: 'Zondag Zuid 2' },
                        { name: 'Grashoek', homeCity: 'Grashoek', regionTag: 'Zondag Zuid 2' },
                        { name: 'Koningslust', homeCity: 'Koningslust', regionTag: 'Zondag Zuid 2' },
                        { name: 'Lottum - GFC\'33', homeCity: 'Lottum', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKDSO', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'RKMSV', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'DES Swalmen', homeCity: 'Swalmen', regionTag: 'Zondag Zuid 2' },
                        { name: "TSC'04", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: "VVV'03", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                    ];
                    _46 = 0, vijfdeKlasseDClubs_Zuid2_1 = vijfdeKlasseDClubs_Zuid2;
                    _63.label = 310;
                case 310:
                    if (!(_46 < vijfdeKlasseDClubs_Zuid2_1.length)) return [3 /*break*/, 313];
                    clubData = vijfdeKlasseDClubs_Zuid2_1[_46];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseD_ZondagZuid2.id }),
                        })];
                case 311:
                    _63.sent();
                    _63.label = 312;
                case 312:
                    _46++;
                    return [3 /*break*/, 310];
                case 313:
                    vijfdeKlasseE_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseE_ZondagZuid2) return [3 /*break*/, 317];
                    vijfdeKlasseEClubs_Zuid2 = [
                        { name: 'Bavos', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Boerdonk', homeCity: 'Boerdonk', regionTag: 'Zondag Zuid 2' },
                        { name: 'Boskant', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'De Braak', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Irene', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Keldonk', homeCity: 'Keldonk', regionTag: 'Zondag Zuid 2' },
                        { name: 'SV De Middenpeel', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'MVC', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Olympia Boys', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SCMH', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'SJVV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                    ];
                    _47 = 0, vijfdeKlasseEClubs_Zuid2_1 = vijfdeKlasseEClubs_Zuid2;
                    _63.label = 314;
                case 314:
                    if (!(_47 < vijfdeKlasseEClubs_Zuid2_1.length)) return [3 /*break*/, 317];
                    clubData = vijfdeKlasseEClubs_Zuid2_1[_47];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseE_ZondagZuid2.id }),
                        })];
                case 315:
                    _63.sent();
                    _63.label = 316;
                case 316:
                    _47++;
                    return [3 /*break*/, 314];
                case 317:
                    vijfdeKlasseF_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseF_ZondagZuid2) return [3 /*break*/, 321];
                    vijfdeKlasseFClubs_Zuid2 = [
                        { name: 'Achates', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: "BVV'27", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Holthees-Smakt', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'SV Merselo', homeCity: 'Merselo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Oostrum', homeCity: 'Oostrum', regionTag: 'Zondag Zuid 2' },
                        { name: "RESIA'42", homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Sambeek', homeCity: 'Sambeek', regionTag: 'Zondag Zuid 2' },
                        { name: 'SIOL', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'Stevensbeek', homeCity: 'Stevensbeek', regionTag: 'Zondag Zuid 2' },
                        { name: 'Toxandria', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                        { name: 'De Zwaluw', homeCity: 'Venlo', regionTag: 'Zondag Zuid 2' },
                    ];
                    _48 = 0, vijfdeKlasseFClubs_Zuid2_1 = vijfdeKlasseFClubs_Zuid2;
                    _63.label = 318;
                case 318:
                    if (!(_48 < vijfdeKlasseFClubs_Zuid2_1.length)) return [3 /*break*/, 321];
                    clubData = vijfdeKlasseFClubs_Zuid2_1[_48];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseF_ZondagZuid2.id }),
                        })];
                case 319:
                    _63.sent();
                    _63.label = 320;
                case 320:
                    _48++;
                    return [3 /*break*/, 318];
                case 321:
                    vijfdeKlasseG_ZondagZuid2 = zondagZuid2Leagues.find(function (l) { return l.division === 'Vijfde Klasse'; });
                    if (!vijfdeKlasseG_ZondagZuid2) return [3 /*break*/, 325];
                    vijfdeKlasseGClubs_Zuid2 = [
                        { name: 'Cito', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'DESO', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Gassel', homeCity: 'Gassel', regionTag: 'Zondag Zuid 2' },
                        { name: 'Sportclub Loosbroek', homeCity: 'Loosbroek', regionTag: 'Zondag Zuid 2' },
                        { name: 'Maaskantse Boys', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "MOSA'14", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: "NLC'03", homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Odiliapeel', homeCity: 'Odiliapeel', regionTag: 'Zondag Zuid 2' },
                        { name: 'OKSV', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'Ruwaard', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                        { name: 'VCO', homeCity: 'Eindhoven', regionTag: 'Zondag Zuid 2' },
                    ];
                    _49 = 0, vijfdeKlasseGClubs_Zuid2_1 = vijfdeKlasseGClubs_Zuid2;
                    _63.label = 322;
                case 322:
                    if (!(_49 < vijfdeKlasseGClubs_Zuid2_1.length)) return [3 /*break*/, 325];
                    clubData = vijfdeKlasseGClubs_Zuid2_1[_49];
                    return [4 /*yield*/, prisma.club.create({
                            data: __assign(__assign({}, clubData), { boardExpectation: 'Mid-table finish', morale: 40, form: '', leagueId: vijfdeKlasseG_ZondagZuid2.id }),
                        })];
                case 323:
                    _63.sent();
                    _63.label = 324;
                case 324:
                    _49++;
                    return [3 /*break*/, 322];
                case 325:
                    console.log('Created Zondag Zuid 2 4e klasse I and 5e klasse clubs successfully');
                    console.log('Database seeded successfully with Dutch regional league structure!');
                    // --- Create Players for Clubs ---
                    console.log('Creating players for clubs...');
                    return [4 /*yield*/, prisma.club.findMany()];
                case 326:
                    allClubs = _63.sent();
                    _50 = 0, allClubs_1 = allClubs;
                    _63.label = 327;
                case 327:
                    if (!(_50 < allClubs_1.length)) return [3 /*break*/, 332];
                    club = allClubs_1[_50];
                    playerCount = Math.floor(Math.random() * 6) + 20;
                    positions = ['GK', 'DEF', 'MID', 'FWD'];
                    nationalities = ['Netherlands', 'Germany', 'England', 'Belgium', 'France', 'Spain', 'Italy', 'Brazil', 'Argentina'];
                    i = 0;
                    _63.label = 328;
                case 328:
                    if (!(i < playerCount)) return [3 /*break*/, 331];
                    position = positions[Math.floor(Math.random() * positions.length)];
                    nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
                    age = Math.floor(Math.random() * 23) + 18;
                    skill = Math.floor(Math.random() * 40) + 40;
                    wage = Math.floor(Math.random() * 50000) + 10000;
                    firstName = void 0, lastName = void 0;
                    if (nationality === 'Netherlands') {
                        dutchFirstNames = ['Jan', 'Piet', 'Klaas', 'Henk', 'Willem', 'Johan', 'Marco', 'Ruud', 'Dennis', 'Patrick', 'Frank', 'Ronald', 'Edwin', 'Jaap', 'Clarence'];
                        dutchLastNames = ['de Vries', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Dijk', 'Jansen', 'van der Berg'];
                        firstName = dutchFirstNames[Math.floor(Math.random() * dutchFirstNames.length)];
                        lastName = dutchLastNames[Math.floor(Math.random() * dutchLastNames.length)];
                    }
                    else if (nationality === 'Germany') {
                        germanFirstNames = ['Hans', 'Klaus', 'Wolfgang', 'Michael', 'Thomas', 'Andreas', 'Stefan', 'Christian', 'Matthias', 'Jürgen', 'Manuel', 'Toni', 'Leroy', 'Joshua'];
                        germanLastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein'];
                        firstName = germanFirstNames[Math.floor(Math.random() * germanFirstNames.length)];
                        lastName = germanLastNames[Math.floor(Math.random() * germanLastNames.length)];
                    }
                    else if (nationality === 'England') {
                        englishFirstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark'];
                        englishLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
                        firstName = englishFirstNames[Math.floor(Math.random() * englishFirstNames.length)];
                        lastName = englishLastNames[Math.floor(Math.random() * englishLastNames.length)];
                    }
                    else {
                        genericFirstNames = ['Alex', 'Carlos', 'Miguel', 'Lucas', 'Diego', 'Sergio', 'Marco', 'Antonio', 'Giuseppe', 'Marco', 'Pierre', 'Jean', 'François', 'Lucas', 'Thomas'];
                        genericLastNames = ['Silva', 'Santos', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues', 'Martins', 'Ferreira', 'Ribeiro', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Gomes'];
                        firstName = genericFirstNames[Math.floor(Math.random() * genericFirstNames.length)];
                        lastName = genericLastNames[Math.floor(Math.random() * genericLastNames.length)];
                    }
                    playerName = "".concat(firstName, " ").concat(lastName);
                    contractExpiry = new Date();
                    contractExpiry.setFullYear(contractExpiry.getFullYear() + Math.floor(Math.random() * 5) + 1);
                    return [4 /*yield*/, prisma.player.create({
                            data: {
                                name: playerName,
                                clubId: club.id,
                                position: position,
                                skill: skill,
                                age: age,
                                nationality: nationality,
                                morale: Math.floor(Math.random() * 30) + 60, // 60-90 morale
                                injured: false,
                                internationalCaps: 0,
                                onInternationalDuty: false,
                                wage: wage,
                                contractExpiry: contractExpiry,
                            },
                        })];
                case 329:
                    _63.sent();
                    _63.label = 330;
                case 330:
                    i++;
                    return [3 /*break*/, 328];
                case 331:
                    _50++;
                    return [3 /*break*/, 327];
                case 332:
                    console.log("Created players for ".concat(allClubs.length, " clubs"));
                    return [4 /*yield*/, prisma.nationalTeam.create({
                            data: {
                                name: 'Netherlands',
                                code: 'NED',
                                region: 'Europe',
                                ranking: 7,
                                reputation: 90,
                            },
                        })];
                case 333:
                    netherlands = _63.sent();
                    return [4 /*yield*/, prisma.nationalTeam.create({
                            data: {
                                name: 'Germany',
                                code: 'GER',
                                region: 'Europe',
                                ranking: 3,
                                reputation: 92,
                            },
                        })];
                case 334:
                    germany = _63.sent();
                    return [4 /*yield*/, prisma.nationalTeam.create({
                            data: {
                                name: 'England',
                                code: 'ENG',
                                region: 'Europe',
                                ranking: 4,
                                reputation: 91,
                            },
                        })];
                case 335:
                    england = _63.sent();
                    return [4 /*yield*/, prisma.player.findMany({
                            where: { club: { name: 'AFC Ajax' } },
                            take: 5,
                        })];
                case 336:
                    ajaxPlayers = _63.sent();
                    _51 = 0, ajaxPlayers_1 = ajaxPlayers;
                    _63.label = 337;
                case 337:
                    if (!(_51 < ajaxPlayers_1.length)) return [3 /*break*/, 340];
                    p = ajaxPlayers_1[_51];
                    return [4 /*yield*/, prisma.internationalPlayer.create({
                            data: {
                                playerId: p.id,
                                nationalTeamId: netherlands.id,
                                caps: Math.floor(Math.random() * 30),
                                goals: Math.floor(Math.random() * 10),
                                isActive: true,
                            },
                        })];
                case 338:
                    _63.sent();
                    _63.label = 339;
                case 339:
                    _51++;
                    return [3 /*break*/, 337];
                case 340: return [4 /*yield*/, prisma.player.findMany({ where: { club: { name: 'PSV Eindhoven' } }, take: 3 })];
                case 341:
                    psvPlayers = _63.sent();
                    _52 = 0, psvPlayers_1 = psvPlayers;
                    _63.label = 342;
                case 342:
                    if (!(_52 < psvPlayers_1.length)) return [3 /*break*/, 345];
                    p = psvPlayers_1[_52];
                    return [4 /*yield*/, prisma.internationalPlayer.create({
                            data: {
                                playerId: p.id,
                                nationalTeamId: netherlands.id,
                                caps: Math.floor(Math.random() * 20),
                                goals: Math.floor(Math.random() * 5),
                                isActive: true,
                            },
                        })];
                case 343:
                    _63.sent();
                    _63.label = 344;
                case 344:
                    _52++;
                    return [3 /*break*/, 342];
                case 345: return [4 /*yield*/, prisma.player.findMany({ where: { club: { name: 'Feyenoord' } }, take: 4 })];
                case 346:
                    feyenoordPlayers = _63.sent();
                    _53 = 0, feyenoordPlayers_1 = feyenoordPlayers;
                    _63.label = 347;
                case 347:
                    if (!(_53 < feyenoordPlayers_1.length)) return [3 /*break*/, 350];
                    p = feyenoordPlayers_1[_53];
                    return [4 /*yield*/, prisma.internationalPlayer.create({
                            data: {
                                playerId: p.id,
                                nationalTeamId: germany.id,
                                caps: Math.floor(Math.random() * 25),
                                goals: Math.floor(Math.random() * 8),
                                isActive: true,
                            },
                        })];
                case 348:
                    _63.sent();
                    _63.label = 349;
                case 349:
                    _53++;
                    return [3 /*break*/, 347];
                case 350: return [4 /*yield*/, prisma.player.findMany({ where: { club: { name: 'AZ Alkmaar' } }, take: 4 })];
                case 351:
                    azPlayers = _63.sent();
                    _54 = 0, azPlayers_1 = azPlayers;
                    _63.label = 352;
                case 352:
                    if (!(_54 < azPlayers_1.length)) return [3 /*break*/, 355];
                    p = azPlayers_1[_54];
                    return [4 /*yield*/, prisma.internationalPlayer.create({
                            data: {
                                playerId: p.id,
                                nationalTeamId: england.id,
                                caps: Math.floor(Math.random() * 18),
                                goals: Math.floor(Math.random() * 6),
                                isActive: true,
                            },
                        })];
                case 353:
                    _63.sent();
                    _63.label = 354;
                case 354:
                    _54++;
                    return [3 /*break*/, 352];
                case 355: 
                // Create a sample international match (Netherlands vs Germany)
                return [4 /*yield*/, prisma.internationalMatch.create({
                        data: {
                            homeTeamId: netherlands.id,
                            awayTeamId: germany.id,
                            date: new Date(),
                            homeGoals: 2,
                            awayGoals: 1,
                            played: true,
                            matchType: 'FRIENDLY',
                            homeFormation: '4-3-3',
                            awayFormation: '4-2-3-1',
                            homeStrategy: 'Balanced',
                            awayStrategy: 'Attacking',
                            events: {
                                create: [
                                    { type: 'GOAL', minute: 12, description: 'GOAL! Ajax player scores for Netherlands', playerName: (_59 = ajaxPlayers[0]) === null || _59 === void 0 ? void 0 : _59.name, teamId: netherlands.id, isHomeTeam: true },
                                    { type: 'GOAL', minute: 44, description: 'GOAL! Feyenoord player scores for Germany', playerName: (_60 = feyenoordPlayers[0]) === null || _60 === void 0 ? void 0 : _60.name, teamId: germany.id, isHomeTeam: false },
                                    { type: 'GOAL', minute: 78, description: 'GOAL! PSV player scores for Netherlands', playerName: (_61 = psvPlayers[0]) === null || _61 === void 0 ? void 0 : _61.name, teamId: netherlands.id, isHomeTeam: true },
                                    { type: 'NEAR_MISS', minute: 85, description: 'AZ player hits the post for England', playerName: (_62 = azPlayers[0]) === null || _62 === void 0 ? void 0 : _62.name, teamId: england.id, isHomeTeam: false },
                                ],
                            },
                        },
                    })];
                case 356:
                    // Create a sample international match (Netherlands vs Germany)
                    _63.sent();
                    console.log('Seeded international teams, players, and a sample match');
                    // --- Generate Fixtures ---
                    console.log('Generating season fixtures...');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../src/services/fixtureSchedulerService'); })];
                case 357:
                    FixtureSchedulerService = (_63.sent()).FixtureSchedulerService;
                    // Generate complete season schedule
                    return [4 /*yield*/, FixtureSchedulerService.generateSeasonSchedule()];
                case 358:
                    // Generate complete season schedule
                    _63.sent();
                    console.log('Season fixtures generated successfully!');
                    return [4 /*yield*/, prisma.league.create({
                            data: { name: 'O21 Divisie 1', tier: 'O21_TOP', season: '2024-2025' }
                        })];
                case 359:
                    o21Div1 = _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: { name: 'O21 Divisie 2', tier: 'O21_2', season: '2024-2025' }
                        })];
                case 360:
                    o21Div2 = _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: { name: 'O21 Divisie 3', tier: 'O21_3', season: '2024-2025' }
                        })];
                case 361:
                    o21Div3 = _63.sent();
                    return [4 /*yield*/, prisma.league.create({
                            data: { name: 'O21 Divisie 4', tier: 'O21_4', season: '2024-2025' }
                        })];
                case 362:
                    o21Div4 = _63.sent();
                    eersteDivisieClubs = [
                        { name: 'ADO Den Haag', homeCity: 'The Hague', stadium: 'ADO Den Haag Stadium', capacity: 15000 },
                        { name: 'De Graafschap', homeCity: 'Doetinchem', stadium: 'Stadion De Vijverberg', capacity: 12600 },
                        { name: 'Excelsior Rotterdam', homeCity: 'Rotterdam', stadium: 'Van Donge & De Roo Stadion', capacity: 4500 },
                        { name: 'FC Den Bosch', homeCity: "'s-Hertogenbosch", stadium: 'Stadion De Vliert', capacity: 8713 },
                        { name: 'FC Dordrecht', homeCity: 'Dordrecht', stadium: 'Stadion Krommedijk', capacity: 4235 },
                        { name: 'FC Eindhoven', homeCity: 'Eindhoven', stadium: 'Jan Louwers Stadion', capacity: 4600 },
                        { name: 'FC Emmen', homeCity: 'Emmen', stadium: 'De Oude Meerdijk', capacity: 8600 },
                        { name: 'FC Volendam', homeCity: 'Volendam', stadium: 'Kras Stadion', capacity: 6984 },
                        { name: 'Helmond Sport', homeCity: 'Helmond', stadium: 'GS Staalwerken Stadion', capacity: 4142 },
                        { name: 'Jong Ajax', homeCity: 'Amsterdam', stadium: 'Sportpark De Toekomst', capacity: 2050, isJongTeam: true, parentClub: 'AFC Ajax' },
                        { name: 'Jong AZ', homeCity: 'Alkmaar', stadium: 'AFAS Trainingscomplex [nl]', capacity: 200, isJongTeam: true, parentClub: 'AZ Alkmaar' },
                        { name: 'Jong FC Utrecht', homeCity: 'Utrecht', stadium: 'Sportcomplex Zoudenbalch', capacity: 550, isJongTeam: true, parentClub: 'FC Utrecht' },
                        { name: 'Jong PSV', homeCity: 'Eindhoven', stadium: 'De Herdgang', capacity: 2500, isJongTeam: true, parentClub: 'PSV Eindhoven' },
                        { name: 'MVV Maastricht', homeCity: 'Maastricht', stadium: 'Stadion De Geusselt', capacity: 10000 },
                        { name: 'Roda JC Kerkrade', homeCity: 'Kerkrade', stadium: 'Parkstad Limburg Stadion', capacity: 19979 },
                        { name: 'SBV Vitesse', homeCity: 'Arnhem', stadium: 'Gelredome', capacity: 21248 },
                        { name: 'SC Cambuur', homeCity: 'Leeuwarden', stadium: 'Cambuur Stadion', capacity: 10500 },
                        { name: 'Telstar', homeCity: 'Velsen', stadium: '711 Stadion', capacity: 3060 },
                        { name: 'TOP Oss', homeCity: 'Oss', stadium: 'Frans Heesen Stadion', capacity: 4560 },
                        { name: 'VVV-Venlo', homeCity: 'Venlo', stadium: 'De Koel', capacity: 8000 }
                    ];
                    // Remove all existing Eerste Divisie clubs and re-add only the above
                    return [4 /*yield*/, prisma.club.deleteMany({ where: { leagueId: eersteDivisie.id } })];
                case 363:
                    // Remove all existing Eerste Divisie clubs and re-add only the above
                    _63.sent();
                    clubNameToId = {};
                    _55 = 0, eersteDivisieClubs_1 = eersteDivisieClubs;
                    _63.label = 364;
                case 364:
                    if (!(_55 < eersteDivisieClubs_1.length)) return [3 /*break*/, 370];
                    club = eersteDivisieClubs_1[_55];
                    if (!club.parentClub) return [3 /*break*/, 366];
                    return [4 /*yield*/, prisma.club.findFirst({ where: { name: club.parentClub } })];
                case 365:
                    _56 = _63.sent();
                    return [3 /*break*/, 367];
                case 366:
                    _56 = null;
                    _63.label = 367;
                case 367:
                    parentClub = _56;
                    return [4 /*yield*/, prisma.club.create({
                            data: {
                                name: club.name,
                                homeCity: club.homeCity,
                                leagueId: eersteDivisie.id,
                                boardExpectation: club.isJongTeam ? 'Develop players' : 'Compete',
                                morale: 70,
                                form: '',
                                isJongTeam: !!club.isJongTeam,
                                parentClubId: parentClub ? parentClub.id : undefined,
                                noSameDivisionAsParent: !!club.isJongTeam
                            }
                        })];
                case 368:
                    created = _63.sent();
                    clubNameToId[club.name] = created.id;
                    _63.label = 369;
                case 369:
                    _55++;
                    return [3 /*break*/, 364];
                case 370:
                    tweedeDivisieJongTeams = [
                        { name: 'Jong Sparta', parentClub: 'Sparta Rotterdam' },
                        { name: 'Jong Volendam', parentClub: 'FC Volendam' }
                    ];
                    _57 = 0, tweedeDivisieJongTeams_1 = tweedeDivisieJongTeams;
                    _63.label = 371;
                case 371:
                    if (!(_57 < tweedeDivisieJongTeams_1.length)) return [3 /*break*/, 375];
                    jong = tweedeDivisieJongTeams_1[_57];
                    return [4 /*yield*/, prisma.club.findFirst({ where: { name: jong.parentClub } })];
                case 372:
                    parent_1 = _63.sent();
                    return [4 /*yield*/, prisma.club.create({
                            data: {
                                name: jong.name,
                                homeCity: (parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.homeCity) || '',
                                leagueId: tweedeDivisie.id,
                                boardExpectation: 'Develop players',
                                morale: 70,
                                form: '',
                                isJongTeam: true,
                                parentClubId: parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.id,
                                noSameDivisionAsParent: true
                            }
                        })];
                case 373:
                    _63.sent();
                    _63.label = 374;
                case 374:
                    _57++;
                    return [3 /*break*/, 371];
                case 375:
                    o21JongTeams = [
                        { name: 'Jong Feyenoord', parentClub: 'Feyenoord', division: o21Div1.id },
                        { name: 'Jong Heerenveen', parentClub: 'SC Heerenveen', division: o21Div1.id },
                        { name: 'Jong Groningen', parentClub: 'FC Groningen', division: o21Div1.id },
                        { name: 'Jong Twente', parentClub: 'FC Twente', division: o21Div2.id },
                        { name: 'Jong Willem II', parentClub: 'Willem II', division: o21Div2.id },
                        { name: 'Jong NEC', parentClub: 'NEC', division: o21Div2.id },
                        { name: 'Jong Fortuna Sittard', parentClub: 'Fortuna Sittard', division: o21Div3.id },
                        { name: 'Jong Go Ahead Eagles', parentClub: 'Go Ahead Eagles', division: o21Div3.id },
                        { name: 'Jong Heracles', parentClub: 'Heracles Almelo', division: o21Div3.id },
                        { name: 'Jong PEC Zwolle', parentClub: 'PEC Zwolle', division: o21Div4.id },
                        { name: 'Jong Almere City', parentClub: 'Almere City', division: o21Div4.id },
                        { name: 'Jong RKC', parentClub: 'RKC Waalwijk', division: o21Div4.id }
                    ];
                    _58 = 0, o21JongTeams_1 = o21JongTeams;
                    _63.label = 376;
                case 376:
                    if (!(_58 < o21JongTeams_1.length)) return [3 /*break*/, 380];
                    jong = o21JongTeams_1[_58];
                    return [4 /*yield*/, prisma.club.findFirst({ where: { name: jong.parentClub } })];
                case 377:
                    parent_2 = _63.sent();
                    return [4 /*yield*/, prisma.club.create({
                            data: {
                                name: jong.name,
                                homeCity: (parent_2 === null || parent_2 === void 0 ? void 0 : parent_2.homeCity) || '',
                                leagueId: jong.division,
                                boardExpectation: 'Develop players',
                                morale: jong.name === 'Jong Feyenoord' ? 80 : 70,
                                form: '',
                                isJongTeam: true,
                                parentClubId: parent_2 === null || parent_2 === void 0 ? void 0 : parent_2.id,
                                noSameDivisionAsParent: true
                            }
                        })];
                case 378:
                    _63.sent();
                    _63.label = 379;
                case 379:
                    _58++;
                    return [3 /*break*/, 376];
                case 380: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
