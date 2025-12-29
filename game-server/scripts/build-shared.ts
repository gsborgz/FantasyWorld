// Script para gerar arquivos .gd a partir de arquivos TypeScript de tipagem
// Uso: node build-shared.ts

import * as fs from 'fs';
import * as path from 'path';

const SHARED_DIR = path.resolve(__dirname, '../src/shared');
const OUTPUT_DIR = path.resolve(__dirname, '../../client/shared');
const AUTH_SHARED_DIR = path.resolve(__dirname, '../../auth-server/src/shared');

function writeFileIfChanged(outPath: string, content: string) {
  const exists = fs.existsSync(outPath);
  if (exists) {
    const current = fs.readFileSync(outPath, 'utf-8');
    if (current === content) {
      console.log(`Sem alterações: ${outPath}`);
      return false;
    }
  }
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log(`${exists ? 'Atualizado' : 'Gerado'}: ${outPath}`);
  return true;
}

function copyFileIfChanged(src: string, dest: string) {
  const srcContent = fs.readFileSync(src, 'utf-8');
  const exists = fs.existsSync(dest);
  if (exists) {
    const destContent = fs.readFileSync(dest, 'utf-8');
    if (destContent === srcContent) {
      console.log(`Sem alterações (auth-server): ${dest}`);
      return false;
    }
  }
  fs.writeFileSync(dest, srcContent, 'utf-8');
  console.log(`${exists ? 'Atualizado' : 'Copiado'} para auth-server: ${dest}`);
  return true;
}

function tsEnumToGdscriptEnum(ts: string, name: string): string {
  // Remove export, enum, chaves e espaços
  const body = ts
    .replace(/export\s+enum\s+"?([\w_]+)"?\s*{/, '')
    .replace(/}/, '')
    .trim();
  const lines = body
    .split(',')
    .map(l => l.trim())
    .filter(Boolean);
  let gd = `enum ${name} {\n`;
  lines.forEach((l, i) => {
    const key = l.replace(/\s*=.*$/, '');
    gd += `    ${key} = ${i},\n`;
  });
  gd += '}\n';
  return gd;
}

function tsClassToGdscriptClass(ts: string, name: string): string {
  // Extrai propriedades públicas (assume formato simples: public prop: tipo; ou prop: tipo;)
  const bodyMatch = ts.match(new RegExp(`export\\s+class\\s+"?${name}"?[^\\{]*\\{([\\s\\S]*?)\\}`));
  if (!bodyMatch) return `class ${name}:\n    pass\n`;
  const body = bodyMatch[1];
  const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let props: {name: string, type: string}[] = [];
  let gd = `class ${name}:\n`;
  for (const line of lines) {
    // Exemplo: public foo: number; ou foo: string;
    const propMatch = line.match(/^(?:public|private|protected|readonly)?\s*(\w+)\??\s*:\s*([^;]+);/);
    if (propMatch) {
      const prop = propMatch[1];
      const rawType = propMatch[2].trim();
      const gdType = tsTypeToGdType(rawType);
      props.push({name: prop, type: gdType});
      gd += `    var ${prop}: ${gdType}\n`;
    }
  }
  if (props.length > 0) {
    gd += `\n    func _init(`;
    gd += props.map(p => `_${p.name}: ${p.type} = ${p.type === 'String' ? '""' : (p.type === 'bool' ? 'false' : (p.type === 'float' ? '0.0' : (p.type === 'int' ? '0' : (p.type === 'Array' ? '[]' : (p.type === 'Dictionary' ? '{}' : 'null'))) ))}`).join(', ');
    gd += `):\n`;
    for (const p of props) {
      gd += `        ${p.name} = _${p.name}\n`;
    }
  } else {
    gd += `    pass\n`;
  }
  return gd;
}

function tsTypeToGdType(type: string): string {
  switch (type) {
    case 'number': return 'float';
    case 'string': return 'String';
    case 'boolean': return 'bool';
    case 'any': return 'Variant';
    default:
      if (type === 'WebsocketEvents') return 'int';
      if (/^Array<.+>$/.test(type)) return 'Array';
      if (type.endsWith('[]')) return `Array`; // simplificação
      if (type === 'object' || /^Record<.+>$/.test(type)) return 'Dictionary';
      return 'Variant';
  }
}

