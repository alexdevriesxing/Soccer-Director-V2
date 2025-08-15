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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const test_utils_1 = require("../test-utils");
// Global test setup
const prisma = new client_1.PrismaClient();
global.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Connect to the test database
    yield prisma.$connect();
    // Clear the test database before all tests
    yield (0, test_utils_1.clearDatabase)(prisma);
}));
global.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Disconnect from the test database after all tests
    yield prisma.$disconnect();
}));
// Add global test utilities
global.prisma = prisma;
