import fs from "node:fs/promises";
import path from "node:path";
import * as ts from "typescript";

type EnumMember = { name: string; value: number | string };
type EnumSpec = { name: string; kind: "number" | "string"; members: EnumMember[] };
type PropertySpec = {
	name: string;
	gdType: string;
	defaultValue: string;
};

const INDENT = "    ";

async function readUtf8(filePath: string): Promise<string> {
	return fs.readFile(filePath, "utf8");
}

function createSourceFile(filePath: string, text: string): ts.SourceFile {
	return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function getLineText(lines: string[], sourceFile: ts.SourceFile, pos: number): string {
	const lc = sourceFile.getLineAndCharacterOfPosition(pos);
	return lines[lc.line] ?? "";
}

function getTrailingHint(lines: string[], sourceFile: ts.SourceFile, node: ts.Node): "Float" | "Integer" | null {
	const lineText = getLineText(lines, sourceFile, node.end);
	const match = lineText.match(/\/\/\s*(Float|Integer)\b/);
	return (match?.[1] as "Float" | "Integer" | undefined) ?? null;
}

function isExported(node: ts.Node): boolean {
	const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
	return Boolean(modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword));
}

function getIdentifierText(name: ts.PropertyName | undefined): string | null {
	if (!name) return null;
	if (ts.isIdentifier(name)) return name.text;
	if (ts.isStringLiteral(name)) return name.text;
	return null;
}

function gdDefaultForType(gdType: string): string {
	switch (gdType) {
		case "String":
			return '""';
		case "float":
			return "0.0";
		case "int":
			return "0";
		case "bool":
			return "false";
		case "Variant":
		default:
			return "null";
	}
}

function mapTsTypeToGdType(typeNode: ts.TypeNode | undefined, hint: "Float" | "Integer" | null): string {
	if (!typeNode) return "Variant";

	switch (typeNode.kind) {
		case ts.SyntaxKind.StringKeyword:
			return "String";
		case ts.SyntaxKind.NumberKeyword:
			return hint === "Integer" ? "int" : "float";
		case ts.SyntaxKind.BooleanKeyword:
			return "bool";
		default:
			break;
	}

	if (ts.isTypeReferenceNode(typeNode)) {
		const typeName = ts.isIdentifier(typeNode.typeName) ? typeNode.typeName.text : null;
		if (typeName === "Date") return "Variant";
		// Enums e tipos externos viram int/Variant no cliente.
		if (typeName === "WorldInstance") return "String";
		if (typeName === "Direction" || typeName === "WebsocketEvents") return "int";
		return "Variant";
	}

	if (ts.isUnionTypeNode(typeNode)) {
		return "Variant";
	}

	if (ts.isArrayTypeNode(typeNode)) {
		return "Variant";
	}

	return "Variant";
}

function extractEnumSpec(decl: ts.EnumDeclaration): EnumSpec {
	const members: EnumMember[] = [];
	let currentValue = -1;
	let kind: EnumSpec["kind"] = "number";

	for (const member of decl.members) {
		const name = getIdentifierText(member.name);
		if (!name) continue;

		if (member.initializer) {
			if (ts.isNumericLiteral(member.initializer)) {
				currentValue = Number(member.initializer.text);
				members.push({ name, value: currentValue });
				continue;
			}
			if (ts.isStringLiteral(member.initializer)) {
				kind = "string";
				members.push({ name, value: member.initializer.text });
				continue;
			}
		}

		// Sem initializer: só faz sentido para enums numéricos.
		currentValue += 1;
		members.push({ name, value: currentValue });
	}

	if (members.some((m) => typeof m.value === "string")) {
		kind = "string";
	}

	return { name: decl.name.text, kind, members };
}

function emitEnumOrConst(spec: EnumSpec): string {
	const lines: string[] = [];

	if (spec.kind === "string") {
		lines.push(`const ${spec.name} = {`);
		for (const m of spec.members) {
			// Para evitar dúvidas de sintaxe/chave, usa sempre chaves string.
			lines.push(`${INDENT}"${m.name}": "${String(m.value)}",`);
		}
		lines.push("}");
		return lines.join("\n");
	}

	lines.push(`enum ${spec.name} {`);
	for (const m of spec.members) {
		lines.push(`${INDENT}${m.name} = ${m.value as number},`);
	}
	lines.push("}");
	return lines.join("\n");
}

function extractClassProperties(
	sourceFile: ts.SourceFile,
	sourceTextLines: string[],
	classDecl: ts.ClassDeclaration,
): PropertySpec[] {
	const props: PropertySpec[] = [];

	for (const member of classDecl.members) {
		if (!ts.isPropertyDeclaration(member)) continue;
		if (member.modifiers?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword)) continue;

		const name = getIdentifierText(member.name);
		if (!name) continue;

		const hint = getTrailingHint(sourceTextLines, sourceFile, member);
		const gdType = mapTsTypeToGdType(member.type, hint);
		const defaultValue = gdDefaultForType(gdType);
		props.push({ name, gdType, defaultValue });
	}

	return props;
}

