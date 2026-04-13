import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { AppLanguage } from './types';

type SharedPageProps = {
  appSubtitle: string;
  backHome: string;
  openSettings: string;
  privacyNote: string;
  pageTitle: string;
  pageDescription: string;
  language: AppLanguage;
  onBack: () => void;
  onOpenSettings: () => void;
};

type BaseLanguage = 'zh' | 'ja' | 'en' | 'ru';
type TransferStatus = 'idle' | 'running' | 'success' | 'error';
type LogLevel = 'info' | 'success' | 'error' | 'debug';

type WorkflowLog = {
  time: string;
  level: LogLevel;
  text: string;
};

type TransferError = {
  code: string;
  stage: string;
  message: string;
  hint: string;
  details: Record<string, unknown>;
};

type StatusLabelKey = 'statusIdle' | 'statusRunning' | 'statusSuccess' | 'statusError';
type UiCopySet = {
  dirty: string;
  clean: string;
  continueEdit: string;
  confirmReturnTitle: string;
  confirmReturnDirty: string;
  confirmReturnClean: string;
  confirmReturnButton: string;
  saveDraft: string;
  saveConfig: string;
  saveDocument: string;
  reset: string;
  copyJson: string;
  downloadJson: string;
  copyResult: string;
  downloadResult: string;
  copyError: string;
  downloadError: string;
  copyDebug: string;
  downloadDebug: string;
  copyText: string;
  downloadHtml: string;
  exportPack: string;
  chooseImage: string;
  replaceImage: string;
  noImage: string;
  progressTitle: string;
  resultsTitle: string;
  logsTitle: string;
  debugTitle: string;
  errorTitle: string;
  statusIdle: string;
  statusRunning: string;
  statusSuccess: string;
  statusError: string;
  copyLogs: string;
  downloadLogs: string;
  workflowId: string;
  promptTemplates: string;
  editorToolbar: string;
  editorHint: string;
  llmTitle: string;
  ttsTitle: string;
  exportTitle: string;
  notesTitle: string;
  operationsTitle: string;
  transfer: {
    inputTitle: string;
    paramsTitle: string;
    outputTitle: string;
    queueTitle: string;
    model: string;
    prompt: string;
    negativePrompt: string;
    temperature: string;
    topP: string;
    topK: string;
    seed: string;
    steps: string;
    strength: string;
    cfg: string;
    needCutout: string;
    keepPalette: string;
    preservePose: string;
    faceLock: string;
    detailBoost: string;
    start: string;
    stop: string;
    fileHint: string;
    resultReady: string;
    waitingResult: string;
    validationError: string;
    runtimeError: string;
    successMessage: string;
  };
  prompt: {
    contentTitle: string;
    templatesTitle: string;
    worldTemplate: string;
    cardTemplate: string;
    relationTemplate: string;
    speechTemplate: string;
    timelineTemplate: string;
    outlineTemplate: string;
    llmModel: string;
    llmTemp: string;
    llmTopP: string;
    llmMaxTokens: string;
    llmSystemNote: string;
    ttsVoice: string;
    ttsLanguage: string;
    ttsRate: string;
    ttsEmotion: string;
    ttsFormat: string;
    editorReady: string;
    packageHint: string;
  };
  paper: {
    sourceTitle: string;
    settingsTitle: string;
    queueTitle: string;
    start: string;
    expressionCount: string;
    cgCount: string;
    needCutout: string;
    exportJson: string;
    hint: string;
  };
};

const STYLE_TRANSFER_STORAGE_KEY = 'oc-maker.style-transfer';
const PROMPT_SUITE_STORAGE_KEY = 'oc-maker.prompt-suite';
const PAPER2GAL_STORAGE_KEY = 'oc-maker.paper2gal';

