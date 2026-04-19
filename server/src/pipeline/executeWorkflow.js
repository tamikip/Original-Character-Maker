const path = require("path");
const fs = require("fs/promises");
const {
  getWorkflow,
  markStepStatus,
  mergeWorkflowOutputs,
  resetWorkflowStep,
  setWorkflowOutputs,
  setWorkflowStatus
} = require("../services/workflowStore");
const {
  applyPromptOverrides,
  getExpressionPrompt,
  getPromptPack
} = require("../services/promptLoader");
const { createBootstrapCharacterProfile } = require("../services/characterProfile");
const { analyzeCharacterReference } = require("../services/characterUnderstanding");
const { buildCharacterPackSnapshot } = require("../services/characterPack");
const { buildP2gHandoff } = require("../services/p2gHandoff");
const {
  getBackgroundRemovalRunner,
  getCgRunner,
  getExpressionRunner,
  getMimeTypeFromPath
} = require("../services/providerRegistry");
const { formatErrorDetails } = require("../utils/errors");
const { asyncPool } = require("../utils/asyncPool");

function toPublicOutputUrl(workflowId, fileName) {
  return `/outputs/${workflowId}/${fileName}`;
}

async function writeJsonArtifact(workflowId, outputDir, fileName, payload) {
  await fs.writeFile(path.join(outputDir, fileName), JSON.stringify(payload, null, 2), "utf8");
  return toPublicOutputUrl(workflowId, fileName);
}

async function writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    return null;
  }

  if (characterProfile) {
    const characterProfileUrl = await writeJsonArtifact(
      workflowId,
      outputDir,
      "character-profile.json",
      characterProfile
    );

    mergeWorkflowOutputs(workflowId, {
      meta_files: {
        character_profile: characterProfileUrl
      }
    });
  }

  if (promptPack) {
    const promptsUrl = await writeJsonArtifact(workflowId, outputDir, "prompts.json", promptPack);
    mergeWorkflowOutputs(workflowId, {
      meta_files: {
        prompts: promptsUrl
      }
    });
  }

  const currentWorkflow = getWorkflow(workflowId);
  const manifest = {
    workflow_id: workflowId,
    status: currentWorkflow.status,
    current_step: currentWorkflow.current_step,
    generated_at: new Date().toISOString(),
    error: currentWorkflow.error,
    error_details: currentWorkflow.error_details,
    steps: currentWorkflow.steps,
    character_profile: characterProfile,
    prompts: promptPack,
    outputs: currentWorkflow.outputs
  };

  const manifestFileName = "manifest.json";
  const manifestUrl = await writeJsonArtifact(workflowId, outputDir, manifestFileName, manifest);
  mergeWorkflowOutputs(workflowId, {
    manifest: manifestUrl
  });

  const workflowAfterManifest = getWorkflow(workflowId);
  const predictedCharacterPackUrl = toPublicOutputUrl(workflowId, "character-pack.json");
  const predictedP2gHandoffUrl = toPublicOutputUrl(workflowId, "p2g-handoff.json");
  const characterPack = buildCharacterPackSnapshot({
    workflow: {
      ...workflowAfterManifest,
      outputs: {
        ...workflowAfterManifest.outputs,
        meta_files: {
          ...(workflowAfterManifest.outputs?.meta_files || {}),
          character_pack: predictedCharacterPackUrl,
          p2g_handoff: predictedP2gHandoffUrl
        }
      }
    },
    characterProfile,
    promptPack
  });
  const characterPackUrl = await writeJsonArtifact(
    workflowId,
    outputDir,
    "character-pack.json",
    characterPack
  );
  mergeWorkflowOutputs(workflowId, {
    meta_files: {
      character_pack: characterPackUrl
    }
  });

  const workflowAfterCharacterPack = getWorkflow(workflowId);
  const p2gHandoff = buildP2gHandoff({
    workflow: {
      ...workflowAfterCharacterPack,
      outputs: {
        ...workflowAfterCharacterPack.outputs,
        meta_files: {
          ...(workflowAfterCharacterPack.outputs?.meta_files || {}),
          p2g_handoff: predictedP2gHandoffUrl
        }
      }
    },
    characterProfile,
    promptPack
  });
  const p2gHandoffUrl = await writeJsonArtifact(
    workflowId,
    outputDir,
    "p2g-handoff.json",
    p2gHandoff
  );
  mergeWorkflowOutputs(workflowId, {
    meta_files: {
      p2g_handoff: p2gHandoffUrl
    }
  });

  return {
    manifest,
    characterPack,
    p2gHandoff
  };
}

