/**
 * pdf-parse v1.x helper – bypasses Turbopack / Next.js ESM bundling.
 *
 * Turbopack intercepts every `import`, `require`, and even `createRequire`,
 * replacing the CJS-only pdf-parse with its own bundled version that
 * breaks the default-export. Using `eval("require")` is the standard
 * escape-hatch to force Node's native CJS loader at runtime.
 */
export async function pdfParse(buffer: Buffer) {
  try {
    // ✅ Dynamic import (works in Vercel)
    const pdfModule = await import("pdf-parse");

    // Handle both default + named export cases
    const pdf = pdfModule.default || pdfModule;

    const data = await pdf(buffer);

    return data;
  } catch (error) {
    console.error("PDF Parse Error:", error);
    throw new Error("Failed to parse PDF");
  }
}
