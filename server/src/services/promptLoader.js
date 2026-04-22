const fs = require("fs/promises");
const path = require("path");
const config = require("../config");
const {
  applyPromptOverrides,
  compileExpressionPrompt,
  compilePromptPack,
  setExpressionPrompts,
  setCgPromptTemplate
} = require("./promptCompiler");

const promptCache = new Map();

function extractPromptFromMarkdown(content) {
  const lines = content.split("\n");
  let inSection = false;
  const promptLines = [];
  for (const line of lines) {
    if (/^##\s*(Current Prompt|Current Core Prompt)/i.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (/^##\s/.test(line)) break;
      if (line.trim()) promptLines.push(line.trim());
    }
  }
  return promptLines.join("\n") || content.replace(/^#.*$/gm, "").trim();
}

function extractCgDataFromMarkdown(content) {
  const lines = content.split("\n");
  let inPrompt = false;
  let inScenes = false;
  const promptLines = [];
  const scenes = [];
  for (const line of lines) {
    if (/^##\s*Current Core Prompt/i.test(line)) {
      inPrompt = true;
      inScenes = false;
      continue;
    }
    if (/^##\s*Example Scene Pool/i.test(line)) {
      inPrompt = false;
      inScenes = true;
      continue;
    }
    if (/^##\s/.test(line)) {
      inPrompt = false;
      inScenes = false;
      continue;
    }
    if (inPrompt && line.trim()) promptLines.push(line.trim());
    if (inScenes && /^-\s+(.+)$/.test(line.trim())) {
      scenes.push(line.trim().replace(/^-\s+/, ""));
    }
  }
  return {
    template: promptLines.join("\n") || null,
    scenes: scenes.length > 0 ? scenes : null
  };
}

async function loadPromptFile(fileName) {
  if (promptCache.has(fileName)) {
    return promptCache.get(fileName);
  }

  const filePath = path.join(config.promptsDir, fileName);
  const content = await fs.readFile(filePath, "utf8");
  const normalized = content.trim();
  promptCache.set(fileName, normalized);
  return normalized;
}

async function ensurePromptDocsLoaded() {
  await Promise.all([
    loadPromptFile("expression-thinking.md"),
    loadPromptFile("expression-surprise.md"),
    loadPromptFile("expression-angry.md"),
    loadPromptFile("cg-generation.md")
  ]);

  const thinkingRaw = promptCache.get("expression-thinking.md") || "";
  const surpriseRaw = promptCache.get("expression-surprise.md") || "";
  const angryRaw = promptCache.get("expression-angry.md") || "";
  const cgRaw = promptCache.get("cg-generation.md") || "";

  setExpressionPrompts({
    thinking: extractPromptFromMarkdown(thinkingRaw),
    surprise: extractPromptFromMarkdown(surpriseRaw),
    angry: extractPromptFromMarkdown(angryRaw)
  });

  const cgData = extractCgDataFromMarkdown(cgRaw);
  if (cgData.template) {
    setCgPromptTemplate(cgData.template, cgData.scenes);
  }
}

async function getExpressionPrompt(expressionName, characterProfile = null) {
  await ensurePromptDocsLoaded();
  return compileExpressionPrompt(characterProfile, expressionName);
}

async function getCgPrompts(characterProfile = null) {
  await ensurePromptDocsLoaded();
  return compilePromptPack(characterProfile).cg;
}

async function getPromptPack(characterProfile = null) {
  await ensurePromptDocsLoaded();
  return compilePromptPack(characterProfile);
}

module.exports = {
  applyPromptOverrides,
  getCgPrompts,
  getExpressionPrompt,
  getPromptPack
};