const EXPRESSION_STEP_MAP = {
  thinking: "expression_thinking",
  surprise: "expression_surprise",
  angry: "expression_angry"
};

const CUTOUT_STEP_MAP = {
  thinking: "cutout_expression_thinking",
  surprise: "cutout_expression_surprise",
  angry: "cutout_expression_angry"
};

const CG_STEP_CONFIG = [
  ["cg_01", "cg-01.png"],
  ["cg_02", "cg-02.png"]
];

const REDOABLE_STEP_NAMES = new Set([
  ...Object.values(EXPRESSION_STEP_MAP),
  ...CG_STEP_CONFIG.map(([stepName]) => stepName),
  ...Object.values(CUTOUT_STEP_MAP)
]);

function getAiTaskConcurrency(workflow, config) {
  return workflow?.execution_options?.ai_concurrency_enabled
    ? Math.max(1, config.imageGenConcurrency)
    : 1;
}

function getExpressionNameFromStep(stepName) {
  return Object.entries(EXPRESSION_STEP_MAP).find(([, value]) => value === stepName)?.[0] || null;
}

function getCutoutExpressionName(stepName) {
  return Object.entries(CUTOUT_STEP_MAP).find(([, value]) => value === stepName)?.[0] || null;
}

function getExpressionArtifactFromUrl(outputDir, outputUrl) {
  if (!outputUrl) {
    return null;
  }

  return {
    outputPath: path.join(outputDir, path.basename(outputUrl)),
    mimeType: getMimeTypeFromPath(outputUrl)
  };
}

function getExpressionArtifactFromWorkflow(workflowId, outputDir, expressionName) {
  const workflow = getWorkflow(workflowId);
  const outputUrl = workflow?.outputs?.expressions?.[expressionName];
  return getExpressionArtifactFromUrl(outputDir, outputUrl);
}

function clearStepOutputs(workflowId, stepName) {
  switch (stepName) {
    case "expression_thinking":
      mergeWorkflowOutputs(workflowId, { expressions: { thinking: null } });
      break;
    case "expression_surprise":
      mergeWorkflowOutputs(workflowId, { expressions: { surprise: null } });
      break;
    case "expression_angry":
      mergeWorkflowOutputs(workflowId, { expressions: { angry: null } });
      break;
    case "cg_01": {
      const next = [...(getWorkflow(workflowId)?.outputs?.cg_outputs || [null, null])];
      next[0] = null;
      mergeWorkflowOutputs(workflowId, { cg_outputs: next });
      break;
    }
    case "cg_02": {
      const next = [...(getWorkflow(workflowId)?.outputs?.cg_outputs || [null, null])];
      next[1] = null;
      mergeWorkflowOutputs(workflowId, { cg_outputs: next });
      break;
    }
    case "cutout_expression_thinking":
      mergeWorkflowOutputs(workflowId, { expression_cutouts: { thinking: null } });
      break;
    case "cutout_expression_surprise":
      mergeWorkflowOutputs(workflowId, { expression_cutouts: { surprise: null } });
      break;
    case "cutout_expression_angry":
      mergeWorkflowOutputs(workflowId, { expression_cutouts: { angry: null } });
      break;
    default:
      break;
  }
}

