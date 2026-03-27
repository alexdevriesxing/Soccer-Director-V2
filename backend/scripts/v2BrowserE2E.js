#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');

const FRONTEND_URL = (process.env.V2_E2E_FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
const BACKEND_URL = (process.env.V2_E2E_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
const HEADLESS = process.env.V2_E2E_HEADLESS !== 'false';
const SCENARIO = String(process.env.V2_E2E_SCENARIO || 'default');
const ROUTES = {
  newCareer: '/new-career',
  hq: '/hq',
  pulse: '/club-pulse',
  weekPlanner: '/week-planner',
  inbox: '/inbox',
  saveLoad: '/save-load',
  standings: '/standings',
  squad: '/career-squad',
  finances: '/career-finances',
  matchCenterPrefix: '/match-center/',
  postMatchPrefix: '/post-match/'
};

const SCENARIOS = {
  default: {
    name: 'default',
    description: 'Primary weekly loop flow from planner to next-week planning.',
    requireEventDecisions: true
  },
  'lower-tier-rollover': {
    name: 'lower-tier-rollover',
    description: 'Lower-tier career selection plus forced season rollover validation.',
    requireEventDecisions: false
  }
};

if (!Object.prototype.hasOwnProperty.call(SCENARIOS, SCENARIO)) {
  console.error(`[v2-e2e] Unknown scenario: ${SCENARIO}`);
  console.error(`[v2-e2e] Supported scenarios: ${Object.keys(SCENARIOS).join(', ')}`);
  process.exit(1);
}

const OUTPUT_ROOT = path.resolve(__dirname, '..', '..', 'output', 'v2-browser-e2e');
const OUTPUT_DIR = path.join(OUTPUT_ROOT, SCENARIO.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase());

const report = {
  startedAt: new Date().toISOString(),
  finishedAt: null,
  scenario: SCENARIO,
  status: 'running',
  urls: {
    frontend: FRONTEND_URL,
    backend: BACKEND_URL
  },
  selectedClub: null,
  careerId: null,
  initialSeason: null,
  initialWeek: null,
  finalSeason: null,
  finalWeek: null,
  finalPhase: null,
  rollover: {
    forcedAtWeek: null,
    maxWeek: null,
    seasonBeforeAdvance: null,
    seasonAfterAdvance: null,
    advancedToWeek: null,
    advancedToPhase: null
  },
  resolvedEvents: 0,
  screenshots: [],
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  error: null
};

let screenshotIndex = 0;
const expectedConsoleErrors = [];

function expectConsoleError(pattern, ttlMs = 15000) {
  expectedConsoleErrors.push({
    pattern,
    expiresAt: Date.now() + ttlMs
  });
}

function consumeExpectedConsoleError(messageText) {
  const now = Date.now();
  for (let index = expectedConsoleErrors.length - 1; index >= 0; index -= 1) {
    if (expectedConsoleErrors[index].expiresAt < now) {
      expectedConsoleErrors.splice(index, 1);
    }
  }

  const matchIndex = expectedConsoleErrors.findIndex(({ pattern }) => pattern.test(messageText));
  if (matchIndex === -1) {
    return false;
  }

  expectedConsoleErrors.splice(matchIndex, 1);
  return true;
}

function logStep(name, details = {}) {
  const entry = {
    name,
    at: new Date().toISOString(),
    ...details
  };
  report.steps.push(entry);
  console.log(`[v2-e2e:${SCENARIO}] ${name}`, details);
}

function sanitizeName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function capture(page, label) {
  const fileName = `${String(++screenshotIndex).padStart(2, '0')}-${sanitizeName(label)}.png`;
  const fullPath = path.join(OUTPUT_DIR, fileName);
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.screenshot({ path: fullPath, fullPage: true });
      report.screenshots.push(fullPath);
      return fullPath;
    } catch (error) {
      lastError = error;
      if (attempt >= 3) {
        throw error;
      }
      await page.waitForTimeout(250 * attempt);
    }
  }
  if (lastError) {
    throw lastError;
  }
  report.screenshots.push(fullPath);
  return fullPath;
}

