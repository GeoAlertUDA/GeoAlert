/**
 * Convierte el KML de paradas de Mendoza a un JSON limpio con lat/lon
 *
 * Uso:
 *   node scripts/kml-to-json.js paradas.kml
 *   node scripts/kml-to-json.js --dry-run paradas.kml
 *   node scripts/kml-to-json.js paradas.kml --out src/features/map/data/paradas.json
 */

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  let dryRun = false;
  let outPath = null;
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--out") {
      outPath = argv[++i];
      if (!outPath) {
        console.error("Error: --out requiere una ruta.");
        process.exit(1);
      }
    } else if (a.startsWith("--out=")) outPath = a.slice(6);
    else if (a.startsWith("-")) {
      console.error("Argumento desconocido:", a);
      process.exit(1);
    } else positional.push(a);
  }
  return { dryRun, outPath, inputFile: positional[0] };
}

function decodeXmlText(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Intenta obtener id desde SimpleData (varios nombres posibles en datos abiertos). */
function extractIdFromBlock(block) {
  const idPatterns = [
    /<SimpleData\s+name="[^"]*[Nn]úmero[^"]*"[^>]*>([\s\S]*?)<\/SimpleData>/,
    /<SimpleData\s+name="[^"]*[Ii]d[^"]*"[^>]*>([\s\S]*?)<\/SimpleData>/,
    /<Data\s+name="[^"]*[Nn]úmero[^"]*"[^>]*>\s*<value>([\s\S]*?)<\/value>/,
  ];
  for (const re of idPatterns) {
    const m = block.match(re);
    if (m) return decodeXmlText(m[1].trim());
  }
  return null;
}

/** KML Ciudad 2023: el código (M10003) va en <name>; el nombre amigable en <description> CDATA. */
function extractFriendlyNameFromDescription(block) {
  const dm = block.match(/<description>([\s\S]*?)<\/description>/);
  if (!dm) return null;
  const inner = dm[1];
  const cdata = inner.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  const text = cdata ? cdata[1] : inner;
  const nm =
    text.match(/Nombre:\s*<\/b>\s*([^<\n\r]+)/i) ||
    text.match(/<b>\s*Nombre:\s*<\/b>\s*([^<\n\r]+)/i);
  return nm ? decodeXmlText(nm[1].trim()) : null;
}

/** Código de parador tipo M10003 / M1001 (portal Mendoza). */
function isParadaCode(s) {
  return /^M[\dA-Z]+$/i.test((s || "").trim());
}

function placemarkToParada(block, index) {
  const nameMatch = block.match(/<name>([\s\S]*?)<\/name>/);
  const nameFromTag = nameMatch ? decodeXmlText(nameMatch[1].trim()) : "";

  const coordMatch = block.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
  if (!coordMatch) return null;

  const coordStr = coordMatch[1].trim().split(/\s+/)[0];
  const parts = coordStr.split(",").map(Number);
  const lon = parts[0];
  const lat = parts[1];
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  const idFromExt = extractIdFromBlock(block);
  const codeFromName = isParadaCode(nameFromTag) ? nameFromTag : null;
  const id = idFromExt || codeFromName || `parada-${index}`;

  const friendly = extractFriendlyNameFromDescription(block);
  const nombre =
    friendly && friendly.length > 0
      ? friendly
      : nameFromTag || `Parada ${index + 1}`;

  return { id, nombre, lat, lon };
}

function main() {
  const { dryRun, outPath, inputFile } = parseArgs(process.argv.slice(2));

  if (!inputFile) {
    console.error("Uso: node scripts/kml-to-json.js [--dry-run] [--out ruta.json] <archivo.kml>");
    process.exit(1);
  }

  const absInput = path.isAbsolute(inputFile)
    ? inputFile
    : path.join(process.cwd(), inputFile);

  if (!fs.existsSync(absInput)) {
    console.error("No existe el archivo:", absInput);
    process.exit(1);
  }

  const kml = fs.readFileSync(absInput, "utf-8");

  const placemarks = [...kml.matchAll(/<Placemark>([\s\S]*?)<\/Placemark>/g)];
  console.log(`✅ Placemarks encontrados: ${placemarks.length}`);

  let skipped = 0;
  const paradas = placemarks
    .map((match, index) => {
      const block = match[1];
      const p = placemarkToParada(block, index);
      if (!p) skipped += 1;
      return p;
    })
    .filter(Boolean);

  if (dryRun) {
    console.log("✅ Dry run — primeros 3:");
    paradas.slice(0, 3).forEach((p) => {
      console.log(`  ${JSON.stringify(p)}`);
    });
    console.log(`⚠️  Skipped (sin coords o mal formados): ${skipped}`);
    console.log(`✅ Registros válidos (previo a escritura): ${paradas.length}`);
    return;
  }

  const defaultOut = path.join(
    path.dirname(absInput),
    path.basename(absInput, path.extname(absInput)) + ".json",
  );
  const outputFile = outPath
    ? path.isAbsolute(outPath)
      ? outPath
      : path.join(process.cwd(), outPath)
    : defaultOut;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(paradas, null, 2), "utf-8");

  console.log(`✅ ${paradas.length} paradas convertidas → ${outputFile}`);
  console.log(`⚠️  Skipped durante el parseo: ${skipped}`);
}

main();