async function buildWorkflowRuntime(workflowId, config, precomputedCharacterProfile = null) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    return null;
  }

  const outputDir = path.join(config.outputDir, workflowId);
  await fs.mkdir(outputDir, { recursive: true });

  const characterProfile =
    precomputedCharacterProfile ||
    analyzeCharacterReference(workflow, createBootstrapCharacterProfile(workflow));
  const promptPack = applyPromptOverrides(
    await getPromptPack(characterProfile),
    workflow.prompt_overrides,
    characterProfile
  );
  promptPack.expression_cutouts = {
    provider: config.bgRemovalProvider
  };

  const backgroundRemovalRunner = getBackgroundRemovalRunner(config);
  const expressionRunner = getExpressionRunner(config);
  const cgRunner = getCgRunner(config);

  mergeWorkflowOutputs(workflowId, {
    providers: {
      remove_background: backgroundRemovalRunner.provider,
      expressions: expressionRunner.provider,
      cg: cgRunner.provider
    }
  });

  return {
    workflowId,
    workflow,
    config,
    outputDir,
    originalSourcePath: workflow.source_image.upload_path,
    originalSourceMimeType: workflow.source_image.mime_type,
    backgroundRemovalRunner,
    expressionRunner,
    cgRunner,
    characterProfile,
    promptPack
  };
}

async function runExpressionGeneration(runtime, expressionName) {
  const { workflowId, expressionRunner, originalSourcePath, originalSourceMimeType, outputDir, characterProfile, promptPack } = runtime;
  const stepName = EXPRESSION_STEP_MAP[expressionName];
  const expressionPrompt =
    promptPack?.expressions?.[expressionName] ||
    (await getExpressionPrompt(expressionName, characterProfile));

  const expressionResult = await runStep(
    workflowId,
    stepName,
    expressionRunner.provider,
    async () =>
      expressionRunner.run({
        config: runtime.config,
        sourcePath: originalSourcePath,
        sourceMimeType: originalSourceMimeType,
        destinationPath: path.join(outputDir, `expression-${expressionName}.png`),
        prompt: expressionPrompt
      }),
    async (result, outputUrl) => {
      mergeWorkflowOutputs(workflowId, {
        expressions: {
          [expressionName]: outputUrl
        },
        providers: {
          expressions: result.provider || expressionRunner.provider
        }
      });
      await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
    },
    {
      fatal: false,
      updateCurrentStep: false
    }
  );

  if (!expressionResult) {
    await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
    return null;
  }

  return {
    outputPath: expressionResult.output_path,
    mimeType: getMimeTypeFromPath(expressionResult.output_path)
  };
}

async function runCgGeneration(runtime, index) {
  const { workflowId, cgRunner, originalSourcePath, originalSourceMimeType, outputDir, characterProfile, promptPack } = runtime;
  const [stepName, outputName] = CG_STEP_CONFIG[index];
  const cgPromptEntry = promptPack.cg?.[index];

  const cgResult = await runStep(
    workflowId,
    stepName,
    cgRunner.provider,
    async () =>
      cgRunner.run({
        config: runtime.config,
        sourcePath: originalSourcePath,
        sourceMimeType: originalSourceMimeType,
        destinationPath: path.join(outputDir, outputName),
        prompt: cgPromptEntry.prompt
      }),
    async (result, outputUrl) => {
      const nextCgOutputs = [...(getWorkflow(workflowId)?.outputs?.cg_outputs || [null, null])];
      nextCgOutputs[index] = outputUrl;

      mergeWorkflowOutputs(workflowId, {
        cg_outputs: nextCgOutputs,
        providers: {
          cg: result.provider || cgRunner.provider
        }
      });
      await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
    },
    {
      fatal: false,
      updateCurrentStep: false
    }
  );

  if (!cgResult) {
    await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
  }

  return cgResult;
}