async function checkHealth(url, label, accept = 'application/json') {
  const response = await fetch(url, { headers: { Accept: accept } });
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}: ${url}`);
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  const payload = await response.json();
  if (!payload || !payload.success) {
    throw new Error(`API response failed for ${url}: ${payload?.error || 'Unknown error'}`);
  }
  return payload.data;
}

async function waitForEnabledByTestId(page, testId, timeout = 30000) {
  await page.waitForFunction(
    (id) => {
      const selector = `[data-testid="${id}"]`;
      const element = document.querySelector(selector);
      if (!element) return false;
      return !(element instanceof HTMLButtonElement || element instanceof HTMLSelectElement || element instanceof HTMLInputElement)
        || !element.disabled;
    },
    testId,
    { timeout }
  );
}

async function waitForClubOptions(page) {
  await page.waitForFunction(
    () => {
      const select = document.querySelector('[data-testid="new-career-club-select"]');
      if (!(select instanceof HTMLSelectElement)) {
        return false;
      }
      const available = Array.from(select.options).filter((opt) => opt.value);
      return available.length > 0;
    },
    undefined,
    { timeout: 60000 }
  );
}

async function readHqState(page) {
  await page.goto(`${FRONTEND_URL}${ROUTES.hq}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('hq-phase-value').waitFor({ state: 'visible', timeout: 60000 });
  await page.getByTestId('hq-week-value').waitFor({ state: 'visible', timeout: 60000 });
  await page.getByTestId('hq-season-value').waitFor({ state: 'visible', timeout: 60000 });

  const phase = (await page.getByTestId('hq-phase-value').innerText()).trim();
  const week = Number((await page.getByTestId('hq-week-value').innerText()).trim());
  const season = (await page.getByTestId('hq-season-value').innerText()).trim();
  const hasMatchCenter = (await page.getByTestId('hq-open-match-center').count()) > 0;

  return { phase, week, season, hasMatchCenter };
}

async function readCareerStateApi() {
  assert.ok(report.careerId, 'Career ID is missing for state API read.');
  return fetchJson(`${BACKEND_URL}/api/v2/careers/${report.careerId}/state`);
}

async function careerHasWeekPlan(careerId) {
  if (!careerId) {
    return false;
  }
  try {
    const state = await fetchJson(`${BACKEND_URL}/api/v2/careers/${careerId}/state`);
    return Boolean(state?.weekPlan);
  } catch {
    return false;
  }
}

async function advanceFromHq(page) {
  await waitForEnabledByTestId(page, 'hq-advance-button', 30000);
  await page.getByTestId('hq-advance-button').click();
  await page.waitForTimeout(900);
}

async function continueFromHq(page) {
  await waitForEnabledByTestId(page, 'hq-continue-button', 30000);
  await page.getByTestId('hq-continue-button').click();
  await page.waitForTimeout(900);
}