const uiCopy: Record<BaseLanguage, UiCopySet> = {
  zh: {
    dirty: '未保存',
    clean: '已保存',
    continueEdit: '继续编辑',
    confirmReturnTitle: '确定返回首页吗？',
    confirmReturnDirty: '你还没保存当前页面内容，返回后未保存的调整不会保留。',
    confirmReturnClean: '当前页面内容已经保存，返回首页后可以稍后继续处理。',
    confirmReturnButton: '确认返回',
    saveDraft: '保存草稿',
    saveConfig: '保存配置',
    saveDocument: '保存文档',
    reset: '重置',
    copyJson: '复制 JSON',
    downloadJson: '下载 JSON',
    copyResult: '复制结果',
    downloadResult: '下载结果',
    copyError: '复制错误',
    downloadError: '下载错误',
    copyDebug: '复制调试 JSON',
    downloadDebug: '下载调试 JSON',
    copyText: '复制文本',
    downloadHtml: '下载 HTML',
    exportPack: '导出封装包',
    chooseImage: '选择图片文件',
    replaceImage: '更换图片',
    noImage: '当前还没有选择输入图片。',
    progressTitle: '工作流进度',
    resultsTitle: '结果与调试',
    logsTitle: '详细日志',
    debugTitle: '调试 JSON',
    errorTitle: '错误信息',
    statusIdle: '待机',
    statusRunning: '运行中',
    statusSuccess: '完成',
    statusError: '失败',
    copyLogs: '复制日志',
    downloadLogs: '下载日志',
    workflowId: '工作流 ID',
    promptTemplates: '设卡模板',
    editorToolbar: '文档工具栏',
    editorHint: '这里的文档内容会作为 OC 世界观、角色设卡和后续封装输入的主编辑区。',
    llmTitle: 'LLM 封装',
    ttsTitle: 'TTS 封装',
    exportTitle: '导出与封装',
    notesTitle: '系统备注',
    operationsTitle: '操作开关',
    transfer: {
      inputTitle: '输入图片与预览',
      paramsTitle: 'AI 参数设置',
      outputTitle: '结果概览',
      queueTitle: '执行状态',
      model: '模型',
      prompt: '风格提示词',
      negativePrompt: '负面提示词',
      temperature: 'Temperature',
      topP: 'Top P',
      topK: 'Top K',
      seed: 'Seed',
      steps: '采样步数',
      strength: '风格强度',
      cfg: 'CFG Scale',
      needCutout: '需要抠图',
      keepPalette: '保留原配色',
      preservePose: '保留姿态',
      faceLock: '锁定五官',
      detailBoost: '细节增强',
      start: '开始转画风',
      stop: '中止任务',
      fileHint: '支持 PNG / JPG / WEBP，建议上传单人立绘或清晰半身图。',
      resultReady: '结果已经生成，可以复制、下载或导出调试数据。',
      waitingResult: '运行完成后，这里会显示结果信息、错误信息和调试 JSON。',
      validationError: '未检测到输入图片文件，已在预检查阶段停止工作流。',
      runtimeError: '风格采样在高随机参数下发生发散，已终止输出并保留完整调试信息。',
      successMessage: '风格转换成功完成，输出元数据和调试包已经生成。',
    },
    prompt: {
      contentTitle: 'OC 文档编辑器',
      templatesTitle: '快速模板',
      worldTemplate: 'OC 世界观',
      cardTemplate: '角色设卡',
      relationTemplate: '关系网络',
      speechTemplate: '语音设定',
      timelineTemplate: '时间线',
      outlineTemplate: '阵营 / 组织',
      llmModel: 'LLM 模型',
      llmTemp: 'Temperature',
      llmTopP: 'Top P',
      llmMaxTokens: 'Max Tokens',
      llmSystemNote: '系统提示词',
      ttsVoice: '语音角色',
      ttsLanguage: '语音语言',
      ttsRate: '语速',
      ttsEmotion: '情绪标签',
      ttsFormat: '导出格式',
      editorReady: '文档、配置和封装信息会一起进入导出包。',
      packageHint: '可以导出 HTML 文档、纯文本副本和一份完整的封装 JSON。',
    },
    paper: {
      sourceTitle: '素材输入',
      settingsTitle: '输出设置',
      queueTitle: '执行控制台',
      start: '开始生成',
      expressionCount: '表情版本数',
      cgCount: 'CG 场景数',
      needCutout: '最后执行抠图',
      exportJson: '导出工作流 JSON',
      hint: '这里先放 paper2gal 流程入口、参数和日志，后续再接 Character Workflow 仓库。',
    },
  },
  ja: {
    dirty: '未保存',
    clean: '保存済み',
    continueEdit: '編集を続ける',
    confirmReturnTitle: 'ホームに戻りますか？',
    confirmReturnDirty: '現在のページ内容はまだ保存されていません。戻ると未保存の変更は失われます。',
    confirmReturnClean: '現在の内容は保存済みです。ホームに戻って後で続けられます。',
    confirmReturnButton: '戻る',
    saveDraft: '下書きを保存',
    saveConfig: '設定を保存',
    saveDocument: '文書を保存',
    reset: 'リセット',
    copyJson: 'JSON をコピー',
    downloadJson: 'JSON を保存',
    copyResult: '結果をコピー',
    downloadResult: '結果を保存',
    copyError: 'エラーをコピー',
    downloadError: 'エラーを保存',
    copyDebug: 'デバッグ JSON をコピー',
    downloadDebug: 'デバッグ JSON を保存',
    copyText: 'テキストをコピー',
    downloadHtml: 'HTML を保存',
    exportPack: '封装パックを書き出す',
    chooseImage: '画像ファイルを選択',
    replaceImage: '画像を差し替え',
    noImage: '入力画像はまだ選択されていません。',
    progressTitle: 'ワークフロー進捗',
    resultsTitle: '結果とデバッグ',
    logsTitle: '詳細ログ',
    debugTitle: 'デバッグ JSON',
    errorTitle: 'エラー情報',
    statusIdle: '待機中',
    statusRunning: '実行中',
    statusSuccess: '完了',
    statusError: '失敗',
    copyLogs: 'ログをコピー',
    downloadLogs: 'ログを保存',
    workflowId: 'ワークフロー ID',
    promptTemplates: 'テンプレート',
    editorToolbar: '文書ツールバー',
    editorHint: 'ここで編集した文書は、OC 世界観やキャラクター設定、後続封装の元データとして使われます。',
    llmTitle: 'LLM 封装',
    ttsTitle: 'TTS 封装',
    exportTitle: '書き出しと封装',
    notesTitle: 'システムメモ',
    operationsTitle: '処理オプション',
    transfer: {
      inputTitle: '入力画像とプレビュー',
      paramsTitle: 'AI パラメータ設定',
      outputTitle: '結果概要',
      queueTitle: '実行状態',
      model: 'モデル',
      prompt: 'スタイル Prompt',
      negativePrompt: 'ネガティブ Prompt',
      temperature: 'Temperature',
      topP: 'Top P',
      topK: 'Top K',
      seed: 'Seed',
      steps: 'サンプリング数',
      strength: 'スタイル強度',
      cfg: 'CFG Scale',
      needCutout: '切り抜きを実行',
      keepPalette: '元の配色を維持',
      preservePose: 'ポーズを維持',
      faceLock: '顔パーツを固定',
      detailBoost: 'ディテール補強',
      start: '画風変換を開始',
      stop: 'タスクを中止',
      fileHint: 'PNG / JPG / WEBP 対応。単体キャラ立ち絵や鮮明な半身図を推奨します。',
      resultReady: '結果が生成されました。コピー、保存、デバッグデータの出力が可能です。',
      waitingResult: '完了後にここへ結果、エラー情報、デバッグ JSON が表示されます。',
      validationError: '入力画像が見つからないため、事前チェック段階で処理を停止しました。',
      runtimeError: '高ランダム設定のためサンプリングが発散し、出力を停止して完全なデバッグ情報を保持しました。',
      successMessage: '画風変換が正常に完了し、出力メタデータとデバッグパックを生成しました。',
    },
    prompt: {
      contentTitle: 'OC ドキュメントエディタ',
      templatesTitle: 'クイックテンプレート',
      worldTemplate: 'OC 世界観',
      cardTemplate: 'キャラ設定表',
      relationTemplate: '関係ネットワーク',
      speechTemplate: '音声設定',
      timelineTemplate: 'タイムライン',
      outlineTemplate: '陣営 / 組織',
      llmModel: 'LLM モデル',
      llmTemp: 'Temperature',
      llmTopP: 'Top P',
      llmMaxTokens: 'Max Tokens',
      llmSystemNote: 'システム Prompt',
      ttsVoice: '音声キャラ',
      ttsLanguage: '音声言語',
      ttsRate: '話速',
      ttsEmotion: '感情タグ',
      ttsFormat: '出力形式',
      editorReady: '文書、設定、封装情報はまとめて出力パックに含まれます。',
      packageHint: 'HTML 文書、プレーンテキスト、副次 JSON パックを書き出せます。',
    },
    paper: {
      sourceTitle: '素材入力',
      settingsTitle: '出力設定',
      queueTitle: '実行コンソール',
      start: '生成開始',
      expressionCount: '表情バージョン数',
      cgCount: 'CG シーン数',
      needCutout: '最後に切り抜き',
      exportJson: 'ワークフロー JSON を出力',
      hint: 'ここでは先に paper2gal の入口・設定・ログを置き、後で Character Workflow リポジトリと接続します。',
    },
  },
  en: {
    dirty: 'Unsaved',
    clean: 'Saved',
    continueEdit: 'Keep editing',
    confirmReturnTitle: 'Return to the homepage?',
    confirmReturnDirty: 'This page still has unsaved changes. Returning now will discard the current draft.',
    confirmReturnClean: 'This page is already saved. You can safely go back and continue later.',
    confirmReturnButton: 'Return',
    saveDraft: 'Save draft',
    saveConfig: 'Save config',
    saveDocument: 'Save document',
    reset: 'Reset',
    copyJson: 'Copy JSON',
    downloadJson: 'Download JSON',
    copyResult: 'Copy result',
    downloadResult: 'Download result',
    copyError: 'Copy error',
    downloadError: 'Download error',
    copyDebug: 'Copy debug JSON',
    downloadDebug: 'Download debug JSON',
    copyText: 'Copy text',
    downloadHtml: 'Download HTML',
    exportPack: 'Export package',
    chooseImage: 'Choose image file',
    replaceImage: 'Replace image',
    noImage: 'No input image has been selected yet.',
    progressTitle: 'Workflow progress',
    resultsTitle: 'Results and debugging',
    logsTitle: 'Detailed logs',
    debugTitle: 'Debug JSON',
    errorTitle: 'Error details',
    statusIdle: 'Idle',
    statusRunning: 'Running',
    statusSuccess: 'Success',
    statusError: 'Failed',
    copyLogs: 'Copy logs',
    downloadLogs: 'Download logs',
    workflowId: 'Workflow ID',
    promptTemplates: 'Templates',
    editorToolbar: 'Document toolbar',
    editorHint: 'This document is the main editing surface for the OC world sheet, character cards, and downstream wrappers.',
    llmTitle: 'LLM wrapper',
    ttsTitle: 'TTS wrapper',
    exportTitle: 'Export and packaging',
    notesTitle: 'System notes',
    operationsTitle: 'Operation toggles',
    transfer: {
      inputTitle: 'Input image and preview',
      paramsTitle: 'AI parameter settings',
      outputTitle: 'Result overview',
      queueTitle: 'Execution status',
      model: 'Model',
      prompt: 'Style prompt',
      negativePrompt: 'Negative prompt',
      temperature: 'Temperature',
      topP: 'Top P',
      topK: 'Top K',
      seed: 'Seed',
      steps: 'Sampling steps',
      strength: 'Style strength',
      cfg: 'CFG Scale',
      needCutout: 'Run cutout',
      keepPalette: 'Keep original palette',
      preservePose: 'Preserve pose',
      faceLock: 'Lock facial structure',
      detailBoost: 'Detail boost',
      start: 'Start style transfer',
      stop: 'Abort task',
      fileHint: 'Supports PNG / JPG / WEBP. A clean single-character or half-body image works best.',
      resultReady: 'The result package is ready. You can copy it, download it, or export the debug payload.',
      waitingResult: 'Results, errors, and debug JSON will appear here after the workflow finishes.',
      validationError: 'No input image was detected, so the workflow stopped during preflight validation.',
      runtimeError: 'Sampling diverged under the current high-randomness configuration. The output was stopped and the full debug package was preserved.',
      successMessage: 'Style transfer completed successfully and generated both result metadata and a debug package.',
    },
    prompt: {
      contentTitle: 'OC document editor',
      templatesTitle: 'Quick templates',
      worldTemplate: 'OC world bible',
      cardTemplate: 'Character sheet',
      relationTemplate: 'Relationship map',
      speechTemplate: 'Speech profile',
      timelineTemplate: 'Timeline',
      outlineTemplate: 'Faction / organization',
      llmModel: 'LLM model',
      llmTemp: 'Temperature',
      llmTopP: 'Top P',
      llmMaxTokens: 'Max tokens',
      llmSystemNote: 'System prompt',
      ttsVoice: 'Voice',
      ttsLanguage: 'Voice language',
      ttsRate: 'Speech rate',
      ttsEmotion: 'Emotion tag',
      ttsFormat: 'Export format',
      editorReady: 'The document, wrapper settings, and export info are bundled together as one authoring packet.',
      packageHint: 'You can export HTML, copy plain text, and download a full wrapper JSON package.',
    },
    paper: {
      sourceTitle: 'Asset input',
      settingsTitle: 'Output settings',
      queueTitle: 'Execution console',
      start: 'Start generation',
      expressionCount: 'Expression variants',
      cgCount: 'CG scene count',
      needCutout: 'Run cutout at the end',
      exportJson: 'Export workflow JSON',
      hint: 'This page already reserves the paper2gal entry, settings, and logs. The Character Workflow bridge can plug in next.',
    },
  },
  ru: {
    dirty: 'Не сохранено',
    clean: 'Сохранено',
    continueEdit: 'Продолжить редактирование',
    confirmReturnTitle: 'Вернуться на главную?',
    confirmReturnDirty: 'На этой странице есть несохранённые изменения. Если вернуться сейчас, текущий черновик будет потерян.',
    confirmReturnClean: 'Содержимое уже сохранено. Можно безопасно вернуться и продолжить позже.',
    confirmReturnButton: 'Вернуться',
    saveDraft: 'Сохранить черновик',
    saveConfig: 'Сохранить конфиг',
    saveDocument: 'Сохранить документ',
    reset: 'Сбросить',
    copyJson: 'Скопировать JSON',
    downloadJson: 'Скачать JSON',
    copyResult: 'Скопировать результат',
    downloadResult: 'Скачать результат',
    copyError: 'Скопировать ошибку',
    downloadError: 'Скачать ошибку',
    copyDebug: 'Скопировать debug JSON',
    downloadDebug: 'Скачать debug JSON',
    copyText: 'Скопировать текст',
    downloadHtml: 'Скачать HTML',
    exportPack: 'Экспортировать пакет',
    chooseImage: 'Выбрать изображение',
    replaceImage: 'Заменить изображение',
    noImage: 'Входное изображение ещё не выбрано.',
    progressTitle: 'Прогресс workflow',
    resultsTitle: 'Результаты и отладка',
    logsTitle: 'Подробные логи',
    debugTitle: 'Debug JSON',
    errorTitle: 'Информация об ошибке',
    statusIdle: 'Ожидание',
    statusRunning: 'Выполняется',
    statusSuccess: 'Готово',
    statusError: 'Ошибка',
    copyLogs: 'Скопировать логи',
    downloadLogs: 'Скачать логи',
    workflowId: 'ID workflow',
    promptTemplates: 'Шаблоны',
    editorToolbar: 'Панель документа',
    editorHint: 'Этот документ служит основной зоной редактирования мира OC, карточек персонажей и последующих обёрток.',
    llmTitle: 'LLM-обёртка',
    ttsTitle: 'TTS-обёртка',
    exportTitle: 'Экспорт и упаковка',
    notesTitle: 'Системные заметки',
    operationsTitle: 'Переключатели операций',
    transfer: {
      inputTitle: 'Входное изображение и превью',
      paramsTitle: 'Настройки AI',
      outputTitle: 'Сводка результата',
      queueTitle: 'Статус выполнения',
      model: 'Модель',
      prompt: 'Style prompt',
      negativePrompt: 'Negative prompt',
      temperature: 'Temperature',
      topP: 'Top P',
      topK: 'Top K',
      seed: 'Seed',
      steps: 'Шаги сэмплинга',
      strength: 'Сила стиля',
      cfg: 'CFG Scale',
      needCutout: 'Выполнить вырезание',
      keepPalette: 'Сохранить палитру',
      preservePose: 'Сохранить позу',
      faceLock: 'Зафиксировать лицо',
      detailBoost: 'Усилить детали',
      start: 'Запустить перенос стиля',
      stop: 'Остановить задачу',
      fileHint: 'Поддерживаются PNG / JPG / WEBP. Лучше всего работает чистое изображение одного персонажа.',
      resultReady: 'Пакет результата готов. Его можно скопировать, скачать или вывести debug payload.',
      waitingResult: 'После завершения здесь появятся результат, ошибки и debug JSON.',
      validationError: 'Входное изображение не найдено, поэтому workflow остановился на этапе предварительной проверки.',
      runtimeError: 'Сэмплинг разошёлся при текущих случайных параметрах. Вывод остановлен, полный debug-пакет сохранён.',
      successMessage: 'Перенос стиля завершился успешно и сформировал метаданные результата вместе с debug-пакетом.',
    },
    prompt: {
      contentTitle: 'Редактор документов OC',
      templatesTitle: 'Быстрые шаблоны',
      worldTemplate: 'Библия мира OC',
      cardTemplate: 'Карточка персонажа',
      relationTemplate: 'Карта отношений',
      speechTemplate: 'Речевая настройка',
      timelineTemplate: 'Таймлайн',
      outlineTemplate: 'Фракция / организация',
      llmModel: 'Модель LLM',
      llmTemp: 'Temperature',
      llmTopP: 'Top P',
      llmMaxTokens: 'Max tokens',
      llmSystemNote: 'System prompt',
      ttsVoice: 'Голос',
      ttsLanguage: 'Язык голоса',
      ttsRate: 'Скорость речи',
      ttsEmotion: 'Эмоция',
      ttsFormat: 'Формат экспорта',
      editorReady: 'Документ, настройки обёртки и экспортные данные собираются в один авторский пакет.',
      packageHint: 'Можно экспортировать HTML, копировать обычный текст и скачать полный JSON-пакет.',
    },
    paper: {
      sourceTitle: 'Входные материалы',
      settingsTitle: 'Настройки вывода',
      queueTitle: 'Консоль выполнения',
      start: 'Начать генерацию',
      expressionCount: 'Число эмоций',
      cgCount: 'Количество CG-сцен',
      needCutout: 'Вырезать фон в конце',
      exportJson: 'Экспортировать workflow JSON',
      hint: 'На этой странице уже есть вход для paper2gal, настройки и логи. Следующим шагом можно подключить Character Workflow.',
    },
  },
} as const;