async function runCutoutGeneration(runtime, expressionName, sourceArtifact = null) {
  const { workflowId, outputDir, characterProfile, promptPack, backgroundRemovalRunner } = runtime;
  const stepName = CUTOUT_STEP_MAP[expressionName];
  const resolvedSourceArtifact = sourceArtifact || getExpressionArtifactFromWorkflow(workflowId, outputDir, expressionName);

  if (!resolvedSourceArtifact?.outputPath) {
    clearStepOutputs(workflowId, stepName);
    await skipStep(
      workflowId,
      outputDir,
      characterProfile,
      promptPack,
      stepName,
      backgroundRemovalRunner.provider,
      `Skipped because ${EXPRESSION_STEP_MAP[expressionName]} failed, so no expression image was available for cutout.`,
      {
        dependency_step: EXPRESSION_STEP_MAP[expressionName],
        reason: "missing_expression_output"
      }
    );
    return null;
  }

  const cutoutResult = await runStep(
    workflowId,
    stepName,
    backgroundRemovalRunner.provider,
    async () =>
      backgroundRemovalRunner.run({
        config: runtime.config,
        sourcePath: resolvedSourceArtifact.outputPath,
        sourceMimeType: resolvedSourceArtifact.mimeType,
        destinationPath: path.join(outputDir, `expression-${expressionName}-cutout.png`)
      }),
    async (result, outputUrl) => {
      mergeWorkflowOutputs(workflowId, {
        expression_cutouts: {
          [expressionName]: outputUrl
        },
        providers: {
          remove_background: result.provider || backgroundRemovalRunner.provider
        }
      });
      await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
    },
    {
      fatal: false
    }
  );

  if (!cutoutResult) {
    await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
  }

  return cutoutResult;
}

async function finalizeWorkflowState(runtime) {
  const { workflowId, outputDir, characterProfile, promptPack, backgroundRemovalRunner, expressionRunner, cgRunner } = runtime;
  const currentWorkflow = getWorkflow(workflowId);
  const failedOrSkippedSteps = Object.entries(currentWorkflow.steps).filter(([, step]) =>
    step.status === "failed" || step.status === "skipped"
  );
  const outputs = {
    ...currentWorkflow.outputs,
    providers: {
      remove_background:
        currentWorkflow.outputs?.providers?.remove_background || backgroundRemovalRunner.provider,
      expressions: currentWorkflow.outputs?.providers?.expressions || expressionRunner.provider,
      cg: currentWorkflow.outputs?.providers?.cg || cgRunner.provider
    }
  };

  setWorkflowOutputs(workflowId, outputs);
  if (failedOrSkippedSteps.length > 0) {
    setWorkflowStatus(
      workflowId,
      "completed_with_errors",
      "done",
      `${failedOrSkippedSteps.length} steps did not finish successfully.`,
      {
        failed_steps: failedOrSkippedSteps.map(([name, step]) => ({
          step: name,
          status: step.status,
          provider: step.provider,
          error: step.error
        }))
      }
    );
  } else {
    setWorkflowStatus(workflowId, "completed", "done", null, null);
  }
  await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
}

async function runStep(workflowId, stepName, provider, runFn, onSuccess, options = {}) {
  const { fatal = true, updateCurrentStep = true } = options;
  markStepStatus(workflowId, stepName, "running", null, { provider });
  if (updateCurrentStep) {
    setWorkflowStatus(workflowId, "running", stepName, null, null);
  }

  try {
    const result = await runFn();
    const outputUrl = result?.output_path
      ? toPublicOutputUrl(workflowId, path.basename(result.output_path))
      : null;

    markStepStatus(workflowId, stepName, "success", null, {
      provider: result?.provider || provider,
      output_url: outputUrl,
      debug: result?.debug || null
    });

    if (typeof onSuccess === "function") {
      await onSuccess(result, outputUrl);
    }

    return result;
  } catch (error) {
    const detailed = formatErrorDetails(error, {
      step: stepName,
      provider,
      workflow_id: workflowId
    });

    markStepStatus(workflowId, stepName, "failed", detailed.message, {
      provider,
      debug: detailed.debug
    });

    if (fatal) {
      setWorkflowStatus(workflowId, "failed", stepName, detailed.message, detailed.debug);
      throw error;
    }

    return null;
  }
}

async function skipStep(workflowId, outputDir, characterProfile, promptPack, stepName, provider, message, debug = null) {
  markStepStatus(workflowId, stepName, "skipped", message, {
    provider,
    debug
  });
  setWorkflowStatus(workflowId, "running", stepName, null, null);
  await writeWorkflowSnapshots(workflowId, outputDir, characterProfile, promptPack);
}