async function resolveInbox(page) {
  await page.goto(`${FRONTEND_URL}${ROUTES.inbox}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  let resolved = 0;

  for (let i = 0; i < 12; i += 1) {
    const pendingCards = page.locator('[data-testid="inbox-event-card"]');
    const pendingCount = await pendingCards.count();
    if (pendingCount === 0) {
      break;
    }

    const actionableOptions = page.locator('[data-testid="inbox-option-button"]:not([disabled])');
    const actionableCount = await actionableOptions.count();
    if (actionableCount === 0) {
      await page.waitForTimeout(400);
      continue;
    }

    const respondPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/careers/') &&
        response.url().includes('/respond') &&
        response.request().method() === 'POST',
      { timeout: 8000 }
    ).catch(() => null);

    await actionableOptions.first().click();
    const respondResponse = await respondPromise;
    if (respondResponse?.ok()) {
      resolved += 1;
    }

    await page.waitForTimeout(450);
    await page.waitForLoadState('networkidle').catch(() => undefined);
  }

  return resolved;
}

async function pickClubForScenario() {
  const clubs = await fetchJson(`${BACKEND_URL}/api/v2/clubs`);
  if (!Array.isArray(clubs) || clubs.length === 0) {
    throw new Error('No clubs returned from /api/v2/clubs');
  }

  if (SCENARIO === 'lower-tier-rollover') {
    const withTier = clubs.filter((club) => Number.isFinite(Number(club.leagueTier)));
    if (withTier.length === 0) {
      throw new Error('No clubs with numeric tiers available for lower-tier scenario.');
    }
    const maxTier = Math.max(...withTier.map((club) => Number(club.leagueTier)));
    const tierCandidates = withTier
      .filter((club) => Number(club.leagueTier) === maxTier)
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const chosen = tierCandidates[0];
    return {
      id: Number(chosen.id),
      name: String(chosen.name),
      leagueName: String(chosen.leagueName || ''),
      tier: Number(chosen.leagueTier)
    };
  }

  const ajax = clubs.find((club) => String(club.name).toLowerCase() === 'ajax');
  const fallback = clubs
    .filter((club) => Number(club.leagueTier) === 1)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))[0] || clubs[0];
  const chosen = ajax || fallback;

  return {
    id: Number(chosen.id),
    name: String(chosen.name),
    leagueName: String(chosen.leagueName || ''),
    tier: Number(chosen.leagueTier || 0)
  };
}

async function selectClubInForm(page, targetClub) {
  if (Number.isFinite(targetClub.tier) && targetClub.tier > 0) {
    try {
      await page.selectOption('[data-testid="new-career-tier-filter"]', String(targetClub.tier));
      await page.waitForTimeout(250);
    } catch {
      // Ignore if tier option is unavailable in UI.
    }
  }

  const queryTerm = targetClub.name.slice(0, 10);
  await page.getByTestId('new-career-club-query').fill(queryTerm);
  await page.waitForTimeout(300);

  try {
    await page.selectOption('[data-testid="new-career-club-select"]', String(targetClub.id));
    return targetClub;
  } catch {
    const fallbackOption = await page.$eval('[data-testid="new-career-club-select"]', (selectElement) => {
      if (!(selectElement instanceof HTMLSelectElement)) {
        return null;
      }
      const choices = Array.from(selectElement.options).filter((opt) => Boolean(opt.value));
      if (choices.length === 0) {
        return null;
      }
      return {
        value: choices[0].value,
        label: (choices[0].textContent || '').trim()
      };
    });

    if (!fallbackOption || !fallbackOption.value) {
      throw new Error('Unable to select club in new-career form.');
    }

    await page.selectOption('[data-testid="new-career-club-select"]', fallbackOption.value);
    return {
      id: Number(fallbackOption.value),
      name: fallbackOption.label,
      leagueName: '',
      tier: targetClub.tier
    };
  }
}

function parseClubSummary(summaryText) {
  const match = summaryText.match(/Showing\s+(\d+)-(\d+)\s+of\s+(\d+)\s+filtered clubs/i);
  if (!match) {
    return null;
  }
  return {
    from: Number(match[1]),
    to: Number(match[2]),
    filteredTotal: Number(match[3])
  };
}

async function verifyClubPaginationInNewCareer(page) {
  const summaryLocator = page.locator('text=/Showing\\s+\\d+-\\d+\\s+of\\s+\\d+\\s+filtered clubs/i').first();
  const pageLocator = page.locator('text=/Page\\s+\\d+\\s*\\/\\s*\\d+/i').first();
  await summaryLocator.waitFor({ state: 'visible', timeout: 20000 });
  await pageLocator.waitFor({ state: 'visible', timeout: 20000 });

  const beforeSummaryText = ((await summaryLocator.textContent()) || '').trim();
  const beforePageText = ((await pageLocator.textContent()) || '').trim();
  const before = parseClubSummary(beforeSummaryText);

  if (!before || !Number.isFinite(before.filteredTotal) || before.filteredTotal <= 80) {
    logStep('club-pagination-check-skipped', {
      reason: 'insufficient-filtered-clubs',
      summary: beforeSummaryText,
      page: beforePageText
    });
    return;
  }

  const nextButton = page.getByRole('button', { name: /^Next$/i }).first();
  await nextButton.waitFor({ state: 'visible', timeout: 15000 });
  await nextButton.click();
  await page.waitForTimeout(250);

  const afterSummaryText = ((await summaryLocator.textContent()) || '').trim();
  const afterPageText = ((await pageLocator.textContent()) || '').trim();
  const after = parseClubSummary(afterSummaryText);
  assert.ok(after, 'Club summary format was invalid after pagination click.');
  assert.ok(after.from > before.from, 'Club pagination did not advance after clicking Next.');
  assert.ok(/Page\s+2\s*\//i.test(afterPageText), `Expected page indicator to move to page 2, got "${afterPageText}".`);

  await page.getByTestId('new-career-club-query').fill('ajax');
  await page.waitForTimeout(300);
  const filteredPageText = ((await pageLocator.textContent()) || '').trim();
  assert.ok(/Page\s+1\s*\//i.test(filteredPageText), `Expected club page reset to 1 after filtering, got "${filteredPageText}".`);

  logStep('club-pagination-check', {
    before: {
      summary: beforeSummaryText,
      page: beforePageText
    },
    afterNext: {
      summary: afterSummaryText,
      page: afterPageText
    },
    afterFilter: {
      page: filteredPageText
    }
  });

  await page.getByTestId('new-career-club-query').fill('');
  await page.waitForTimeout(250);
}

async function createCareer(page) {
  logStep('open-new-career');
  await page.goto(`${FRONTEND_URL}${ROUTES.newCareer}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('new-career-manager-name').waitFor({ state: 'visible', timeout: 30000 });
  await waitForClubOptions(page);
  await verifyClubPaginationInNewCareer(page);
  await capture(page, 'new-career-ready');

  const managerName = `E2E Browser ${SCENARIO} ${Date.now()}`;
  const targetClub = await pickClubForScenario();

  const selectedClub = await selectClubInForm(page, targetClub);
  report.selectedClub = selectedClub;

  let created = false;
  for (let attempt = 1; attempt <= 3 && !created; attempt += 1) {
    await page.getByTestId('new-career-manager-name').fill(managerName);
    await selectClubInForm(page, selectedClub);

    const selectedClubValue = await page.$eval(
      '[data-testid="new-career-club-select"]',
      (selectElement) => (selectElement instanceof HTMLSelectElement ? selectElement.value : '')
    );
    assert.ok(selectedClubValue, 'No controlled club is selected in new-career form.');

    await waitForEnabledByTestId(page, 'new-career-create-button', 15000);
    await page.getByTestId('new-career-create-button').click();

    try {
      await page.waitForURL((url) => url.pathname.startsWith(ROUTES.hq), { timeout: 30000 });
      created = true;
      break;
    } catch {
      const createError = await page
        .locator('p')
        .filter({ hasText: /failed|required|error|500/i })
        .first()
        .textContent()
        .catch(() => null);
      logStep('career-create-retry', {
        attempt,
        errorText: createError ? createError.trim() : null
      });
      await page.waitForTimeout(800);
    }
  }

  assert.ok(created, 'Could not create a career from the New Career form.');
  await page.getByTestId('hq-week-value').waitFor({ state: 'visible', timeout: 30000 });

  const activeCareerId = await page.evaluate(() => window.localStorage.getItem('sd_v2_active_career_id'));
  assert.ok(activeCareerId, 'Active career id was not persisted to localStorage.');
  report.careerId = activeCareerId;

  const initialState = await readHqState(page);
  report.initialWeek = initialState.week;
  report.initialSeason = initialState.season;

  logStep('career-created', {
    managerName,
    careerId: activeCareerId,
    club: selectedClub.name,
    tier: selectedClub.tier,
    week: initialState.week,
    season: initialState.season
  });

  if (SCENARIO === 'lower-tier-rollover') {
    assert.ok(Number(selectedClub.tier) > 1, `Expected a lower-tier club; got tier ${selectedClub.tier}.`);
  }

  await capture(page, 'hq-after-create');
}

async function saveWeekPlan(page) {
  logStep('save-week-plan');
  await page.goto(`${FRONTEND_URL}${ROUTES.weekPlanner}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('week-planner-save-button').waitFor({ state: 'visible', timeout: 30000 });
  const activeCareerId = await page.evaluate(() => window.localStorage.getItem('sd_v2_active_career_id'));
  let saved = false;

  for (let attempt = 1; attempt <= 3 && !saved; attempt += 1) {
    await page.getByTestId('week-planner-save-button').click();

    try {
      await page.getByText('Week plan saved. Autosave updated.').waitFor({ state: 'visible', timeout: 4000 });
      saved = true;
      break;
    } catch {
      // Fall through and verify via API in case UI toast was missed.
    }

    if (await careerHasWeekPlan(activeCareerId)) {
      logStep('week-plan-save-verified-via-api', { attempt });
      saved = true;
      break;
    }

    const errorText = await page.locator('p').filter({ hasText: /failed|required|error/i }).first().textContent().catch(() => null);
    logStep('week-plan-save-retry', {
      attempt,
      activeCareerId,
      errorText: errorText ? errorText.trim() : null
    });
    await page.waitForTimeout(750);
  }

  assert.ok(saved, 'Week plan was not saved after retry attempts.');
  await capture(page, 'week-plan-saved');
}

async function verifySquadManagementPage(page) {
  logStep('verify-squad-management-page');
  await page.goto(`${FRONTEND_URL}${ROUTES.squad}`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Player Profile').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('Registration & Eligibility').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('Positional Retraining').waitFor({ state: 'visible', timeout: 30000 });
  await capture(page, 'squad-management-ready');
}

async function verifyStandingsPage(page) {
  logStep('verify-standings-page');
  await page.goto(`${FRONTEND_URL}${ROUTES.standings}`, { waitUntil: 'domcontentloaded' });
  await page.getByText('League Rules', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('Registration Window', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('Transfer Window', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await capture(page, 'standings-rules-ready');
}

async function verifyTransferDeskPage(page) {
  logStep('verify-transfer-desk-page');
  await page.goto(`${FRONTEND_URL}${ROUTES.finances}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('club-operations-panel').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('transfer-market-panel').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('transfer-target-desk').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('[data-testid="transfer-target-row"]').first().waitFor({ state: 'visible', timeout: 30000 });

  const shortlistButton = page.getByTestId('transfer-shortlist-button').first();
  await waitForEnabledByTestId(page, 'transfer-shortlist-button', 30000);
  await shortlistButton.click();
  await page.getByTestId('transfer-shortlist-panel').waitFor({ state: 'visible', timeout: 30000 });

  const scoutButton = page.getByTestId('transfer-scout-button').first();
  await waitForEnabledByTestId(page, 'transfer-scout-button', 30000);
  await scoutButton.click();
  await page.locator('strong').filter({ hasText: /^Scouting Report$/ }).first().waitFor({ state: 'visible', timeout: 30000 });

  await capture(page, 'finances-transfer-desk-ready');

  await waitForEnabledByTestId(page, 'transfer-offer-submit-button', 30000);
  await page.getByTestId('transfer-offer-submit-button').click();
  await page.waitForFunction(
    () => {
      if (document.querySelector('[data-testid="transfer-negotiation-card"]')) {
        return true;
      }
      const activity = document.querySelector('[data-testid="finances-activity-message"]');
      const text = (activity?.textContent || '').trim();
      return /Signed\s+.+\s+from\s+.+|Loaned\s+.+\s+from\s+.+|rejected|counter/i.test(text);
    },
    undefined,
    { timeout: 30000 }
  );

  const negotiationVisible = await page.getByTestId('transfer-negotiation-card').count();
  const activityText = negotiationVisible > 0
    ? null
    : await page.getByTestId('finances-activity-message').textContent().catch(() => null);

  logStep('transfer-desk-verified', {
    negotiationVisible,
    activityText: activityText ? activityText.trim() : null
  });
  await capture(page, 'finances-transfer-desk-offer');
}

async function verifySaveLoadPage(page) {
  logStep('verify-save-load-page');
  await page.goto(`${FRONTEND_URL}${ROUTES.saveLoad}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('save-load-slot-input').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('text=/Active:/i').first().waitFor({ state: 'visible', timeout: 60000 });

  const smokeSlot = `smoke-${SCENARIO}-${Date.now()}`;
  await page.getByTestId('save-load-slot-input').fill(smokeSlot);
  await page.getByTestId('save-load-save-button').click();
  await page.waitForFunction(
    () => Boolean(document.querySelector('[data-testid="save-load-message"]') || document.querySelector('[data-testid="save-load-error"]')),
    undefined,
    { timeout: 30000 }
  );
  const saveError = ((await page.getByTestId('save-load-error').textContent().catch(() => null)) || '').trim();
  assert.ok(!saveError, `Expected save success without error, got "${saveError}".`);
  const saveMessage = ((await page.getByTestId('save-load-message').textContent()) || '').trim();
  assert.ok(saveMessage.includes(smokeSlot), `Expected save confirmation to include slot name, got "${saveMessage}".`);

  const missingSlot = `missing-${SCENARIO}-${Date.now()}`;
  await page.getByTestId('save-load-slot-input').fill(missingSlot);
  expectConsoleError(/^Failed to load resource: the server responded with a status of 400 \(Bad Request\)$/i);
  await page.getByTestId('save-load-load-button').click();
  await page.getByTestId('save-load-error').waitFor({ state: 'visible', timeout: 30000 });
  const errorText = ((await page.getByTestId('save-load-error').textContent()) || '').trim();
  assert.ok(/save slot not found/i.test(errorText), `Expected missing-slot error, got "${errorText}".`);

  const activeHistoryRow = page.getByTestId('save-load-slot-row').filter({ hasText: smokeSlot }).first();
  await activeHistoryRow.waitFor({ state: 'visible', timeout: 30000 });
  await activeHistoryRow.getByTestId('save-load-slot-row-button').click();
  await page.waitForFunction(
    () => Boolean(document.querySelector('[data-testid="save-load-message"]') || document.querySelector('[data-testid="save-load-error"]')),
    undefined,
    { timeout: 30000 }
  );
  const loadError = ((await page.getByTestId('save-load-error').textContent().catch(() => null)) || '').trim();
  assert.ok(!loadError, `Expected saved-slot load success without error, got "${loadError}".`);
  const loadMessage = ((await page.getByTestId('save-load-message').textContent()) || '').trim();
  assert.ok(loadMessage.includes(smokeSlot), `Expected load confirmation to include slot name, got "${loadMessage}".`);

  await capture(page, 'save-load-verified');
  logStep('save-load-verified', {
    smokeSlot,
    missingSlot,
    errorText
  });
}

async function verifyClubPulsePage(page) {
  logStep('verify-club-pulse-page');
  await page.goto(`${FRONTEND_URL}${ROUTES.pulse}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('club-pulse-summary').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('club-pulse-headlines').waitFor({ state: 'visible', timeout: 30000 });
  await capture(page, 'club-pulse-ready');
}

async function reachMatchPrep(page) {
  let state = await readHqState(page);
  let sawEventPhase = state.phase === 'EVENT';
  let planningOpenedMatchCenter = state.phase === 'PLANNING' && state.hasMatchCenter;
  logStep('hq-state', state);

  for (let i = 0; i < 6 && state.phase === 'PLANNING' && !state.hasMatchCenter; i += 1) {
    await continueFromHq(page);
    await capture(page, `hq-after-continue-${i + 1}`);
    state = await readHqState(page);
    sawEventPhase = sawEventPhase || state.phase === 'EVENT';
    planningOpenedMatchCenter = planningOpenedMatchCenter || (state.phase === 'PLANNING' && state.hasMatchCenter);
    logStep('hq-state', state);
  }
  assert.ok(
    state.phase !== 'PLANNING' || state.hasMatchCenter,
    'Weekly loop did not progress beyond PLANNING or expose Match Center.'
  );

  if (state.phase === 'EVENT') {
    const resolvedNow = await resolveInbox(page);
    report.resolvedEvents += resolvedNow;
    logStep('inbox-resolved', { resolvedNow, totalResolved: report.resolvedEvents });
    await capture(page, 'inbox-after-resolve');

    const apiStateAfterInbox = await readCareerStateApi();
    const pendingEvents = Number(apiStateAfterInbox?.pendingEvents || 0);
    const stillInEventPhase = String(apiStateAfterInbox?.currentPhase || '') === 'EVENT';

    if (SCENARIOS[SCENARIO].requireEventDecisions && pendingEvents > 0 && resolvedNow === 0) {
      throw new Error('EVENT phase still has pending events but no actionable inbox decisions were resolved.');
    }

    state = await readHqState(page);
    if (state.phase === 'EVENT') {
      await continueFromHq(page);
      state = await readHqState(page);
    }

    if (state.phase === 'EVENT' && stillInEventPhase && pendingEvents > 0) {
      throw new Error(`Could not exit EVENT phase; pending events remain (${pendingEvents}).`);
    }
  }

  assert.ok(sawEventPhase || planningOpenedMatchCenter || report.resolvedEvents > 0 || !SCENARIOS[SCENARIO].requireEventDecisions,
    'Weekly loop did not enter EVENT phase.');

  if (!state.hasMatchCenter) {
    await continueFromHq(page);
    state = await readHqState(page);
  }

  assert.ok(state.hasMatchCenter, `Expected match center link after planning/event phases, got phase=${state.phase}.`);
  await page.getByTestId('hq-open-match-center').click();
  await page.waitForURL((url) => url.pathname.includes(ROUTES.matchCenterPrefix), { timeout: 30000 });
}

async function runMatchAndPost(page) {
  logStep('start-guided-match');
  await waitForEnabledByTestId(page, 'match-center-start-button', 60000);
  await capture(page, 'match-prep-ready');
  await page.getByTestId('match-center-start-button').click();

  await page.getByTestId('match-center-locked-prep').waitFor({ state: 'visible', timeout: 45000 });
  const lockedPrepText = await page.getByTestId('match-center-locked-prep').innerText();
  assert.match(lockedPrepText, /XI\s+11/i, 'Locked prep does not show 11 selected starters.');
  logStep('match-started', { lockedPrepText });
  await capture(page, 'match-live');

  let interventionsApplied = 0;

  if (await page.getByTestId('match-center-halftime-demand').count()) {
    await waitForEnabledByTestId(page, 'match-center-halftime-demand', 20000);
    await page.getByTestId('match-center-halftime-demand').click();
    interventionsApplied += 1;
    logStep('intervention-applied', { type: 'HALFTIME_TEAM_TALK' });
    await page.waitForTimeout(300);
  }

  const subOutSelect = page.getByTestId('match-center-sub-out-select');
  const subInSelect = page.getByTestId('match-center-sub-in-select');
  if ((await subOutSelect.count()) && (await subInSelect.count())) {
    const outValues = await subOutSelect.locator('option').evaluateAll((options) =>
      options.map((option) => option.value).filter(Boolean)
    );
    const inValues = await subInSelect.locator('option').evaluateAll((options) =>
      options.map((option) => option.value).filter(Boolean)
    );
    if (outValues.length > 0 && inValues.length > 0) {
      await subOutSelect.selectOption(outValues[0]);
      await subInSelect.selectOption(inValues[0]);
      if (await page.getByTestId('match-center-sub-reason-select').count()) {
        await page.getByTestId('match-center-sub-reason-select').selectOption('TACTICAL_TWEAK');
      }
      await waitForEnabledByTestId(page, 'match-center-intervention-substitution', 20000);
      await page.getByTestId('match-center-intervention-substitution').click();
      interventionsApplied += 1;
      logStep('intervention-applied', { type: 'SUBSTITUTION_TRIGGER' });
      await page.waitForTimeout(300);
    }
  }

  await waitForEnabledByTestId(page, 'match-center-intervention-mentality-attack', 20000);
  await page.getByTestId('match-center-intervention-mentality-attack').click();
  interventionsApplied += 1;
  logStep('intervention-applied', { type: 'MENTALITY_SHIFT' });
  await page.waitForTimeout(500);

  await page.getByTestId('match-center-finalize-post-match').click();
  await page.waitForURL((url) => url.pathname.includes(ROUTES.postMatchPrefix), { timeout: 30000 });
  await page.getByTestId('post-match-loaded').waitFor({ state: 'visible', timeout: 45000 });

  await page.getByTestId('post-match-chance-quality').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('post-match-tactical-feedback').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('post-match-player-ratings').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('post-match-intervention-impact').waitFor({ state: 'visible', timeout: 30000 });
  const interventionSummary = (await page.getByTestId('post-match-intervention-summary').innerText()).trim();
  assert.match(interventionSummary, new RegExp(`Interventions:\\s*${interventionsApplied}`, 'i'), `Unexpected intervention summary: ${interventionSummary}`);
  const interventionRows = await page.getByTestId('post-match-intervention-row').count();
  assert.ok(interventionRows >= interventionsApplied, 'Expected telemetry rows for the applied live interventions.');
  logStep('post-match-intervention-impact', {
    summary: interventionSummary,
    rows: interventionRows
  });

  await capture(page, 'post-match-loaded');

  await page.getByTestId('post-match-back-hq').click();
  await page.waitForURL((url) => url.pathname.startsWith(ROUTES.hq), { timeout: 30000 });
}

async function wrapToNextWeek(page) {
  let wrapped = false;

  for (let i = 0; i < 8; i += 1) {
    const state = await readHqState(page);
    report.finalSeason = state.season;
    report.finalWeek = state.week;
    report.finalPhase = state.phase;
    logStep('hq-wrap-state', { iteration: i + 1, phase: state.phase, week: state.week, season: state.season });

    if (state.week > report.initialWeek && state.phase === 'PLANNING') {
      wrapped = true;
      await capture(page, 'hq-next-week-planning');
      await page.goto(`${FRONTEND_URL}${ROUTES.weekPlanner}`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('week-planner-save-button').waitFor({ state: 'visible', timeout: 30000 });
      await page.getByTestId('week-planner-latest-match-insight').waitFor({ state: 'visible', timeout: 30000 });
      await capture(page, 'week-planner-next-week');
      break;
    }

    if (state.phase === 'EVENT') {
      const resolvedNow = await resolveInbox(page);
      report.resolvedEvents += resolvedNow;
      if (resolvedNow === 0) {
        await continueFromHq(page);
      }
      continue;
    }

    if (state.phase === 'POST_MATCH' || state.phase === 'WEEK_WRAP') {
      await advanceFromHq(page);
      continue;
    }

    await continueFromHq(page);
  }

  assert.ok(wrapped, `Did not reach next planning week. Final phase=${report.finalPhase}, week=${report.finalWeek}`);
}

async function runForcedSeasonRollover(page) {
  assert.ok(report.careerId, 'Career ID is missing before rollover check.');
  const prisma = new PrismaClient();

  try {
    const maxWeekAgg = await prisma.v2Fixture.aggregate({
      where: { careerId: report.careerId },
      _max: { weekNumber: true }
    });
    const maxWeek = Number(maxWeekAgg?._max?.weekNumber || 0);
    assert.ok(Number.isFinite(maxWeek) && maxWeek > 0, 'Could not determine max week for rollover check.');

    const before = await prisma.v2Career.findUnique({
      where: { id: report.careerId },
      select: { season: true, weekNumber: true }
    });
    assert.ok(before, 'Career row missing for rollover setup.');

    await prisma.v2Career.update({
      where: { id: report.careerId },
      data: {
        weekNumber: maxWeek,
        currentPhase: 'POST_MATCH'
      }
    });

    report.rollover.maxWeek = maxWeek;
    report.rollover.forcedAtWeek = maxWeek;
    report.rollover.seasonBeforeAdvance = before.season;

    logStep('rollover-forced', {
      careerId: report.careerId,
      fromSeason: before.season,
      forcedWeek: maxWeek
    });

    const stateBeforeAdvance = await readHqState(page);
    report.rollover.seasonBeforeAdvance = stateBeforeAdvance.season;
    await capture(page, 'hq-before-rollover-advance');

    await advanceFromHq(page);
    let stateAfterAdvance = await readHqState(page);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const seasonChanged = stateAfterAdvance.season !== stateBeforeAdvance.season;
      const reachedWeekOnePlanning = stateAfterAdvance.week === 1 && stateAfterAdvance.phase === 'PLANNING';
      if (seasonChanged && reachedWeekOnePlanning) {
        break;
      }

      if (stateAfterAdvance.phase === 'POST_MATCH' || stateAfterAdvance.phase === 'WEEK_WRAP') {
        await advanceFromHq(page);
      } else {
        await page.waitForTimeout(600);
      }
      stateAfterAdvance = await readHqState(page);
    }
    report.rollover.seasonAfterAdvance = stateAfterAdvance.season;
    report.rollover.advancedToWeek = stateAfterAdvance.week;
    report.rollover.advancedToPhase = stateAfterAdvance.phase;

    assert.notEqual(stateAfterAdvance.season, stateBeforeAdvance.season,
      `Season did not advance: remained ${stateAfterAdvance.season}`);
    assert.equal(stateAfterAdvance.week, 1, `Expected rollover to week 1, got week ${stateAfterAdvance.week}`);
    assert.equal(stateAfterAdvance.phase, 'PLANNING', `Expected rollover phase PLANNING, got ${stateAfterAdvance.phase}`);

    await capture(page, 'hq-after-rollover');

    report.finalSeason = stateAfterAdvance.season;
    report.finalWeek = stateAfterAdvance.week;
    report.finalPhase = stateAfterAdvance.phase;

    logStep('rollover-verified', {
      seasonBefore: stateBeforeAdvance.season,
      seasonAfter: stateAfterAdvance.season,
      weekAfter: stateAfterAdvance.week,
      phaseAfter: stateAfterAdvance.phase
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await checkHealth(`${BACKEND_URL}/api/v2/health`, 'Backend health');
  await checkHealth(`${FRONTEND_URL}/`, 'Frontend root', 'text/html');

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--use-gl=angle', '--use-angle=swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      if (consumeExpectedConsoleError(message.text())) {
        return;
      }
      report.consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    report.pageErrors.push(String(error));
  });

  try {
    await createCareer(page);
    await verifySaveLoadPage(page);
    await verifySquadManagementPage(page);
    await verifyStandingsPage(page);
    await verifyTransferDeskPage(page);
    await verifyClubPulsePage(page);
    await saveWeekPlan(page);
    await reachMatchPrep(page);
    await runMatchAndPost(page);
    await wrapToNextWeek(page);

    if (SCENARIO === 'lower-tier-rollover') {
      await runForcedSeasonRollover(page);
    }

    assert.equal(report.consoleErrors.length, 0, `Browser console had errors: ${report.consoleErrors.join(' | ')}`);
    assert.equal(report.pageErrors.length, 0, `Browser page errors encountered: ${report.pageErrors.join(' | ')}`);

    report.status = 'passed';
    logStep('completed', {
      scenario: SCENARIO,
      initialSeason: report.initialSeason,
      finalSeason: report.finalSeason,
      initialWeek: report.initialWeek,
      finalWeek: report.finalWeek,
      resolvedEvents: report.resolvedEvents
    });
  } finally {
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
    await page.close();
    await browser.close();
  }
}

run().catch((error) => {
  report.status = 'failed';
  report.error = String(error?.stack || error);
  report.finishedAt = new Date().toISOString();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.error(`[v2-e2e:${SCENARIO}] FAILED`);
  console.error(report.error);
  process.exit(1);
});