const promptTemplates = {
  zh: [
    {
      key: 'world',
      label: 'OC 世界观',
      html: `<h1>OC 世界观总览</h1><p>在这里描述时代背景、地理结构、科技 / 魔法体系与核心冲突。</p><h2>世界规则</h2><ul><li>世界运行机制</li><li>主要势力</li><li>禁忌与边界</li></ul>`,
    },
    {
      key: 'card',
      label: '角色设卡',
      html: `<h1>角色设定卡</h1><table><tr><th>字段</th><th>内容</th></tr><tr><td>姓名</td><td>填写角色名</td></tr><tr><td>身份</td><td>填写角色定位</td></tr><tr><td>关键词</td><td>填写三到五个关键词</td></tr></table>`,
    },
    {
      key: 'relation',
      label: '关系网络',
      html: `<h1>关系网络</h1><p>列出角色之间的盟友、对立、依赖与秘密。</p><blockquote>把“公开关系”和“隐藏关系”分开写，会更利于后续 Prompt 封装。</blockquote>`,
    },
    {
      key: 'speech',
      label: '语音设定',
      html: `<h1>语音设定</h1><ul><li>常用语气词</li><li>说话速度与停顿习惯</li><li>情绪上扬时的变化</li></ul>`,
    },
    {
      key: 'timeline',
      label: '时间线',
      html: `<h1>关键时间线</h1><ol><li>角色出生与早年经历</li><li>转折事件</li><li>当前所处阶段</li><li>未来目标</li></ol>`,
    },
    {
      key: 'faction',
      label: '阵营 / 组织',
      html: `<h1>阵营 / 组织设定</h1><p>记录组织的目标、结构、资源与对外关系。</p><h2>组织层级</h2><ul><li>核心成员</li><li>外围成员</li><li>外部合作方</li></ul>`,
    },
  ],
  ja: [
    { key: 'world', label: '世界観', html: `<h1>OC 世界観</h1><p>時代背景、地理、技術 / 魔法体系、中心対立をここに整理します。</p>` },
    { key: 'card', label: 'キャラ設定表', html: `<h1>キャラクター設定表</h1><p>名前、役割、口調、外見、モチーフを書き出します。</p>` },
    { key: 'relation', label: '関係図', html: `<h1>関係図</h1><p>味方、対立、依存、秘密を関係ごとに分けて整理します。</p>` },
    { key: 'speech', label: '音声設定', html: `<h1>音声設定</h1><p>語尾、話速、感情時の変化を記録します。</p>` },
    { key: 'timeline', label: '年表', html: `<h1>年表</h1><ol><li>出生</li><li>転機</li><li>現在</li><li>今後</li></ol>` },
    { key: 'faction', label: '組織設定', html: `<h1>組織設定</h1><p>目的、階層、資源、対外関係を整理します。</p>` },
  ],
  en: [
    { key: 'world', label: 'World bible', html: `<h1>OC World Bible</h1><p>Use this space for the era, geography, systems, and central conflicts of the setting.</p>` },
    { key: 'card', label: 'Character sheet', html: `<h1>Character Sheet</h1><p>Capture identity, motifs, emotional axis, public role, and hidden agenda.</p>` },
    { key: 'relation', label: 'Relationship map', html: `<h1>Relationship Map</h1><p>Track alliances, tensions, dependencies, and concealed ties.</p>` },
    { key: 'speech', label: 'Speech profile', html: `<h1>Speech Profile</h1><p>Document cadence, filler words, emotional shifts, and verbal habits.</p>` },
    { key: 'timeline', label: 'Timeline', html: `<h1>Timeline</h1><ol><li>Origin</li><li>Turning point</li><li>Current phase</li><li>Future goal</li></ol>` },
    { key: 'faction', label: 'Faction sheet', html: `<h1>Faction / Organization</h1><p>Describe goals, structure, resources, and external relationships.</p>` },
  ],
  ru: [
    { key: 'world', label: 'Мир', html: `<h1>Библия мира OC</h1><p>Здесь фиксируются эпоха, география, системы и центральные конфликты.</p>` },
    { key: 'card', label: 'Карточка', html: `<h1>Карточка персонажа</h1><p>Запишите личность, роль, внешний образ, мотивы и скрытую цель.</p>` },
    { key: 'relation', label: 'Связи', html: `<h1>Карта отношений</h1><p>Разделите союзников, конфликты, зависимости и скрытые связи.</p>` },
    { key: 'speech', label: 'Речь', html: `<h1>Речевая настройка</h1><p>Фиксируйте ритм речи, слова-паразиты и эмоциональные сдвиги.</p>` },
    { key: 'timeline', label: 'Таймлайн', html: `<h1>Таймлайн</h1><ol><li>Происхождение</li><li>Поворотный момент</li><li>Текущая фаза</li><li>Цель</li></ol>` },
    { key: 'faction', label: 'Организация', html: `<h1>Фракция / организация</h1><p>Опишите цели, структуру, ресурсы и внешние связи.</p>` },
  ],
} as const;

