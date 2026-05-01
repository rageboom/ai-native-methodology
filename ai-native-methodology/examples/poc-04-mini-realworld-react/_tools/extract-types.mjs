/**
 * extract-types.mjs — ★ ts-morph 진짜 실행 / deliverable 15 type-spec 산출
 *
 * 입력: ../INPUT/src/**\/*.{ts,tsx}
 * 출력: ../analysis/6-quality/type-spec.json + types.d.ts (concat)
 *
 * 측정:
 * - explicit type identifiers (interface / type alias / enum / class)
 * - framework_neutrality_score (★ ADR-FE-006)
 * - ★ React idiom AST grep (9 keywords)
 */

import { Project, SyntaxKind } from 'ts-morph';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_TSCONFIG = resolve(__dirname, '../INPUT/tsconfig.json');
const OUTPUT_JSON = resolve(__dirname, '../analysis/6-quality/type-spec.json');
const OUTPUT_DTS = resolve(__dirname, '../analysis/6-quality/types.d.ts');

const REACT_IDIOMS = [
  'useState', 'useEffect', 'useContext', 'useReducer',
  'useMemo', 'useCallback', 'props.children', 'React.FC', 'JSX.Element'
];

async function main() {
  console.log('[ts-morph] Loading project...');
  const project = new Project({
    tsConfigFilePath: INPUT_TSCONFIG,
    skipAddingFilesFromTsConfig: false,
  });

  const sourceFiles = project.getSourceFiles();
  console.log(`[ts-morph] Loaded ${sourceFiles.length} source files`);

  const types = [];
  const dtsLines = [];
  const idiomCounts = Object.fromEntries(REACT_IDIOMS.map((k) => [k, 0]));
  let totalIdentifiers = 0;
  let totalReactIdioms = 0;

  for (const sf of sourceFiles) {
    const filePath = sf.getFilePath().replace(/\\/g, '/');
    if (!filePath.includes('/INPUT/src/')) continue;
    if (filePath.includes('/generated/')) continue;
    if (filePath.includes('.test.')) continue;

    const relativePath = filePath.split('/INPUT/')[1];

    // Interfaces
    for (const decl of sf.getInterfaces()) {
      const name = decl.getName();
      const props = decl.getProperties().map((p) => ({
        name: p.getName(),
        type: p.getTypeNode()?.getText() ?? p.getType().getText(),
        optional: p.hasQuestionToken(),
        readonly: p.isReadonly(),
      }));
      const reactCoupled = decl.getText().match(/React\.|JSX\.|ReactNode|FC<|HTMLAttributes|MouseEvent|ChangeEvent|FormEvent/);
      types.push({
        id: `T-${name}`,
        kind: 'interface',
        name,
        properties: props,
        source_file: relativePath,
        react_coupled: !!reactCoupled,
      });
      dtsLines.push(`// ${relativePath}`);
      dtsLines.push(decl.getText());
    }

    // Type Aliases
    for (const decl of sf.getTypeAliases()) {
      const name = decl.getName();
      const declarationText = decl.getText();
      const reactCoupled = declarationText.match(/React\.|JSX\.|ReactNode|FC<|HTMLAttributes|MouseEvent|ChangeEvent|FormEvent/);
      types.push({
        id: `T-${name}`,
        kind: 'type_alias',
        name,
        declaration: declarationText.length > 200 ? declarationText.substring(0, 200) + '...' : declarationText,
        source_file: relativePath,
        react_coupled: !!reactCoupled,
      });
      dtsLines.push(`// ${relativePath}`);
      dtsLines.push(declarationText);
    }

    // Enums
    for (const decl of sf.getEnums()) {
      const name = decl.getName();
      const members = decl.getMembers().map((m) => ({
        name: m.getName(),
        value: m.getValue(),
      }));
      types.push({
        id: `T-${name}`,
        kind: 'enum',
        name,
        members,
        source_file: relativePath,
        react_coupled: false,
      });
      dtsLines.push(`// ${relativePath}`);
      dtsLines.push(decl.getText());
    }

    // Classes (rare in React)
    for (const decl of sf.getClasses()) {
      const name = decl.getName();
      if (!name) continue;
      const declarationText = decl.getText();
      const reactCoupled = declarationText.match(/React\.|extends Component|extends React\./);
      types.push({
        id: `T-${name}`,
        kind: 'class',
        name,
        source_file: relativePath,
        react_coupled: !!reactCoupled,
      });
    }

    // ★ React idiom AST grep (★ ADR-FE-006 framework_neutrality_score)
    sf.forEachDescendant((node) => {
      if (node.getKind() === SyntaxKind.Identifier) {
        const text = node.getText();
        totalIdentifiers++;
        if (REACT_IDIOMS.includes(text)) {
          idiomCounts[text]++;
          totalReactIdioms++;
        }
      }
      // PropertyAccess like props.children / React.FC / JSX.Element
      if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
        const text = node.getText();
        if (text === 'props.children' || text === 'React.FC' || text === 'JSX.Element') {
          idiomCounts[text]++;
          totalReactIdioms++;
        }
      }
    });
  }

  // Compute metrics
  const reactCoupledTypes = types.filter((t) => t.react_coupled).length;
  const frameworkNeutralityScore = types.length > 0 ? 1 - (reactCoupledTypes / types.length) : 1;

  const result = {
    $schema_origin: "ai-native-methodology/schemas/type-spec.schema.json (★ Stage 7-pre)",
    meta: {
      poc_id: "poc-04-mini",
      phase: "6-quality",
      captured_at: new Date().toISOString().split('T')[0],
      captured_by: "real",
      tool: "ts-morph",
      tool_version: "24.0.0",
      tsconfig: "INPUT/tsconfig.json",
      analyzed_files: sourceFiles.filter((sf) => {
        const fp = sf.getFilePath().replace(/\\/g, '/');
        return fp.includes('/INPUT/src/') && !fp.includes('/generated/') && !fp.includes('.test.');
      }).length
    },
    types,
    summary: {
      total_types: types.length,
      per_kind: {
        interface: types.filter((t) => t.kind === 'interface').length,
        type_alias: types.filter((t) => t.kind === 'type_alias').length,
        enum: types.filter((t) => t.kind === 'enum').length,
        class: types.filter((t) => t.kind === 'class').length
      },
      react_coupled_types: reactCoupledTypes,
      framework_neutrality_score: Number(frameworkNeutralityScore.toFixed(3))
    },
    react_idiom_baseline: {
      total_identifiers: totalIdentifiers,
      total_react_idioms: totalReactIdioms,
      react_idiom_ratio: totalIdentifiers > 0 ? Number((totalReactIdioms / totalIdentifiers).toFixed(4)) : 0,
      per_idiom: idiomCounts,
      note: "★ Stage 4 = baseline 측정 (★ Stage 5 ratchet 정식화 / G3 결단)"
    },
    deliverable_15_compliance: {
      ts_morph_real_run: true,
      simulation_used: false,
      framework_neutrality_metric_computed: true
    }
  };

  await mkdir(dirname(OUTPUT_JSON), { recursive: true });
  await writeFile(OUTPUT_JSON, JSON.stringify(result, null, 2), 'utf-8');
  await writeFile(OUTPUT_DTS, dtsLines.join('\n\n'), 'utf-8');

  console.log(`[ts-morph] ✅ Wrote ${types.length} types to ${OUTPUT_JSON}`);
  console.log(`[ts-morph] ✅ Wrote .d.ts concat to ${OUTPUT_DTS}`);
  console.log(`[ts-morph] framework_neutrality_score = ${result.summary.framework_neutrality_score}`);
  console.log(`[ts-morph] react_idiom_ratio = ${result.react_idiom_baseline.react_idiom_ratio}`);
  console.log(`[ts-morph] per_idiom:`, idiomCounts);
}

main().catch((err) => {
  console.error('[ts-morph] ERROR:', err);
  process.exit(1);
});
