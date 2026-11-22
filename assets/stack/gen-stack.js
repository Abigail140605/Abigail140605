// Genera filas de íconos de tecnologías (devicon) sobre cuadros con la paleta del portafolio.
// Uso (desde la raíz del repo): node assets/stack/gen-stack.js assets/stack
// Para agregar una tecnología: busca su id en https://devicon.dev y agrégala a la fila que corresponda.
const fs = require("fs");
const path = require("path");

const VERSION = "2.17.0";
const out = process.argv[2];

const rows = {
  backend: [
    ["csharp", "original", "C#"], ["dotnetcore", "original", ".NET"], ["java", "original", "Java"],
    ["spring", "original", "Spring Boot"], ["php", "original", "PHP"], ["laravel", "original", "Laravel"],
    ["nodejs", "original", "Node.js"], ["python", "original", "Python"],
  ],
  frontend: [
    ["html5", "original", "HTML"], ["css3", "original", "CSS"], ["javascript", "original", "JavaScript"],
    ["tailwindcss", "original", "Tailwind CSS"], ["kotlin", "original", "Kotlin"],
    ["androidstudio", "original", "Android Studio"],
  ],
  databases: [
    ["postgresql", "original", "PostgreSQL"], ["mysql", "original", "MySQL"],
    ["microsoftsqlserver", "plain", "SQL Server"], ["entityframeworkcore", "original", "Entity Framework Core"],
  ],
  tools: [
    ["git", "original", "Git"], ["github", "original", "GitHub"], ["docker", "original", "Docker"],
    ["postman", "original", "Postman"], ["figma", "original", "Figma"], ["jira", "original", "Jira"],
  ],
};

// Íconos oscuros que no se ven sobre el fondo azul noche: se aclaran.
const recolor = {
  github: (s) => s.replace(/#181616/gi, "#f1f2ff"),
  java: (s) => s.replace(/#0074BD/gi, "#5ea9ff"),
  mysql: (s) => s.replace(/#00618A/gi, "#4fb3e0"),
  microsoftsqlserver: (s) => s.replace(/#ee352c/gi, "#ff5a52"),
};

const TILE = 48, GAP = 10, ICON = 32, R = 12;

(async () => {
  for (const [name, icons] of Object.entries(rows)) {
    const parts = [];
    for (const [i, [id, variant, label]] of icons.entries()) {
      const url = `https://cdn.jsdelivr.net/npm/devicon@${VERSION}/icons/${id}/${id}-${variant}.svg`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      let svg = await res.text();
      if (recolor[id]) svg = recolor[id](svg);
      // El SVG del ícono va incrustado (no como data URI) para que GitHub lo muestre siempre.
      // Los id internos llevan prefijo para que no choquen entre íconos.
      const p = `${id}-`;
      const viewBox = (svg.match(/viewBox="([^"]+)"/) || [, "0 0 128 128"])[1];
      const inner = svg
        .replace(/^[\s\S]*?<svg[^>]*>/, "")
        .replace(/<\/svg>\s*$/, "")
        .replace(/\bid="([^"]+)"/g, `id="${p}$1"`)
        .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
        .replace(/href="#([^"]+)"/g, `href="#${p}$1"`);
      const x = i * (TILE + GAP);
      const o = (TILE - ICON) / 2;
      parts.push(
        `  <g transform="translate(${x} 0)"><title>${label}</title>` +
        `<rect width="${TILE}" height="${TILE}" rx="${R}" fill="#151b44" stroke="#96a0ff" stroke-opacity=".22"/>` +
        `<svg x="${o}" y="${o}" width="${ICON}" height="${ICON}" viewBox="${viewBox}">${inner}</svg></g>`
      );
    }
    const w = icons.length * (TILE + GAP) - GAP;
    const labels = icons.map((x) => x[2]).join(", ");
    const file =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${TILE}" viewBox="0 0 ${w} ${TILE}" role="img" aria-label="${labels}">\n` +
      `  <!-- Íconos: devicon ${VERSION} (MIT) · generado con gen-stack.js -->\n` +
      parts.join("\n") + "\n</svg>\n";
    fs.writeFileSync(path.join(out, `${name}.svg`), file);
    console.log(name, icons.length, "icons", file.length, "bytes");
  }
})();