const localizedUiCopy: Record<AppLanguage, UiCopySet> = {
  zh: uiCopy.zh,
  ja: uiCopy.ja,
  en: uiCopy.en,
  ru: uiCopy.ru,
  ko: {
    ...uiCopy.en,
    dirty: '저장 안 됨',
    clean: '저장됨',
    continueEdit: '계속 편집',
    confirmReturnTitle: '홈으로 돌아갈까요?',
    confirmReturnDirty: '아직 저장되지 않은 내용이 있습니다. 지금 돌아가면 현재 초안이 유지되지 않습니다.',
    confirmReturnClean: '현재 내용은 저장되었습니다. 홈으로 돌아가도 나중에 이어서 작업할 수 있습니다.',
    confirmReturnButton: '돌아가기',
    saveDraft: '초안 저장',
    saveConfig: '설정 저장',
    saveDocument: '문서 저장',
    chooseImage: '이미지 파일 선택',
    replaceImage: '이미지 바꾸기',
    progressTitle: '워크플로 진행',
    resultsTitle: '결과 및 디버그',
    logsTitle: '상세 로그',
    errorTitle: '오류 정보',
    workflowId: '워크플로 ID',
    promptTemplates: '템플릿',
    editorToolbar: '문서 도구 모음',
    llmTitle: 'LLM 래퍼',
    ttsTitle: 'TTS 래퍼',
    exportTitle: '내보내기 및 패키징',
    transfer: {
      ...uiCopy.en.transfer,
      inputTitle: '입력 이미지와 미리보기',
      paramsTitle: 'AI 파라미터 설정',
      outputTitle: '결과 개요',
      queueTitle: '실행 상태',
      start: '스타일 변환 시작',
      stop: '작업 중지',
    },
    prompt: {
      ...uiCopy.en.prompt,
      contentTitle: 'OC 문서 편집기',
      templatesTitle: '빠른 템플릿',
    },
    paper: {
      ...uiCopy.en.paper,
      sourceTitle: '소재 입력',
      settingsTitle: '출력 설정',
      queueTitle: '실행 콘솔',
      start: '생성 시작',
    },
  },
  fr: {
    ...uiCopy.en,
    dirty: 'Non enregistré',
    clean: 'Enregistré',
    continueEdit: 'Continuer',
    confirmReturnTitle: 'Retourner à l’accueil ?',
    confirmReturnDirty: 'Cette page contient encore des changements non enregistrés.',
    confirmReturnClean: 'Le contenu actuel est déjà enregistré.',
    confirmReturnButton: 'Retour',
    saveDraft: 'Enregistrer le brouillon',
    saveConfig: 'Enregistrer la config',
    saveDocument: 'Enregistrer le document',
    progressTitle: 'Progression du workflow',
    resultsTitle: 'Résultats et debug',
    logsTitle: 'Journaux détaillés',
    errorTitle: 'Erreur détaillée',
  },
  de: {
    ...uiCopy.en,
    dirty: 'Nicht gespeichert',
    clean: 'Gespeichert',
    continueEdit: 'Weiter bearbeiten',
    confirmReturnTitle: 'Zur Startseite zurückkehren?',
    confirmReturnDirty: 'Diese Seite hat noch nicht gespeicherte Änderungen.',
    confirmReturnClean: 'Der aktuelle Inhalt ist bereits gespeichert.',
    confirmReturnButton: 'Zurückkehren',
    saveDraft: 'Entwurf speichern',
    saveConfig: 'Konfig speichern',
    saveDocument: 'Dokument speichern',
    progressTitle: 'Workflow-Fortschritt',
    resultsTitle: 'Ergebnisse und Debug',
    logsTitle: 'Detaillierte Logs',
    errorTitle: 'Fehlerdetails',
  },
  es: {
    ...uiCopy.en,
    dirty: 'Sin guardar',
    clean: 'Guardado',
    continueEdit: 'Seguir editando',
    confirmReturnTitle: '¿Volver al inicio?',
    confirmReturnDirty: 'Esta página todavía tiene cambios sin guardar.',
    confirmReturnClean: 'El contenido actual ya está guardado.',
    confirmReturnButton: 'Volver',
    saveDraft: 'Guardar borrador',
    saveConfig: 'Guardar config',
    saveDocument: 'Guardar documento',
    progressTitle: 'Progreso del flujo',
    resultsTitle: 'Resultados y depuración',
    logsTitle: 'Registros detallados',
    errorTitle: 'Detalles del error',
  },
  it: {
    ...uiCopy.en,
    dirty: 'Non salvato',
    clean: 'Salvato',
    continueEdit: 'Continua a modificare',
    confirmReturnTitle: 'Tornare alla home?',
    confirmReturnDirty: 'Questa pagina ha ancora modifiche non salvate.',
    confirmReturnClean: 'Il contenuto attuale è già salvato.',
    confirmReturnButton: 'Torna',
    saveDraft: 'Salva bozza',
    saveConfig: 'Salva config',
    saveDocument: 'Salva documento',
    progressTitle: 'Avanzamento workflow',
    resultsTitle: 'Risultati e debug',
    logsTitle: 'Log dettagliati',
    errorTitle: 'Dettagli errore',
  },
  pt: {
    ...uiCopy.en,
    dirty: 'Não salvo',
    clean: 'Salvo',
    continueEdit: 'Continuar editando',
    confirmReturnTitle: 'Voltar para a página inicial?',
    confirmReturnDirty: 'Esta página ainda tem alterações não salvas.',
    confirmReturnClean: 'O conteúdo atual já está salvo.',
    confirmReturnButton: 'Voltar',
    saveDraft: 'Salvar rascunho',
    saveConfig: 'Salvar config',
    saveDocument: 'Salvar documento',
    progressTitle: 'Progresso do workflow',
    resultsTitle: 'Resultados e depuração',
    logsTitle: 'Logs detalhados',
    errorTitle: 'Detalhes do erro',
  },
};

const localizedPromptTemplates: Record<AppLanguage, (typeof promptTemplates)[BaseLanguage]> = {
  zh: promptTemplates.zh,
  ja: promptTemplates.ja,
  en: promptTemplates.en,
  ru: promptTemplates.ru,
  ko: promptTemplates.en,
  fr: promptTemplates.en,
  de: promptTemplates.en,
  es: promptTemplates.en,
  it: promptTemplates.en,
  pt: promptTemplates.en,
};

const ttsLanguageOptions: Array<{ value: AppLanguage; label: string }> = [
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
];

