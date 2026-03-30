import fs from "node:fs";
import path from "node:path";
import ts, { ClassDeclaration, EnumDeclaration, InterfaceDeclaration, TypeAliasDeclaration } from "typescript";

const indent = "    ";

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  validateArgs(args);

  const outputGdPath = path.resolve(args[1]);
  const inputTsPath = path.resolve(args[0]);
  const typesText = fs.readFileSync(inputTsPath, "utf8");
  const typesSource = ts.createSourceFile(inputTsPath, typesText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const output = setOutput(typesSource.statements);

  fs.mkdirSync(path.dirname(outputGdPath), { recursive: true });
  fs.writeFileSync(outputGdPath, output, "utf8");

  console.log(`Generated: ${outputGdPath}`);
}

function validateArgs(args: string[]): void {
  if (args.length < 2) {
    console.error("Usage: ts-node ts-type-to-gds.ts <input_ts_path> <output_gd_path>");
    process.exit(1);
  }

  if (!fs.existsSync(args[0])) {
    console.error(`Input TypeScript file does not exist: ${args[0]}`);
    process.exit(1);
  }

  if (!fs.existsSync(args[1])) {
    console.error(`Output directory does not exist: ${args[1]}`);
    process.exit(1);
  }
}

function setOutput(statements: ts.NodeArray<ts.Statement>): string {
  const enums: EnumDeclaration[] = [];
  const classes: ClassDeclaration[] = [];

  for (const statement of statements) {
    if (ts.isEnumDeclaration(statement)) {
      enums.push(statement);
    }

    if (ts.isClassDeclaration(statement)) {
      classes.push(statement);
    }
  }

  const outParts: string[] = [];

  for (const e of enums) {
    outParts.push(convertEnum(e));
		outParts.push("");
  }

	for (const c of classes) {
    outParts.push(convertClass(c));
		outParts.push("");
	}

  return outParts.join("\n").trimEnd() + "\n";
}

function convertEnum(e: ts.EnumDeclaration): string {
  let text = e.getText(); 
  
  if (!text.includes("export enum")) return '';

  const isObject = text.includes("=");
  
  if (isObject) {
    text = text.replace(/export\s+enum\s+(\w+)/, "const $1 =");
    text = text.replace(/'/g, '"');
    text = text.replace(/(\w+)\s*=/g, '"$1":');
  }
  
  if (!isObject) {
    text = text.replace(/export\s+enum\s+(\w+)/, "enum $1:");
    text = text.replace(/{/, "").replace(/}$/, "");
  }
  
  return text;
}

function convertClass(c: ts.ClassDeclaration): string {
  let text = c.getText(); 
  
  if (!text.includes("export class")) return '';

  text = text.replace(/export\s+class\s+(\w+)/, "class $1:");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/{/, "").replace(/}$/, "");
  text = text.replace(/\bstring\b/g, "String");
  text = text.replace(/number;\s*\/\/\s*Integer/g, "int");
  text = text.replace(/number;\s*\/\/\s*Float/g, "float");
  text = text.replace(/\bboolean\b/g, "bool");
  text = text.replace(/:\s*[A-Z]+\s*;/g, ": Variant");
  text = text.replace(/:\s*Record<string,\s*any>\s*;/g, ": Variant");
  text = text.replace(/;\s*$/gm, "");

  return text;
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