function emitDefaultClass(name: string, props: PropertySpec[]): string {
	const lines: string[] = [];
	lines.push(`class ${name}:`);

	for (const p of props) {
		lines.push(`${INDENT}var ${p.name}: ${p.gdType}`);
	}
	lines.push("");

	const args = props
		.map((p) => `_${p.name}: ${p.gdType} = ${p.defaultValue}`)
		.join(", ");
	lines.push(`${INDENT}func _init(${args}):`);
	for (const p of props) {
		lines.push(`${INDENT}${INDENT}${p.name} = _${p.name}`);
	}
	lines.push("");

	lines.push(`${INDENT}func to_dict() -> Dictionary:`);
	lines.push(`${INDENT}${INDENT}var d: Dictionary = {}`);
	for (const p of props) {
		lines.push(`${INDENT}${INDENT}d["${p.name}"] = ${p.name}`);
	}
	lines.push(`${INDENT}${INDENT}return d`);
	lines.push("");

	lines.push(`${INDENT}static func from(value: Variant) -> ${name}:`);
	lines.push(`${INDENT}${INDENT}if typeof(value) == TYPE_OBJECT and value is ${name}:`);
	lines.push(`${INDENT}${INDENT}${INDENT}return value`);
	lines.push(`${INDENT}${INDENT}if typeof(value) == TYPE_DICTIONARY:`);
	lines.push(`${INDENT}${INDENT}${INDENT}var raw: Dictionary = value`);
	lines.push(`${INDENT}${INDENT}${INDENT}var obj := ${name}.new()`);
	for (const p of props) {
		lines.push(`${INDENT}${INDENT}${INDENT}obj.${p.name} = raw.get("${p.name}", ${p.defaultValue})`);
	}
	lines.push(`${INDENT}${INDENT}${INDENT}return obj`);
	lines.push(`${INDENT}${INDENT}return null`);

	return lines.join("\n");
}

function emitWebsocketMessageClass(): string {
	// Mantém o formato já usado pelo cliente (type + data, com helpers).
	return [
		"class WebsocketMessage:",
		`${INDENT}var type: int`,
		`${INDENT}var data: Variant`,
		"",
		`${INDENT}func _init(_type: int = 0, _data: Variant = null):`,
		`${INDENT}${INDENT}type = _type`,
		`${INDENT}${INDENT}data = _data`,
		"",
		`${INDENT}func to_dict() -> Dictionary:`,
		`${INDENT}${INDENT}var d: Dictionary = {}`,
		`${INDENT}${INDENT}d["type"] = type`,
		`${INDENT}${INDENT}var payload = data`,
		`${INDENT}${INDENT}if typeof(payload) == TYPE_OBJECT and payload != null and payload.has_method("to_dict"):` ,
		`${INDENT}${INDENT}${INDENT}payload = payload.to_dict()`,
		`${INDENT}${INDENT}d["data"] = payload`,
		`${INDENT}${INDENT}return d`,
		"",
		`${INDENT}func _to_string() -> String:`,
		`${INDENT}${INDENT}var payload_data = data`,
		`${INDENT}${INDENT}if typeof(payload_data) == TYPE_OBJECT and payload_data != null and payload_data.has_method("to_dict"):` ,
		`${INDENT}${INDENT}${INDENT}payload_data = payload_data.to_dict()`,
		`${INDENT}${INDENT}var json_obj := {`,
		`${INDENT}${INDENT}${INDENT}"type": type,`,
		`${INDENT}${INDENT}${INDENT}"data": payload_data,`,
		`${INDENT}${INDENT}}`,
		`${INDENT}${INDENT}return JSON.stringify(json_obj)`,
	].join("\n");
}

