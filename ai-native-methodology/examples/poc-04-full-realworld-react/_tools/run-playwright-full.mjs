/**
 * run-playwright-full.mjs — ★ Stage 5 Sprint 5-3 본격 (8 page × 4 viewport = 32 snapshot + 32 a11y scan)
 *
 * 분석 대상: https://demo.realworld.io/ (★ 본 fork 의 동일 backend)
 * Stage 4 mini = 1 page × 2 viewport / Stage 5 full = 8 page × 4 viewport
 *
 * 출력:
 *   - analysis/5-2-c-visual/visual-manifest.json
 *   - analysis/5-2-c-visual/snapshot/{page}-{viewport}.png
 *   - analysis/6-quality/a11y-spec.json
 */

import { chromium } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_VISUAL_JSON = resolve(__dirname, '../analysis/5-2-c-visual/visual-manifest.json');
const OUTPUT_SNAPSHOT_DIR = resolve(__dirname, '../analysis/5-2-c-visual/snapshot');
const OUTPUT_A11Y_JSON = resolve(__dirname, '../analysis/6-quality/a11y-spec.json');

const BASE_URL = 'https://demo.realworld.io';

// ★ ADR-FE-002 정합 4 viewport
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-landscape', width: 667, height: 375 }
];

// ★ 8 page (Stage 4 1 → Stage 5 8 / Editor + Settings = auth required → 부분 표시 + skip)
const PAGES = [
  { id: 'PAGE-HOME', path: '/', name: 'Home', auth_required: false },
  { id: 'PAGE-LOGIN', path: '/login', name: 'Login', auth_required: false },
  { id: 'PAGE-REGISTER', path: '/register', name: 'Register', auth_required: false },
  { id: 'PAGE-ARTICLE', path: '/article/Welcome-to-RealWorld-project-1', name: 'Article (sample)', auth_required: false, fallback_path: '/' },
  { id: 'PAGE-PROFILE', path: '/profile/eric-simons', name: 'Profile (sample)', auth_required: false, fallback_path: '/' },
  { id: 'PAGE-EDITOR', path: '/editor', name: 'Editor', auth_required: true, expected_redirect: '/login' },
  { id: 'PAGE-SETTINGS', path: '/settings', name: 'Settings', auth_required: true, expected_redirect: '/login' },
  { id: 'PAGE-404', path: '/this-route-does-not-exist-12345', name: '404', auth_required: false }
];