async function executeWorkflow(workflowId, config) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    return null;
  }

  let characterProfile = null;
  let runtime = null;

  try {
    await runStep(workflowId, "validate_input", "system", async () => true);
    characterProfile = createBootstrapCharacterProfile(workflow);
    await runStep(
      workflowId,
      "analyze_character",
      "system",
      async () => {
        characterProfile = analyzeCharacterReference(workflow, characterProfile);
        return {
          debug: {
            profile_stage: characterProfile.profile_stage,
            framing: characterProfile.analysis?.framing || null,
            reference_strength: characterProfile.analysis?.reference_strength || null
          }
        };
      },
      async () => {
        const snapshotRuntime = await buildWorkflowRuntime(workflowId, config, characterProfile);
        await writeWorkflowSnapshots(workflowId, snapshotRuntime.outputDir, characterProfile, snapshotRuntime.promptPack);
      }
    );
    runtime = await buildWorkflowRuntime(workflowId, config, characterProfile);
    await writeWorkflowSnapshots(workflowId, runtime.outputDir, runtime.characterProfile, runtime.promptPack);

    const successfulExpressionArtifacts = {};
    const expressionTasks = Object.keys(EXPRESSION_STEP_MAP).map((expressionName) => async () => {
      const artifact = await runExpressionGeneration(runtime, expressionName);
      successfulExpressionArtifacts[expressionName] = artifact;
      return artifact;
    });

    await asyncPool(expressionTasks, getAiTaskConcurrency(workflow, config));

    const cgTasks = CG_STEP_CONFIG.map(([, _outputName], index) => async () => runCgGeneration(runtime, index));
    await asyncPool(cgTasks, getAiTaskConcurrency(workflow, config));

    for (const expressionName of Object.keys(EXPRESSION_STEP_MAP)) {
      await runCutoutGeneration(runtime, expressionName, successfulExpressionArtifacts[expressionName] || null);
    }

    await finalizeWorkflowState(runtime);
  } catch (error) {
    const currentWorkflow = getWorkflow(workflowId);
    const outputDir = runtime?.outputDir || path.join(config.outputDir, workflowId);

    if (currentWorkflow) {
      await writeWorkflowSnapshots(
        workflowId,
        outputDir,
        runtime?.characterProfile || characterProfile,
        runtime?.promptPack || null
      ).catch(() => null);
    }
  }

  return getWorkflow(workflowId);
}

async function rerunWorkflowStep(workflowId, targetStep, config) {
  const workflow = getWorkflow(workflowId);
  if (!workflow) {
    return null;
  }

  if (!REDOABLE_STEP_NAMES.has(targetStep)) {
    throw new Error(`Unsupported workflow redo step: ${targetStep}`);
  }

  let runtime = null;

  try {
    runtime = await buildWorkflowRuntime(workflowId, config);
    clearStepOutputs(workflowId, targetStep);
    resetWorkflowStep(workflowId, targetStep);
    setWorkflowStatus(workflowId, "running", targetStep, null, null);

    const expressionName = getExpressionNameFromStep(targetStep);
    if (expressionName) {
      const cutoutStep = CUTOUT_STEP_MAP[expressionName];
      clearStepOutputs(workflowId, cutoutStep);
      resetWorkflowStep(workflowId, cutoutStep);

      const artifact = await runExpressionGeneration(runtime, expressionName);
      await runCutoutGeneration(runtime, expressionName, artifact);
      await finalizeWorkflowState(runtime);
      return getWorkflow(workflowId);
    }

    const cgIndex = CG_STEP_CONFIG.findIndex(([stepName]) => stepName === targetStep);
    if (cgIndex >= 0) {
      await runCgGeneration(runtime, cgIndex);
      await finalizeWorkflowState(runtime);
      return getWorkflow(workflowId);
    }

    const cutoutExpressionName = getCutoutExpressionName(targetStep);
    if (cutoutExpressionName) {
      await runCutoutGeneration(runtime, cutoutExpressionName);
      await finalizeWorkflowState(runtime);
      return getWorkflow(workflowId);
    }
  } catch (error) {
    if (runtime) {
      await writeWorkflowSnapshots(
        workflowId,
        runtime.outputDir,
        runtime.characterProfile,
        runtime.promptPack
      ).catch(() => null);
    }
    throw error;
  }

  return getWorkflow(workflowId);
}

module.exports = {
  executeWorkflow,
  rerunWorkflowStep
};