function resolveImportBase(fromFilePath: string, moduleSpecifierText: string): string | null {
	if (!moduleSpecifierText.startsWith(".")) return null;
	return path.resolve(path.dirname(fromFilePath), moduleSpecifierText);
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function buildImportMap(filePath: string, sourceFile: ts.SourceFile): Promise<Map<string, string>> {
	const map = new Map<string, string>();
	for (const st of sourceFile.statements) {
		if (!ts.isImportDeclaration(st)) continue;
		if (!st.importClause?.namedBindings) continue;
		if (!ts.isNamedImports(st.importClause.namedBindings)) continue;
		const spec = st.moduleSpecifier;
		if (!ts.isStringLiteral(spec)) continue;

		const base = resolveImportBase(filePath, spec.text);
		if (!base) continue;
		const candidates = [`${base}.ts`, path.join(base, "index.ts")];
		let resolvedTs: string | null = null;
		for (const candidate of candidates) {
			if (await fileExists(candidate)) {
				resolvedTs = candidate;
				break;
			}
		}
		if (!resolvedTs) continue;

		for (const el of st.importClause.namedBindings.elements) {
			const importName = el.name.text;
			map.set(importName, resolvedTs);
		}
	}
	return map;
}

async function collectClassPropertiesRecursive(
	filePath: string,
	className: string,
	visited: Set<string> = new Set(),
): Promise<PropertySpec[]> {
	const visitKey = `${filePath}::${className}`;
	if (visited.has(visitKey)) return [];
	visited.add(visitKey);

	const text = await readUtf8(filePath);
	const sf = createSourceFile(filePath, text);
	const lines = text.split(/\r?\n/);

	const importMap = await buildImportMap(filePath, sf);

	const classDecl = sf.statements.find(
		(st): st is ts.ClassDeclaration => ts.isClassDeclaration(st) && st.name?.text === className,
	);
	if (!classDecl) return [];

	const ownProps = extractClassProperties(sf, lines, classDecl).map((p) => {
		// Ajuste para o padrão do cliente: Date vira Variant (já é), e numbers default float.
		return p;
	});

	let baseProps: PropertySpec[] = [];
	if (classDecl.heritageClauses) {
		const extendsClause = classDecl.heritageClauses.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
		const baseType = extendsClause?.types?.[0];
		if (baseType && ts.isExpressionWithTypeArguments(baseType)) {
			const expr = baseType.expression;
			if (ts.isIdentifier(expr)) {
				const baseName = expr.text;
				// base na mesma unidade
				if (sf.statements.some((st) => ts.isClassDeclaration(st) && st.name?.text === baseName)) {
					baseProps = await collectClassPropertiesRecursive(filePath, baseName, visited);
				} else {
					const importedFrom = importMap.get(baseName);
					if (importedFrom) {
						baseProps = await collectClassPropertiesRecursive(importedFrom, baseName, visited);
					}
				}
			}
		}
	}

	const all = [...baseProps, ...ownProps];
	// Remove duplicados mantendo a primeira ocorrência.
	const seen = new Set<string>();
	return all.filter((p) => {
		if (seen.has(p.name)) return false;
		seen.add(p.name);
		return true;
	});
}

async function main(): Promise<void> {
	const dtosTsPath = path.resolve(__dirname, "..", "src", "shared", "dtos.ts");
	const outGdPath = path.resolve(__dirname, "..", "..", "client", "shared", "dtos.gd");

	const dtosText = await readUtf8(dtosTsPath);
	const dtosSf = createSourceFile(dtosTsPath, dtosText);
	const dtosLines = dtosText.split(/\r?\n/);

	const enums: EnumSpec[] = [];
	const classes: Array<{ name: string; props: PropertySpec[] }> = [];
	const typeAliases: Array<{ name: string; props: PropertySpec[] }> = [];

	for (const st of dtosSf.statements) {
		if (ts.isEnumDeclaration(st) && isExported(st) && st.name) {
			enums.push(extractEnumSpec(st));
			continue;
		}

		if (ts.isClassDeclaration(st) && isExported(st) && st.name) {
			const name = st.name.text;
			if (name === "WebsocketMessage") {
				classes.push({ name, props: [] });
			} else {
				classes.push({ name, props: extractClassProperties(dtosSf, dtosLines, st) });
			}
			continue;
		}

		if (ts.isTypeAliasDeclaration(st) && isExported(st) && st.name) {
			const name = st.name.text;
			if (name === "ClientCharacter") {
				// ClientCharacter = Character & { ... }
				const characterEntityPath = path.resolve(
					__dirname,
					"..",
					"src",
					"core",
					"entities",
					"character.entity.ts",
				);

				const baseProps = await collectClassPropertiesRecursive(characterEntityPath, "Character");

				const extraProps: PropertySpec[] = [];
				if (ts.isIntersectionTypeNode(st.type)) {
					for (const t of st.type.types) {
						if (ts.isTypeLiteralNode(t)) {
							for (const m of t.members) {
								if (!ts.isPropertySignature(m)) continue;
								const propName = getIdentifierText(m.name);
								if (!propName) continue;
								const hint = getTrailingHint(dtosLines, dtosSf, m);
								const gdType = mapTsTypeToGdType(m.type, hint);
								extraProps.push({ name: propName, gdType, defaultValue: gdDefaultForType(gdType) });
							}
						}
					}
				}

				const combined = [...baseProps, ...extraProps];
				const seen = new Set<string>();
				const unique = combined.filter((p) => {
					if (seen.has(p.name)) return false;
					seen.add(p.name);
					return true;
				});

				typeAliases.push({ name, props: unique });
			}
		}
	}

	const outParts: string[] = [];

	for (const e of enums) {
		outParts.push(emitEnumOrConst(e));
		outParts.push("");
	}

	for (const c of classes) {
		if (c.name === "WebsocketMessage") {
			outParts.push(emitWebsocketMessageClass());
		} else {
			outParts.push(emitDefaultClass(c.name, c.props));
		}
		outParts.push("");
	}

	for (const t of typeAliases) {
		outParts.push(emitDefaultClass(t.name, t.props));
		outParts.push("");
	}

	const output = outParts.join("\n").trimEnd() + "\n";
	await fs.mkdir(path.dirname(outGdPath), { recursive: true });
	await fs.writeFile(outGdPath, output, "utf8");
	// eslint-disable-next-line no-console
	console.log(`Generated: ${outGdPath}`);
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exitCode = 1;
});
