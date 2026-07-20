#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const projectDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const tsconfigPath = path.join(projectDir, 'tsconfig.json');
const mainPath = path.join(projectDir, 'src', 'main.ts');

const tsconfigDefaults = {
  module: 'NodeNext',
  moduleResolution: 'NodeNext',
  resolvePackageJsonExports: true,
  esModuleInterop: true,
  isolatedModules: true,
  declaration: true,
  removeComments: true,
  strict: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  allowSyntheticDefaultImports: true,
  target: 'ES2022',
  sourceMap: true,
  outDir: './dist',
  incremental: true,
  skipLibCheck: true,
  strictNullChecks: true,
  forceConsistentCasingInFileNames: true,
  noImplicitAny: false,
  strictBindCallApply: false,
  noFallthroughCasesInSwitch: false,
};

const bootstrapCatchBlock =
  "bootstrap().catch((err) => {\n" +
  "  console.error('Failed to start Nest application', err);\n" +
  "  process.exit(1);\n" +
  "});\n";

function writeIfChanged(filePath, content) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (current !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function updateTsconfig() {
  if (!fs.existsSync(tsconfigPath)) {
    console.warn(`Missing tsconfig.json at ${tsconfigPath}`);
    return false;
  }

  const raw = fs.readFileSync(tsconfigPath, 'utf8');
  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    console.error(`Invalid JSON in ${tsconfigPath}`);
    process.exit(1);
  }

  config.compilerOptions = config.compilerOptions ?? {};
  Object.assign(config.compilerOptions, tsconfigDefaults);
  delete config.compilerOptions.baseUrl;

  const output = JSON.stringify(config, null, 2) + '\n';
  return writeIfChanged(tsconfigPath, output);
}

function updateMain() {
  if (!fs.existsSync(mainPath)) {
    console.warn(`Missing main.ts at ${mainPath}`);
    return false;
  }

  let content = fs.readFileSync(mainPath, 'utf8');
  if (content.includes('bootstrap().catch(')) {
    return false;
  }

  if (/await\s+bootstrap\(\);\s*/m.test(content)) {
    content = content.replace(/await\s+bootstrap\(\);\s*/m, bootstrapCatchBlock);
  } else if (/^[ \t]*bootstrap\(\);\s*$/m.test(content)) {
    content = content.replace(/^[ \t]*bootstrap\(\);\s*$/m, bootstrapCatchBlock);
  } else {
    const separator = content.endsWith('\n') ? '\n' : '\n\n';
    content = content + separator + bootstrapCatchBlock;
  }

  return writeIfChanged(mainPath, content);
}

const changedTsconfig = updateTsconfig();
const changedMain = updateMain();

if (changedTsconfig || changedMain) {
  console.log('Applied Nest defaults.');
} else {
  console.log('Nest defaults already applied.');
}
