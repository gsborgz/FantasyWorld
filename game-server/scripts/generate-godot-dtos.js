/* eslint-disable no-console */

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function parseArgs(argv) {
  const args = {
    input: 'src/shared/dtos.ts',
    outDir: path.resolve(__dirname, '..', '..', 'client', 'shared', 'generated'),
    outFile: 'dtos.gd',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--input' && argv[i + 1]) args.input = argv[++i];
    else if (a === '--outDir' && argv[i + 1]) args.outDir = argv[++i];
    else if (a === '--outFile' && argv[i + 1]) args.outFile = argv[++i];
  }

  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function nodeText(sourceFile, node) {
  return sourceFile.text.slice(node.getStart(sourceFile), node.getEnd());
}

function getTrailingCommentText(sourceFile, node) {
  const fullText = sourceFile.getFullText();
  const commentRanges = ts.getTrailingCommentRanges(fullText, node.end) || [];
  if (commentRanges.length === 0) return '';
  const last = commentRanges[commentRanges.length - 1];
  const raw = fullText.slice(last.pos, last.end);
  return raw.replace(/^\/\/+\s?/, '').trim();
}

function escapeGdString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function defaultValueForGdType(gdType) {
  switch (gdType) {
    case 'String':
      return '""';
    case 'int':
      return '0';
    case 'float':
      return '0.0';
    case 'bool':
      return 'false';
    case 'Dictionary':
      return '{}';
    case 'Array':
      return '[]';
    case 'Variant':
    default:
      return 'null';
  }
}

function mapTsTypeToGdType(typeNode, trailingComment, sourceFile) {
  const comment = (trailingComment || '').toLowerCase();

  if (!typeNode) return 'Variant';

  // Special-case based on hints in comments
  if (comment.includes('float')) return 'float';
  if (comment.includes('integer') || comment.includes('int')) return 'int';

  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return 'String';
    case ts.SyntaxKind.NumberKeyword:
      return 'float';
    case ts.SyntaxKind.BooleanKeyword:
      return 'bool';
    case ts.SyntaxKind.ArrayType:
      return 'Array';
    case ts.SyntaxKind.TypeLiteral:
      return 'Dictionary';
    case ts.SyntaxKind.TypeReference: {
      const ref = typeNode;
      const name =
        ref.typeName && ref.typeName.getText
          ? ref.typeName.getText(sourceFile)
          : '';
      // Enums and known types map to int by default; keep it as Variant to be safe.
      // If you want stricter typing later, you can special-case specific names.
      if (name) return 'Variant';
      return 'Variant';
    }
    case ts.SyntaxKind.UnionType:
      return 'Variant';
    default:
      return 'Variant';
  }
}

function isExported(node) {
  return (
    node.modifiers &&
    node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
  );
}

function emitHeader() {
  return [
    '# This file is auto-generated. Do not edit by hand.',
    '# Source: game-server/src/shared/dtos.ts',
    '',
    'extends RefCounted',
    '',
  ].join('\n');
}

function emitEnumInt(enumDecl, sourceFile) {
  const name = enumDecl.name.text;
  const members = enumDecl.members.map((m) => m.name.getText(sourceFile));
  return `enum ${name} { ${members.join(', ')} }\n`;
}

function emitEnumString(enumDecl, sourceFile) {
  const name = enumDecl.name.text;
  const pairs = enumDecl.members.map((m) => {
    const key = m.name.getText(sourceFile);
    const init = m.initializer ? nodeText(sourceFile, m.initializer) : 'null';
    return `  "${escapeGdString(key)}": ${init}`;
  });
  return [
    `const ${name}: Dictionary = {`,
    pairs.join(',\n'),
    '}\n',
  ].join('\n');
}

function isStringEnum(enumDecl) {
  return enumDecl.members.some((m) => m.initializer && ts.isStringLiteral(m.initializer));
}

function emitClass(classDecl, sourceFile) {
  const name = classDecl.name.text;
  const fields = [];

  for (const member of classDecl.members) {
    if (!ts.isPropertyDeclaration(member) || !member.name) continue;

    const fieldName = member.name.getText(sourceFile);
    const optional = !!member.questionToken;
    const trailing = getTrailingCommentText(sourceFile, member);
    const gdType = mapTsTypeToGdType(member.type, trailing, sourceFile);

    fields.push({ fieldName, optional, gdType });
  }

  const lines = [];
  lines.push(`class ${name}:`);

  if (fields.length === 0) {
    lines.push('  pass');
    lines.push('');
    return lines.join('\n');
  }

  for (const f of fields) {
    const type = f.optional ? 'Variant' : f.gdType;
    const defaultValue = defaultValueForGdType(type);
    lines.push(`  var ${f.fieldName}: ${type} = ${defaultValue}`);
  }

  lines.push('');
  lines.push('  func to_dict() -> Dictionary:');
  lines.push('    return {');
  for (const f of fields) {
    lines.push(`      "${escapeGdString(f.fieldName)}": ${f.fieldName},`);
  }
  lines.push('    }');

  lines.push('');
  lines.push(`  static func from_dict(d: Dictionary) -> ${name}:`);
  lines.push(`    var o := ${name}.new()`);
  for (const f of fields) {
    lines.push(`    if d.has("${escapeGdString(f.fieldName)}"): o.${f.fieldName} = d["${escapeGdString(f.fieldName)}"]`);
  }
  lines.push('    return o');

  lines.push('');
  return lines.join('\n');
}

