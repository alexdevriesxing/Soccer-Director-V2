"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const competitionController_1 = require("../controllers/competitionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', competitionController_1.competitionController.getActiveCompetitions);
router.get('/:competitionId', competitionController_1.competitionController.getCompetition);
router.get('/:competitionId/table', competitionController_1.competitionController.getLeagueTable);
router.get('/:competitionId/fixtures', competitionController_1.competitionController.getFixtures);
// Protected routes (require authentication)
router.post('/:competitionId/fixtures/generate', auth_1.authenticateToken, competitionController_1.competitionController.generateFixtures);
exports.default = router;