function readLocalState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function writeLocalState<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures when storage is unavailable.
  }
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Ignore clipboard failures in environments without permission.
  }
}

function downloadText(name: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getStatusLabelKey(status: TransferStatus): StatusLabelKey {
  switch (status) {
    case 'idle':
      return 'statusIdle';
    case 'running':
      return 'statusRunning';
    case 'success':
      return 'statusSuccess';
    case 'error':
      return 'statusError';
  }
}

function ConfirmReturnModal({
  copy,
  isDirty,
  onCancel,
  onConfirm,
}: {
  copy: UiCopySet;
  isDirty: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [isClosing, setIsClosing] = useState(false);

  function requestClose() {
    setIsClosing(true);
    window.setTimeout(onCancel, 220);
  }

  function requestConfirm() {
    setIsClosing(true);
    window.setTimeout(onConfirm, 220);
  }

  return (
    <div className={`modal-backdrop ${isClosing ? 'closing' : 'opening'}`} role="presentation" onClick={requestClose}>
      <section
        className={`modal-card confirm-modal modal-surface ${isClosing ? 'closing' : 'opening'}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={requestClose} aria-label="Close">
          ×
        </button>
        <p className="section-label">{copy.confirmReturnTitle}</p>
        <h2>{copy.confirmReturnTitle}</h2>
        <p className="modal-description">{isDirty ? copy.confirmReturnDirty : copy.confirmReturnClean}</p>
        <div className="confirm-actions">
          <button className="secondary-button" type="button" onClick={requestClose}>
            {copy.continueEdit}
          </button>
          <button className="primary-button" type="button" onClick={requestConfirm}>
            {copy.confirmReturnButton}
          </button>
        </div>
      </section>
    </div>
  );
}

export function StyleTransferPage({
  appSubtitle,
  backHome,
  openSettings,
  privacyNote,
  pageTitle,
  pageDescription,
  language,
  onBack,
  onOpenSettings,
}: SharedPageProps) {
  const copy = localizedUiCopy[language];
  const transfer = copy.transfer;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultConfig = {
    model: 'Anime Transfer XL v4',
    prompt: 'soft watercolor anime shading, cinematic key light, refined outline',
    negativePrompt: 'lowres, muddy colors, over-sharpened edges, broken anatomy',
    temperature: 0.78,
    topP: 0.92,
    topK: 48,
    seed: 240315,
    steps: 28,
    strength: 0.74,
    cfg: 6.8,
    needCutout: true,
    keepPalette: true,
    preservePose: true,
    faceLock: true,
    detailBoost: true,
  };
  const [persistedState] = useState(() =>
    readLocalState(STYLE_TRANSFER_STORAGE_KEY, {
      inputFileName: '',
      config: defaultConfig,
      savedSnapshot: '',
    }),
  );
  const [inputFileName, setInputFileName] = useState(persistedState.inputFileName);
  const [inputPreviewUrl, setInputPreviewUrl] = useState('');
  const [status, setStatus] = useState<TransferStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<TransferError | null>(null);
  const [runNonce, setRunNonce] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [config, setConfig] = useState({ ...defaultConfig, ...persistedState.config });
  const statusLabelKey = getStatusLabelKey(status);

  const currentSnapshot = JSON.stringify({ inputFileName, config });
  const [savedSnapshot, setSavedSnapshot] = useState(persistedState.savedSnapshot || currentSnapshot);
  const isDirty = currentSnapshot !== savedSnapshot;

  useEffect(() => {
    writeLocalState(STYLE_TRANSFER_STORAGE_KEY, {
      inputFileName,
      config,
      savedSnapshot,
    });
  }, [config, inputFileName, savedSnapshot]);

  useEffect(() => {
    if (status !== 'running') return;

    const checkpoints = [
      { progress: 12, level: 'info' as const, text: 'Queue accepted. Starting preflight validation.' },
      { progress: 28, level: 'debug' as const, text: 'Input image decoded. Character framing and silhouette analysis completed.' },
      { progress: 46, level: 'info' as const, text: 'Prompt embedding compiled. Sampling plan dispatched to the selected model.' },
      { progress: 67, level: 'info' as const, text: 'High-frequency detail pass is running. Face-lock and palette preservation are being enforced.' },
      { progress: 84, level: 'debug' as const, text: 'Post-process hooks completed. Matte, color cleanup, and metadata packaging are now running.' },
      { progress: 100, level: 'success' as const, text: 'Workflow finished and the result package is ready.' },
    ];
    const shouldFail = config.temperature > 1.35 && config.topP > 0.94;
    let index = 0;

    const timer = window.setInterval(() => {
      const nextStep = checkpoints[index];
      if (!nextStep) {
        window.clearInterval(timer);
        return;
      }

      setProgress(nextStep.progress);
      setLogs((current) => [...current, { time: timestamp(), level: nextStep.level, text: nextStep.text }]);
      index += 1;

      if (index === checkpoints.length) {
        window.clearInterval(timer);

        if (shouldFail) {
          const runtimeError: TransferError = {
            code: 'STYLE_TRANSFER_SAMPLING_DIVERGENCE',
            stage: 'sampler/high-frequency-pass',
            message: transfer.runtimeError,
            hint: 'Reduce Temperature, lower Top P, or disable one of the heavier preservation toggles before retrying.',
            details: {
              model: config.model,
              temperature: config.temperature,
              topP: config.topP,
              topK: config.topK,
              steps: config.steps,
              preservePose: config.preservePose,
              faceLock: config.faceLock,
            },
          };

          setStatus('error');
          setError(runtimeError);
          setResult(null);
          setLogs((current) => [
            ...current,
            { time: timestamp(), level: 'error', text: `${runtimeError.code}: ${runtimeError.message}` },
          ]);
          return;
        }

        setStatus('success');
        setError(null);
        setResult({
          workflowId: `st-${Date.now()}`,
          input: inputFileName,
          model: config.model,
          outputName: inputFileName ? inputFileName.replace(/\.[^.]+$/, '-styled.png') : 'styled-output.png',
          steps: config.steps,
          seed: config.seed,
          cutout: config.needCutout,
          message: transfer.successMessage,
        });
      }
    }, 520);

    return () => window.clearInterval(timer);
  }, [config, inputFileName, runNonce, status, transfer.runtimeError, transfer.successMessage]);

  useEffect(() => {
    return () => {
      if (inputPreviewUrl) {
        URL.revokeObjectURL(inputPreviewUrl);
      }
    };
  }, [inputPreviewUrl]);

  function updateConfig<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (inputPreviewUrl) {
      URL.revokeObjectURL(inputPreviewUrl);
    }

    setInputFileName(file.name);
    setInputPreviewUrl(URL.createObjectURL(file));
    setLogs((current) => [...current, { time: timestamp(), level: 'info', text: `Input file selected: ${file.name}` }]);
  }

  function startWorkflow() {
    if (!inputFileName) {
      const validationError: TransferError = {
        code: 'STYLE_TRANSFER_INPUT_MISSING',
        stage: 'preflight/input',
        message: transfer.validationError,
        hint: 'Select a source image before running the transfer workflow.',
        details: {
          fileSelected: false,
          status: 'stopped-before-run',
        },
      };

      setStatus('error');
      setProgress(0);
      setResult(null);
      setError(validationError);
      setLogs([{ time: timestamp(), level: 'error', text: `${validationError.code}: ${validationError.message}` }]);
      return;
    }

    setStatus('running');
    setProgress(0);
    setError(null);
    setResult(null);
    setLogs([
      { time: timestamp(), level: 'info', text: 'Workflow submitted to the local queue.' },
      { time: timestamp(), level: 'debug', text: `Debug context prepared for ${inputFileName}.` },
    ]);
    setRunNonce((current) => current + 1);
  }

  function abortWorkflow() {
    setStatus('idle');
    setProgress(0);
    setLogs((current) => [...current, { time: timestamp(), level: 'error', text: 'Workflow aborted by the user.' }]);
  }

  function saveDraft() {
    setSavedSnapshot(currentSnapshot);
    setLogs((current) => [...current, { time: timestamp(), level: 'success', text: 'Current style-transfer configuration saved locally.' }]);
  }

  const configJson = JSON.stringify({ tool: 'style-transfer', inputFileName, config }, null, 2);
  const logsText = logs.map((entry) => `[${entry.time}] [${entry.level.toUpperCase()}] ${entry.text}`).join('\n');
  const resultJson = JSON.stringify(result ?? { state: 'waiting' }, null, 2);
  const errorJson = JSON.stringify(error ?? { state: 'none' }, null, 2);
  const debugJson = JSON.stringify(
    {
      workflowId: result?.workflowId ?? `draft-${Date.now()}`,
      status,
      progress,
      inputFileName,
      config,
      result,
      error,
      logs,
    },
    null,
    2,
  );

  return (
    <main className="feature-shell tool-page-shell">
      <header className="feature-header fade-up delay-1">
        <button className="secondary-button small-button" type="button" onClick={() => setIsConfirmOpen(true)}>
          {backHome}
        </button>
        <div className="feature-header-meta">
          <span>{isDirty ? copy.dirty : copy.clean}</span>
          <button className="secondary-button small-button" type="button" onClick={onOpenSettings}>
            {openSettings}
          </button>
        </div>
      </header>

      <section className="tool-workbench fade-up delay-2">
        <div className="tool-header">
          <div>
            <p className="section-label">{appSubtitle}</p>
            <h2>{pageTitle}</h2>
            <p>{pageDescription}</p>
          </div>
          <div className="tool-header-actions">
            <span className={`save-indicator ${isDirty ? 'dirty' : 'clean'}`}>{isDirty ? copy.dirty : copy.clean}</span>
            <button className="secondary-button small-button" type="button" onClick={saveDraft}>
              {copy.saveConfig}
            </button>
            <button className="secondary-button small-button" type="button" onClick={() => copyText(configJson)}>
              {copy.copyJson}
            </button>
            <button className="secondary-button small-button" type="button" onClick={() => downloadText('style-transfer-config.json', configJson, 'application/json')}>
              {copy.downloadJson}
            </button>
          </div>
        </div>

        <div className="tool-grid transfer-grid">
          <div className="tool-column">
            <section className="tool-card">
              <div className="tool-card-header">
                <div>
                  <span className="card-caption">{transfer.inputTitle}</span>
                  <h3>{transfer.inputTitle}</h3>
                </div>
                <button className="secondary-button small-button" type="button" onClick={handlePickFile}>
                  {inputFileName ? copy.replaceImage : copy.chooseImage}
                </button>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handleFileChange} />
              </div>
              <p className="muted-copy">{transfer.fileHint}</p>
              <div className="preview-surface">
                {inputPreviewUrl ? <img className="preview-image" src={inputPreviewUrl} alt={inputFileName} /> : <div className="preview-empty">{copy.noImage}</div>}
              </div>
              {inputFileName && <p className="tiny-copy">{inputFileName}</p>}
            </section>

            <section className="tool-card">
              <span className="card-caption">{transfer.paramsTitle}</span>
              <h3>{transfer.paramsTitle}</h3>
              <div className="form-grid two-column">
                <label className="field">
                  <span>{transfer.model}</span>
                  <select className="settings-input tool-select" value={config.model} onChange={(event) => updateConfig('model', event.target.value)}>
                    <option>Anime Transfer XL v4</option>
                    <option>Painterly Diffusion Mix</option>
                    <option>Paper2Gal Bridge Preview</option>
                  </select>
                </label>
                <label className="field">
                  <span>{transfer.seed}</span>
                  <input className="settings-input" type="number" value={config.seed} onChange={(event) => updateConfig('seed', Number(event.target.value))} />
                </label>
              </div>
              <label className="field">
                <span>{transfer.prompt}</span>
                <textarea className="settings-textarea" value={config.prompt} onChange={(event) => updateConfig('prompt', event.target.value)} />
              </label>
              <label className="field">
                <span>{transfer.negativePrompt}</span>
                <textarea className="settings-textarea compact" value={config.negativePrompt} onChange={(event) => updateConfig('negativePrompt', event.target.value)} />
              </label>
              <div className="slider-grid">
                <RangeField label={transfer.temperature} min={0} max={2} step={0.01} value={config.temperature} onChange={(value) => updateConfig('temperature', value)} />
                <RangeField label={transfer.topP} min={0} max={1} step={0.01} value={config.topP} onChange={(value) => updateConfig('topP', value)} />
                <RangeField label={transfer.topK} min={1} max={128} step={1} value={config.topK} onChange={(value) => updateConfig('topK', value)} />
                <RangeField label={transfer.steps} min={8} max={60} step={1} value={config.steps} onChange={(value) => updateConfig('steps', value)} />
                <RangeField label={transfer.strength} min={0.1} max={1} step={0.01} value={config.strength} onChange={(value) => updateConfig('strength', value)} />
                <RangeField label={transfer.cfg} min={1} max={14} step={0.1} value={config.cfg} onChange={(value) => updateConfig('cfg', value)} />
              </div>

              <div className="toggle-grid">
                <ToggleChip label={transfer.needCutout} checked={config.needCutout} onToggle={() => updateConfig('needCutout', !config.needCutout)} />
                <ToggleChip label={transfer.keepPalette} checked={config.keepPalette} onToggle={() => updateConfig('keepPalette', !config.keepPalette)} />
                <ToggleChip label={transfer.preservePose} checked={config.preservePose} onToggle={() => updateConfig('preservePose', !config.preservePose)} />
                <ToggleChip label={transfer.faceLock} checked={config.faceLock} onToggle={() => updateConfig('faceLock', !config.faceLock)} />
                <ToggleChip label={transfer.detailBoost} checked={config.detailBoost} onToggle={() => updateConfig('detailBoost', !config.detailBoost)} />
              </div>

              <div className="tool-actions-row">
                <button className="primary-button" type="button" onClick={startWorkflow}>
                  {transfer.start}
                </button>
                <button className="secondary-button" type="button" onClick={abortWorkflow}>
                  {transfer.stop}
                </button>
                <button className="secondary-button" type="button" onClick={() => setConfig((current) => ({ ...current, prompt: '', negativePrompt: '' }))}>
                  {copy.reset}
                </button>
              </div>
            </section>
          </div>

          <div className="tool-column side">
            <section className="tool-card">
              <div className="tool-card-header">
                <div>
                  <span className="card-caption">{copy.progressTitle}</span>
                  <h3>{copy.progressTitle}</h3>
                </div>
                <span className={`status-badge ${status}`}>{copy[statusLabelKey]}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-meta">
                <span>{copy.workflowId}</span>
                <strong>{result?.workflowId?.toString() ?? `draft-${status}`}</strong>
              </div>
              <div className="log-stack">
                <div className="log-stack-header">
                  <strong>{copy.logsTitle}</strong>
                  <div className="mini-action-row">
                    <button className="secondary-button small-button" type="button" onClick={() => copyText(logsText)}>
                      {copy.copyLogs}
                    </button>
                    <button className="secondary-button small-button" type="button" onClick={() => downloadText('style-transfer-logs.txt', logsText)}>
                      {copy.downloadLogs}
                    </button>
                  </div>
                </div>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={`${log.time}-${log.text}`} className={`log-entry ${log.level}`}>
                      <span>{log.time}</span>
                      <p>{log.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="log-empty">{transfer.waitingResult}</div>
                )}
              </div>
            </section>

            <section className="tool-card">
              <span className="card-caption">{copy.resultsTitle}</span>
              <h3>{copy.resultsTitle}</h3>
              <div className="result-grid">
                <article className="result-panel">
                  <strong>{transfer.outputTitle}</strong>
                  <p>{result ? transfer.resultReady : transfer.waitingResult}</p>
                  <div className="code-block">{resultJson}</div>
                  <div className="mini-action-row">
                    <button className="secondary-button small-button" type="button" onClick={() => copyText(resultJson)}>
                      {copy.copyResult}
                    </button>
                    <button className="secondary-button small-button" type="button" onClick={() => downloadText('style-transfer-result.json', resultJson, 'application/json')}>
                      {copy.downloadResult}
                    </button>
                  </div>
                </article>

                <article className={`result-panel ${error ? 'error' : ''}`}>
                  <strong>{copy.errorTitle}</strong>
                  <p>{error ? error.message : 'No error has been raised in the current session.'}</p>
                  <div className="code-block">{errorJson}</div>
                  <div className="mini-action-row">
                    <button className="secondary-button small-button" type="button" onClick={() => copyText(errorJson)}>
                      {copy.copyError}
                    </button>
                    <button className="secondary-button small-button" type="button" onClick={() => downloadText('style-transfer-error.json', errorJson, 'application/json')}>
                      {copy.downloadError}
                    </button>
                  </div>
                </article>

                <article className="result-panel">
                  <strong>{copy.debugTitle}</strong>
                  <p>Queue trace, parameter snapshot, logs, result payload, and the latest error package are bundled here.</p>
                  <div className="code-block">{debugJson}</div>
                  <div className="mini-action-row">
                    <button className="secondary-button small-button" type="button" onClick={() => copyText(debugJson)}>
                      {copy.copyDebug}
                    </button>
                    <button className="secondary-button small-button" type="button" onClick={() => downloadText('style-transfer-debug.json', debugJson, 'application/json')}>
                      {copy.downloadDebug}
                    </button>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </section>

      <footer className="home-footer fade-up delay-3">
        <div className="notice-banner">{privacyNote}</div>
      </footer>

      {isConfirmOpen && <ConfirmReturnModal copy={copy} isDirty={isDirty} onCancel={() => setIsConfirmOpen(false)} onConfirm={onBack} />}
    </main>
  );
}

export function PromptSuitePage({
  appSubtitle,
  backHome,
  openSettings,
  privacyNote,
  pageTitle,
  pageDescription,
  language,
  onBack,
  onOpenSettings,
}: SharedPageProps) {
  const copy = localizedUiCopy[language];
  const promptCopy = copy.prompt;
  const editorRef = useRef<HTMLDivElement>(null);
  const templates = localizedPromptTemplates[language];
  const [persistedState] = useState(() =>
    readLocalState(PROMPT_SUITE_STORAGE_KEY, {
      selectedTemplate: templates[0].key,
      documentHtml: templates[0].html,
      llmConfig: {
        model: 'gpt-5.4',
        temperature: 0.7,
        topP: 0.92,
        maxTokens: 2048,
        systemNote: 'Keep the OC packet concise, coherent, and easy to hand off to downstream art or voice pipelines.',
      },
      ttsConfig: {
        voice: 'Hanazora',
        language,
        rate: 1,
        emotion: 'calm-dramatic',
        format: 'wav',
      },
      savedSnapshot: '',
    }),
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>(persistedState.selectedTemplate);
  const [documentHtml, setDocumentHtml] = useState<string>(persistedState.documentHtml);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [llmConfig, setLlmConfig] = useState(persistedState.llmConfig);
  const [ttsConfig, setTtsConfig] = useState(persistedState.ttsConfig);
  const currentSnapshot = JSON.stringify({ documentHtml, llmConfig, ttsConfig, selectedTemplate });
  const [savedSnapshot, setSavedSnapshot] = useState(persistedState.savedSnapshot || currentSnapshot);
  const isDirty = currentSnapshot !== savedSnapshot;

  useEffect(() => {
    writeLocalState(PROMPT_SUITE_STORAGE_KEY, {
      selectedTemplate,
      documentHtml,
      llmConfig,
      ttsConfig,
      savedSnapshot,
    });
  }, [documentHtml, llmConfig, savedSnapshot, selectedTemplate, ttsConfig]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== documentHtml) {
      editorRef.current.innerHTML = documentHtml;
    }
  }, [documentHtml]);

  function syncEditor() {
    setDocumentHtml(editorRef.current?.innerHTML ?? '');
  }

  function executeCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditor();
  }

  function applyTemplate(templateKey: string) {
    const nextTemplate = templates.find((item) => item.key === templateKey);
    if (!nextTemplate) return;

    setSelectedTemplate(templateKey);
    setDocumentHtml(nextTemplate.html);
  }

  function insertLink() {
    const url = window.prompt('Paste a link URL');
    if (!url) return;
    executeCommand('createLink', url);
  }

  function insertTable() {
    executeCommand(
      'insertHTML',
      '<table><tr><th>字段</th><th>内容</th></tr><tr><td>条目 A</td><td>在这里填写描述</td></tr><tr><td>条目 B</td><td>继续填写内容</td></tr></table>',
    );
  }

  function saveDraft() {
    setSavedSnapshot(currentSnapshot);
  }

  const plainText = useMemo(() => {
    const parser = new DOMParser();
    return parser.parseFromString(documentHtml, 'text/html').body.innerText;
  }, [documentHtml]);

  const exportJson = JSON.stringify(
    {
      tool: 'prompt-suite',
      selectedTemplate,
      documentHtml,
      plainText,
      llmConfig,
      ttsConfig,
    },
    null,
    2,
  );

  const toolbarButtons = [
    { label: 'B', action: () => executeCommand('bold') },
    { label: 'I', action: () => executeCommand('italic') },
    { label: 'U', action: () => executeCommand('underline') },
    { label: 'S', action: () => executeCommand('strikeThrough') },
    { label: 'H1', action: () => executeCommand('formatBlock', '<h1>') },
    { label: 'H2', action: () => executeCommand('formatBlock', '<h2>') },
    { label: 'H3', action: () => executeCommand('formatBlock', '<h3>') },
    { label: 'P', action: () => executeCommand('formatBlock', '<p>') },
    { label: 'Q', action: () => executeCommand('formatBlock', '<blockquote>') },
    { label: 'UL', action: () => executeCommand('insertUnorderedList') },
    { label: 'OL', action: () => executeCommand('insertOrderedList') },
    { label: 'L', action: () => executeCommand('justifyLeft') },
    { label: 'C', action: () => executeCommand('justifyCenter') },
    { label: 'R', action: () => executeCommand('justifyRight') },
    { label: '↺', action: () => executeCommand('undo') },
    { label: '↻', action: () => executeCommand('redo') },
    { label: 'Link', action: insertLink },
    { label: 'HR', action: () => executeCommand('insertHorizontalRule') },
    { label: 'Tbl', action: insertTable },
    { label: 'Clr', action: () => executeCommand('removeFormat') },
  ];

  return (
    <main className="feature-shell tool-page-shell">
      <header className="feature-header fade-up delay-1">
        <button className="secondary-button small-button" type="button" onClick={() => setIsConfirmOpen(true)}>
          {backHome}
        </button>
        <div className="feature-header-meta">
          <span>{isDirty ? copy.dirty : copy.clean}</span>
          <button className="secondary-button small-button" type="button" onClick={onOpenSettings}>
            {openSettings}
          </button>
        </div>
      </header>

      <section className="tool-workbench fade-up delay-2">
        <div className="tool-header">
          <div>
            <p className="section-label">{appSubtitle}</p>
            <h2>{pageTitle}</h2>
            <p>{pageDescription}</p>
          </div>
          <div className="tool-header-actions">
            <span className={`save-indicator ${isDirty ? 'dirty' : 'clean'}`}>{isDirty ? copy.dirty : copy.clean}</span>
            <button className="secondary-button small-button" type="button" onClick={saveDraft}>
              {copy.saveDocument}
            </button>
            <button className="secondary-button small-button" type="button" onClick={() => copyText(plainText)}>
              {copy.copyText}
            </button>
            <button className="secondary-button small-button" type="button" onClick={() => downloadText('oc-prompt-suite.html', documentHtml, 'text/html')}>
              {copy.downloadHtml}
            </button>
            <button className="secondary-button small-button" type="button" onClick={() => downloadText('oc-wrapper-pack.json', exportJson, 'application/json')}>
              {copy.exportPack}
            </button>
          </div>
        </div>

        <section className="tool-card rich-editor-card">
          <div className="tool-card-header">
            <div>
              <span className="card-caption">{promptCopy.contentTitle}</span>
              <h3>{promptCopy.contentTitle}</h3>
            </div>
            <span className="tiny-copy">{copy.editorHint}</span>
          </div>
          <div className="editor-toolbar-ribbon">
            <span className="editor-toolbar-label">{copy.editorToolbar}</span>
            <div className="editor-toolbar-grid">
              {toolbarButtons.map((button) => (
                <button key={button.label} className="toolbar-button" type="button" onClick={button.action}>
                  {button.label}
                </button>
              ))}
            </div>
          </div>
          <div className="template-ribbon">
            <span className="editor-toolbar-label">{copy.promptTemplates}</span>
            <div className="template-grid">
              {templates.map((template) => (
                <button
                  key={template.key}
                  className={`template-card ${selectedTemplate === template.key ? 'active' : ''}`}
                  type="button"
                  onClick={() => applyTemplate(template.key)}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={editorRef}
            className="rich-editor-surface"
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditor}
            dangerouslySetInnerHTML={{ __html: documentHtml }}
          />
        </section>

        <div className="tool-grid prompt-grid">
          <section className="tool-card">
            <span className="card-caption">{copy.llmTitle}</span>
            <h3>{copy.llmTitle}</h3>
            <div className="form-grid two-column">
              <label className="field">
                <span>{promptCopy.llmModel}</span>
                <select className="settings-input tool-select" value={llmConfig.model} onChange={(event) => setLlmConfig((current) => ({ ...current, model: event.target.value }))}>
                  <option>gpt-5.4</option>
                  <option>gpt-5.4-mini</option>
                  <option>gpt-5.2</option>
                </select>
              </label>
              <RangeField label={promptCopy.llmTemp} min={0} max={2} step={0.01} value={llmConfig.temperature} onChange={(value) => setLlmConfig((current) => ({ ...current, temperature: value }))} />
              <RangeField label={promptCopy.llmTopP} min={0} max={1} step={0.01} value={llmConfig.topP} onChange={(value) => setLlmConfig((current) => ({ ...current, topP: value }))} />
              <label className="field">
                <span>{promptCopy.llmMaxTokens}</span>
                <input className="settings-input" type="number" value={llmConfig.maxTokens} onChange={(event) => setLlmConfig((current) => ({ ...current, maxTokens: Number(event.target.value) }))} />
              </label>
            </div>
            <label className="field">
              <span>{promptCopy.llmSystemNote}</span>
              <textarea className="settings-textarea" value={llmConfig.systemNote} onChange={(event) => setLlmConfig((current) => ({ ...current, systemNote: event.target.value }))} />
            </label>
          </section>

          <section className="tool-card">
            <span className="card-caption">{copy.ttsTitle}</span>
            <h3>{copy.ttsTitle}</h3>
            <div className="form-grid two-column">
              <label className="field">
                <span>{promptCopy.ttsVoice}</span>
                <select className="settings-input tool-select" value={ttsConfig.voice} onChange={(event) => setTtsConfig((current) => ({ ...current, voice: event.target.value }))}>
                  <option>Hanazora</option>
                  <option>Mirako</option>
                  <option>Rin</option>
                </select>
              </label>
              <label className="field">
                <span>{promptCopy.ttsLanguage}</span>
                <select
                  className="settings-input tool-select"
                  value={ttsConfig.language}
                  onChange={(event) => setTtsConfig((current) => ({ ...current, language: event.target.value as AppLanguage }))}
                >
                  {ttsLanguageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <RangeField label={promptCopy.ttsRate} min={0.6} max={1.6} step={0.05} value={ttsConfig.rate} onChange={(value) => setTtsConfig((current) => ({ ...current, rate: value }))} />
              <label className="field">
                <span>{promptCopy.ttsEmotion}</span>
                <input className="settings-input" type="text" value={ttsConfig.emotion} onChange={(event) => setTtsConfig((current) => ({ ...current, emotion: event.target.value }))} />
              </label>
            </div>
            <label className="field">
              <span>{promptCopy.ttsFormat}</span>
              <select className="settings-input tool-select" value={ttsConfig.format} onChange={(event) => setTtsConfig((current) => ({ ...current, format: event.target.value }))}>
                <option>wav</option>
                <option>mp3</option>
                <option>flac</option>
              </select>
            </label>
          </section>

          <section className="tool-card">
            <span className="card-caption">{copy.exportTitle}</span>
            <h3>{copy.exportTitle}</h3>
            <p>{promptCopy.editorReady}</p>
            <p className="muted-copy">{promptCopy.packageHint}</p>
            <div className="code-block">{exportJson}</div>
            <div className="mini-action-row">
              <button className="secondary-button small-button" type="button" onClick={() => copyText(exportJson)}>
                {copy.copyJson}
              </button>
              <button className="secondary-button small-button" type="button" onClick={() => downloadText('oc-wrapper-pack.json', exportJson, 'application/json')}>
                {copy.downloadJson}
              </button>
            </div>
          </section>
        </div>
      </section>

      <footer className="home-footer fade-up delay-3">
        <div className="notice-banner">{privacyNote}</div>
      </footer>

      {isConfirmOpen && <ConfirmReturnModal copy={copy} isDirty={isDirty} onCancel={() => setIsConfirmOpen(false)} onConfirm={onBack} />}
    </main>
  );
}

export function Paper2GalPage({
  appSubtitle,
  backHome,
  openSettings,
  privacyNote,
  pageTitle,
  pageDescription,
  language,
  onBack,
  onOpenSettings,
}: SharedPageProps) {
  const copy = localizedUiCopy[language];
  const paper = copy.paper;
  const [persistedState] = useState(() =>
    readLocalState(PAPER2GAL_STORAGE_KEY, {
      inputFileName: '',
      expressions: 3,
      cgCount: 2,
      needCutout: true,
      savedSnapshot: '',
    }),
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(persistedState.savedSnapshot);
  const [inputFileName, setInputFileName] = useState(persistedState.inputFileName);
  const [expressions, setExpressions] = useState(persistedState.expressions);
  const [cgCount, setCgCount] = useState(persistedState.cgCount);
  const [needCutout, setNeedCutout] = useState(persistedState.needCutout);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [status, setStatus] = useState<TransferStatus>('idle');
  const [progress, setProgress] = useState(0);
  const currentSnapshot = JSON.stringify({ inputFileName, expressions, cgCount, needCutout });
  const isDirty = currentSnapshot !== savedSnapshot;

  useEffect(() => {
    writeLocalState(PAPER2GAL_STORAGE_KEY, {
      inputFileName,
      expressions,
      cgCount,
      needCutout,
      savedSnapshot,
    });
  }, [cgCount, expressions, inputFileName, needCutout, savedSnapshot]);

  function startWorkflow() {
    setStatus('running');
    setProgress(100);
    setLogs([
      { time: timestamp(), level: 'info', text: 'paper2gal queue prepared.' },
      { time: timestamp(), level: 'success', text: 'The bridge shell is ready for repository integration.' },
    ]);
  }

  const exportJson = JSON.stringify({ tool: 'paper2gal', inputFileName, expressions, cgCount, needCutout, logs }, null, 2);

  return (
    <main className="feature-shell tool-page-shell">
      <header className="feature-header fade-up delay-1">
        <button className="secondary-button small-button" type="button" onClick={() => setIsConfirmOpen(true)}>
          {backHome}
        </button>
        <div className="feature-header-meta">
          <span>{isDirty ? copy.dirty : copy.clean}</span>
          <button className="secondary-button small-button" type="button" onClick={onOpenSettings}>
            {openSettings}
          </button>
        </div>
      </header>

      <section className="tool-workbench fade-up delay-2">
        <div className="tool-header">
          <div>
            <p className="section-label">{appSubtitle}</p>
            <h2>{pageTitle}</h2>
            <p>{pageDescription}</p>
          </div>
          <div className="tool-header-actions">
            <button className="secondary-button small-button" type="button" onClick={() => setSavedSnapshot(currentSnapshot)}>
              {copy.saveConfig}
            </button>
            <button className="secondary-button small-button" type="button" onClick={() => downloadText('paper2gal-workflow.json', exportJson, 'application/json')}>
              {paper.exportJson}
            </button>
          </div>
        </div>

        <div className="tool-grid paper-grid">
          <section className="tool-card">
            <span className="card-caption">{paper.sourceTitle}</span>
            <h3>{paper.sourceTitle}</h3>
            <label className="field">
              <span>{copy.chooseImage}</span>
              <input className="settings-input" type="text" value={inputFileName} placeholder="character-fullbody.png" onChange={(event) => setInputFileName(event.target.value)} />
            </label>
            <p className="muted-copy">{paper.hint}</p>
          </section>

          <section className="tool-card">
            <span className="card-caption">{paper.settingsTitle}</span>
            <h3>{paper.settingsTitle}</h3>
            <div className="form-grid two-column">
              <RangeField label={paper.expressionCount} min={1} max={8} step={1} value={expressions} onChange={(value) => setExpressions(value)} />
              <RangeField label={paper.cgCount} min={1} max={6} step={1} value={cgCount} onChange={(value) => setCgCount(value)} />
            </div>
            <div className="toggle-grid">
              <ToggleChip label={paper.needCutout} checked={needCutout} onToggle={() => setNeedCutout((current) => !current)} />
            </div>
            <div className="tool-actions-row">
              <button className="primary-button" type="button" onClick={startWorkflow}>
                {paper.start}
              </button>
            </div>
          </section>

          <section className="tool-card">
            <span className="card-caption">{paper.queueTitle}</span>
            <h3>{paper.queueTitle}</h3>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="code-block">{exportJson}</div>
          </section>
        </div>
      </section>

      <footer className="home-footer fade-up delay-3">
        <div className="notice-banner">{privacyNote}</div>
      </footer>

      {isConfirmOpen && <ConfirmReturnModal copy={copy} isDirty={isDirty} onCancel={() => setIsConfirmOpen(false)} onConfirm={onBack} />}
    </main>
  );
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field range-field">
      <div className="range-field-top">
        <span>{label}</span>
        <strong>{Number.isInteger(value) ? value : value.toFixed(2)}</strong>
      </div>
      <input className="tool-range" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ToggleChip({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button className={`toggle-chip ${checked ? 'active' : ''}`} type="button" onClick={onToggle}>
      <span className="toggle-chip-dot" />
      {label}
    </button>
  );
}