function emitTypeAliasAsBestEffort(typeAliasDecl, sourceFile) {
  const name = typeAliasDecl.name.text;
  // We only try to emit fields for intersections like A & { ... }.
  const typeNode = typeAliasDecl.type;
  const fields = [];

  if (ts.isIntersectionTypeNode(typeNode)) {
    for (const t of typeNode.types) {
      if (ts.isTypeLiteralNode(t)) {
        for (const m of t.members) {
          if (!ts.isPropertySignature(m) || !m.name) continue;
          const fieldName = m.name.getText(sourceFile);
          const optional = !!m.questionToken;
          const trailing = getTrailingCommentText(sourceFile, m);
          const gdType = mapTsTypeToGdType(m.type, trailing, sourceFile);
          fields.push({ fieldName, optional, gdType });
        }
      }
    }
  }

  const lines = [];
  lines.push(`# NOTE: '${name}' was a TypeScript type alias; generated as a best-effort class.`);
  lines.push(`class ${name}:`);

  if (fields.length === 0) {
    lines.push('  pass');
    lines.push('');
    return lines.join('\n');
  }

  for (const f of fields) {
    const type = f.optional ? 'Variant' : f.gdType;
    const defaultValue = defaultValueForGdType(type);
    lines.push(`  var ${f.fieldName}: ${type} = ${defaultValue}`);
  }

  lines.push('');
  lines.push('  func to_dict() -> Dictionary:');
  lines.push('    return {');
  for (const f of fields) {
    lines.push(`      "${escapeGdString(f.fieldName)}": ${f.fieldName},`);
  }
  lines.push('    }');

  lines.push('');
  lines.push(`  static func from_dict(d: Dictionary) -> ${name}:`);
  lines.push(`    var o := ${name}.new()`);
  for (const f of fields) {
    lines.push(`    if d.has("${escapeGdString(f.fieldName)}"): o.${f.fieldName} = d["${escapeGdString(f.fieldName)}"]`);
  }
  lines.push('    return o');

  lines.push('');
  return lines.join('\n');
}

function main() {
  const { input, outDir, outFile } = parseArgs(process.argv.slice(2));
  const gameServerRoot = path.resolve(__dirname, '..');
  const inputPath = path.resolve(gameServerRoot, input);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  const program = ts.createProgram({
    rootNames: [inputPath],
    options: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      strict: true,
      skipLibCheck: true,
    },
  });

  const sourceFile = program.getSourceFile(inputPath);
  if (!sourceFile) {
    console.error('Failed to parse input file.');
    process.exit(1);
  }

  const emitted = [];
  emitted.push(emitHeader());

  const exportedEnums = [];
  const exportedClasses = [];
  const exportedTypeAliases = [];

  for (const st of sourceFile.statements) {
    if (!isExported(st)) continue;

    if (ts.isEnumDeclaration(st)) exportedEnums.push(st);
    else if (ts.isClassDeclaration(st) && st.name) exportedClasses.push(st);
    else if (ts.isTypeAliasDeclaration(st)) exportedTypeAliases.push(st);
  }

  // Enums first
  for (const e of exportedEnums) {
    if (isStringEnum(e)) emitted.push(emitEnumString(e, sourceFile));
    else emitted.push(emitEnumInt(e, sourceFile));
  }

  if (exportedEnums.length) emitted.push('');

  // Classes
  for (const c of exportedClasses) {
    emitted.push(emitClass(c, sourceFile));
  }

  // Type aliases (best-effort)
  if (exportedTypeAliases.length) {
    emitted.push('# --- Type aliases (best-effort) ---\n');
    for (const t of exportedTypeAliases) {
      emitted.push(emitTypeAliasAsBestEffort(t, sourceFile));
    }
  }

  const outputPath = path.resolve(outDir, outFile);
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, emitted.join('\n'), 'utf8');

  console.log(`Generated: ${outputPath}`);
  console.log(`  Enums:   ${exportedEnums.length}`);
  console.log(`  Classes: ${exportedClasses.length}`);
  console.log(`  Types:   ${exportedTypeAliases.length}`);
}

main();