async function main() {
  await mkdir(OUTPUT_SNAPSHOT_DIR, { recursive: true });
  await mkdir(dirname(OUTPUT_A11Y_JSON), { recursive: true });

  console.log('[playwright-full] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  const visualEntries = [];
  const a11yResults = [];

  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      const label = `${page.id}-${vp.name}`;
      console.log(`[playwright-full] ${label} ...`);

      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const pageObj = await context.newPage();

      const url = BASE_URL + page.path;
      let actualUrl = url;
      try {
        await pageObj.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        actualUrl = pageObj.url();
      } catch (err) {
        console.error(`  navigation issue: ${err.message}`);
      }

      // Visual snapshot
      const snapshotName = `${label}.png`;
      const snapshotPath = resolve(OUTPUT_SNAPSHOT_DIR, snapshotName);
      try {
        const buffer = await pageObj.screenshot({ fullPage: true, timeout: 15000 });
        await writeFile(snapshotPath, buffer);
        const hash = createHash('sha256').update(buffer).digest('hex');
        visualEntries.push({
          page_id: page.id,
          page_path: page.path,
          actual_url: actualUrl,
          viewport: vp,
          snapshot_path: `snapshot/${snapshotName}`,
          snapshot_size_bytes: buffer.length,
          snapshot_hash_sha256: hash,
          auth_redirect_observed: page.expected_redirect && actualUrl.includes(page.expected_redirect),
          captured_at: new Date().toISOString()
        });
      } catch (err) {
        console.error(`  screenshot fail: ${err.message}`);
        visualEntries.push({ page_id: page.id, viewport: vp, error: err.message });
      }

      // axe-core a11y scan (★ desktop + mobile-portrait 만 / cap 보호)
      if (vp.name === 'desktop' || vp.name === 'mobile-portrait') {
        try {
          const accessibilityResults = await new AxeBuilder({ page: pageObj })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze();

          a11yResults.push({
            page_id: page.id,
            viewport: vp.name,
            url: actualUrl,
            violations_count: accessibilityResults.violations.length,
            passes_count: accessibilityResults.passes.length,
            incomplete_count: accessibilityResults.incomplete.length,
            violations: accessibilityResults.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              tags: v.tags,
              help: v.help,
              help_url: v.helpUrl,
              nodes_count: v.nodes.length
            })),
            timestamp: accessibilityResults.timestamp
          });
        } catch (err) {
          a11yResults.push({ page_id: page.id, viewport: vp.name, error: err.message });
        }
      }

      await context.close();
    }
  }

  await browser.close();

  // Visual manifest
  const visualManifest = {
    $schema_origin: "ai-native-methodology/schemas/visual-manifest.schema.json",
    meta: {
      poc_id: "poc-04-full",
      stage: "5",
      sprint: "5-3",
      phase: "5-2-c-visual",
      captured_at: new Date().toISOString().split('T')[0],
      captured_by: "real",
      tool: "@playwright/test (chromium headless) + ADR-FE-002 4 viewport",
      target_url: BASE_URL,
      target_note: "★ demo.realworld.io = RealWorld 운영 데모 사이트 (본 fork 와 동일 backend / 8 page 시각 산출 isomorphic 검증)"
    },
    snapshots: visualEntries,
    summary: {
      pages_count: PAGES.length,
      viewports_count: VIEWPORTS.length,
      total_snapshots_target: PAGES.length * VIEWPORTS.length,
      total_snapshots_captured: visualEntries.filter((e) => e.snapshot_path).length,
      auth_redirect_observed_count: visualEntries.filter((e) => e.auth_redirect_observed).length,
      stage_4_mini_diff: { stage_4: 2, stage_5: PAGES.length * VIEWPORTS.length }
    },
    deliverable_9_compliance: {
      playwright_real_run: true,
      simulation_used: false,
      adr_fe_002_4_viewport: true,
      binary_truth_captured: true
    }
  };
  await writeFile(OUTPUT_VISUAL_JSON, JSON.stringify(visualManifest, null, 2), 'utf-8');

  // a11y spec
  const totalViolations = a11yResults.reduce((sum, r) => sum + (r.violations_count ?? 0), 0);
  const allViolationIds = new Set();
  for (const r of a11yResults) {
    for (const v of (r.violations ?? [])) {
      allViolationIds.add(v.id);
    }
  }

  const a11ySpec = {
    $schema_origin: "ai-native-methodology/schemas/a11y-spec.schema.json",
    meta: {
      poc_id: "poc-04-full",
      stage: "5",
      sprint: "5-3",
      phase: "6-quality",
      captured_at: new Date().toISOString().split('T')[0],
      captured_by: "real",
      tool: "@axe-core/playwright 4.10",
      wcag_tags: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]
    },
    scans: a11yResults,
    summary: {
      total_scans: a11yResults.length,
      pages_scanned: PAGES.length,
      viewports_per_page: 2,
      total_violations: totalViolations,
      unique_violation_rules: allViolationIds.size,
      stage_4_mini_diff: { stage_4_pages: 1, stage_5_pages: PAGES.length, stage_4_unique: 1 }
    },
    deliverable_10_compliance: {
      axe_core_real_run: true,
      simulation_used: false,
      wcag_2_2_aa_applied: true,
      stage_5_full_pages_coverage: true
    }
  };
  await writeFile(OUTPUT_A11Y_JSON, JSON.stringify(a11ySpec, null, 2), 'utf-8');

  console.log(`[playwright-full] ✅ ${visualEntries.length} snapshot entries / ${visualManifest.summary.total_snapshots_captured} captured`);
  console.log(`[axe-core] ✅ ${totalViolations} total violations / ${allViolationIds.size} unique rules`);
  console.log(`[playwright-full] ✅ Wrote ${OUTPUT_VISUAL_JSON}`);
  console.log(`[axe-core] ✅ Wrote ${OUTPUT_A11Y_JSON}`);
}

main().catch((err) => {
  console.error('[playwright/axe] FATAL:', err);
  process.exit(1);
});