function tsObjectToGdscriptDict(ts: string, name: string): string {
  // Encontra a posição do export const <name> = {
  const startRegex = new RegExp(`export\\s+const\\s+${name}\\s*=\\s*{`);
  const startMatch = ts.match(startRegex);
  if (!startMatch) return '';
  const startIdx = ts.indexOf(startMatch[0]) + startMatch[0].length - 1;
  // Faz parsing manual para encontrar o fechamento correto do objeto
  let open = 1;
  let endIdx = startIdx;
  while (open > 0 && endIdx < ts.length - 1) {
    endIdx++;
    if (ts[endIdx] === '{') open++;
    if (ts[endIdx] === '}') open--;
  }
  let body = ts.slice(startIdx, endIdx + 1);
  // Remove aspas simples e duplas das chaves e valores
  body = body.replace(/(['"])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":');
  body = body.replace(/: ?'([a-zA-Z0-9_]+)'/g, ': "$1"');
  // Ajusta vírgulas finais
  body = body.replace(/,\s*}/g, '}');
  // Garante fechamento correto de todas as chaves
  let open2 = 0, close2 = 0;
  for (const c of body) {
    if (c === '{') open2++;
    if (c === '}') close2++;
  }
  while (close2 < open2) {
    body += '}';
    close2++;
  }
  return `const ${name} = ${body}`;
}

function tsFunctionToGdscriptFunction(ts: string, name: string): string {
  // Extrai assinatura e corpo da função exportada
  const funcMatch = ts.match(new RegExp(`export\\s+function\\s+${name}\\s*\\(([^)]*)\\)\\s*(:\\s*[^{]+)?\\s*{([\\s\\S]*?)}\\s*$`, 'm'));
  if (!funcMatch) return '';
  const args = funcMatch[1].trim();
  // Remove tipagem dos argumentos
  const gdArgs = args
    ? args.split(',').map(a => a.split(':')[0].trim()).filter(Boolean).join(', ')
    : '';
  let body = funcMatch[3].trim();

  // Extrai apenas o return da função
  const returnMatch = body.match(/return\s+{([\s\S]*?)}/);
  if (returnMatch) {
    // Converte para dicionário GDScript e garante fechamento correto
    let props = returnMatch[1]
      .split(',')
      .map((p: string) => {
        const [k, v] = p.split(':').map((s: string) => s.trim());
        if (k && v) return `"${k}": ${v}`;
        return '';
      })
      .filter(Boolean)
      .join(', ');
    // Corrige dicionário vazio ou aberto
    if (props.trim().endsWith('{')) props += ' }';
    if (!props.trim().endsWith('}')) props += ' }';
    return `func ${name}(${gdArgs}):\n    return { ${props} }`;
  }

  // Se não encontrar return de objeto, retorna corpo limpo
  body = body.replace(/\s*:\s*[^\s]+/g, '');
  body = body.replace(/[{};]/g, '');
  body = body.replace(/any/g, '');
  body = body.split('\n').map(l => '    ' + l.trim()).join('\n');
  return `func ${name}(${gdArgs}):\n${body}`;
}

function processFile(file: string) {
  const content = fs.readFileSync(file, 'utf-8');
  let output = '';

  // Enums
  const enumRegex = /export\s+enum\s+(\w+)\s*{([\s\S]*?)}/g;
  let enumMatch;
  while ((enumMatch = enumRegex.exec(content)) !== null) {
    const name = enumMatch[1];
    const enumContent = `export enum ${name} {${enumMatch[2]}}`;
    output += tsEnumToGdscriptEnum(enumContent, name) + '\n';
  }

  // Objetos
  const objRegex = /export\s+const\s+(\w+)\s*=\s*({[\s\S]*?})/g;
  let objMatch;
  while ((objMatch = objRegex.exec(content)) !== null) {
    const name = objMatch[1];
    output += tsObjectToGdscriptDict(content, name) + '\n';
  }

  // Classes (suporta genéricos e qualquer conteúdo entre o nome e '{')
  const classRegex = /export\s+class\s+(\w+)[^{]*{([\s\S]*?)}/g;
  let classMatch;
  while ((classMatch = classRegex.exec(content)) !== null) {
    const name = classMatch[1];
    output += tsClassToGdscriptClass(content, name) + '\n';
  }

  // Funções
  const funcRegex = /export\s+function\s+(\w+)\s*\([^)]*\)\s*(:\s*[^{]+)?\s*{[\s\S]*?}/g;
  let funcMatch;
  while ((funcMatch = funcRegex.exec(content)) !== null) {
    const name = funcMatch[1];
    output += tsFunctionToGdscriptFunction(content, name) + '\n';
  }

  if (output.trim().length > 0) {
    const baseName = path.basename(file, '.ts');
    const outPath = path.join(OUTPUT_DIR, `${baseName}.gd`);
    writeFileIfChanged(outPath, output.trim() + '\n');
  }
}

function main() {
  // Gera arquivos para o client (Godot)
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const files = fs.readdirSync(SHARED_DIR).filter(f => f.endsWith('.ts'));
  for (const file of files) {
    processFile(path.join(SHARED_DIR, file));
  }

  // Copia arquivos para o auth-server/shared
  if (!fs.existsSync(AUTH_SHARED_DIR)) fs.mkdirSync(AUTH_SHARED_DIR, { recursive: true });
  for (const file of files) {
    const src = path.join(SHARED_DIR, file);
    const dest = path.join(AUTH_SHARED_DIR, file);
    copyFileIfChanged(src, dest);
  }
}

main();
