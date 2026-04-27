import fs from "node:fs";
import path from "node:path";
import ts, { ClassDeclaration, EnumDeclaration } from "typescript";

const indent = "  ";

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
  const enums: EnumDeclaration[] = statements.filter(ts.isEnumDeclaration);
  const classes: ClassDeclaration[] = statements.filter(ts.isClassDeclaration);
  const outParts: string[] = [];

  for (const e of enums) {
    outParts.push(convertEnum(e));
  }

	for (const c of classes) {
    outParts.push(convertClass(c));
	}

  return outParts.join("\n\n");
}

function convertEnum(e: ts.EnumDeclaration): string {
  const name = e.name.text;
  const members = e.members.map(m => {
    const mName = m.name.getText();
    
    if (m.initializer) {
      const value = m.initializer.getText().replace(/'/g, '"');
      
      return `${indent}"${mName}": ${value}`;
    }

    return `${indent}${mName}`;
  });

  const isDictionary = e.members.some(m => m.initializer && ts.isStringLiteral(m.initializer));

  if (isDictionary) {
    return `const ${name} = {\n${members.join(",\n")}\n}`;
  }

  return `enum ${name} {\n${members.join(",\n")}\n}`;
}

function gdDefault(gdType: string): string {
  const defaults: { [key: string]: string } = {
    "String": '""',
    "bool": "false",
    "float": "0.0",
    "int": "0",
    "Variant": "null",
  };
  return defaults[gdType] ?? "0";
}

function convertClass(c: ts.ClassDeclaration): string {
  if (!c.name) return "";

  const className = c.name.text;
  let output = `class ${className}:\n`;

  const props: Array<{ name: string; gdType: string }> = [];

  c.members.forEach(member => {
    if (ts.isPropertyDeclaration(member)) {
      const propName = member.name.getText();
      let gdType = "Variant";

      if (member.type) {
        const tsType = member.type.getText();
        const fullText = member.getFullText();
        const typeMap: { [key: string]: string } = {
          "string": "String",
          "boolean": "bool",
          "number": fullText.includes("Integer") ? "int" : "float",
        };

        gdType = typeMap[tsType] || tsType;

        if (/^[A-Z]$/.test(gdType)) {
          gdType = "Variant";
        }
      }

      props.push({ name: propName, gdType });
      output += `${indent}var ${propName}: ${gdType}\n`;
    }
  });

  output += `\n${indent}func _init(dict: Dictionary = {}) -> void:\n`;
  for (const prop of props) {
    output += `${indent}${indent}${prop.name} = dict.get("${prop.name}", ${gdDefault(prop.gdType)})\n`;
  }

  return output.trimEnd();
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
