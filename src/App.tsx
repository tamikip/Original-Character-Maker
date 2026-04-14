import { useEffect, useState, type CSSProperties } from 'react';
import type {
  AccentPalette,
  AppLanguage,
  FeatureScreen,
  FontPreset,
  SettingsState,
  SettingsTab,
  StartModalStep,
  ThemeDepth,
} from './types';
import { Paper2GalPage, PromptSuitePage, StyleTransferPage } from './workflowPages';

const VERSION = '0.3.2';
const STORAGE_KEY = 'oc-maker.settings';
const MODAL_CLOSE_MS = 220;

type Messages = {
  appTitle: string;
  appSubtitle: string;
  versionLabel: string;
  overviewTitle: string;
  overviewDescription: string;
  workflowTitle: string;
  workflowDescription: string;
  workflowHint: string;
  workflowFormats: string;
  startButton: string;
  settingsButton: string;
  progressTitle: string;
  progressDescription: string;
  outputTitle: string;
  outputDescription: string;
  privacyNote: string;
  footerNote: string;
  metricModules: string;
  metricLanguages: string;
  metricStorage: string;
  featureFace: string;
  featureStyle: string;
  featureSeries: string;
  featurePrompt: string;
  featurePaper: string;
  backHome: string;
  openSettings: string;
  comingSoon: string;
  preparedModules: string;
  placeholderTodo: string;
  placeholderCanvas: string;
  placeholderSettings: string;
  placeholderPipeline: string;
  placeholderHint: string;
  startModalTitle: string;
  startModalDescription: string;
  startModalSeriesTitle: string;
  startModalSeriesDescription: string;
  actionFace: string;
  actionStyle: string;
  actionSeries: string;
  actionPromptSuite: string;
  actionPaper2Gal: string;
  actionBack: string;
  settingsTitle: string;
  tabStyle: string;
  tabLanguage: string;
  tabApi: string;
  tabAnnouncement: string;
  tabAbout: string;
  stylePresetTitle: string;
  stylePresetDefault: string;
  stylePresetPaper2Gal: string;
  themeModeTitle: string;
  themeLight: string;
  themeDeep: string;
  customContrastLabel: string;
  customContrastHint: string;
  accentTitle: string;
  customAccentLabel: string;
  styleLockedTitle: string;
  styleLockedDescription: string;
  fontTitle: string;
  fontSans: string;
  fontRounded: string;
  fontSerif: string;
  languageTitle: string;
  apiModeTitle: string;
  builtinMode: string;
  customApiMode: string;
  apiBaseTitle: string;
  apiBasePlaceholder: string;
  apiKeyTitle: string;
  apiKeyPlaceholder: string;
  apiHelp: string;
  apiHint: string;
  apiEffectiveTitle: string;
  apiEffectiveBuiltin: string;
  apiEffectiveCustom: string;
  apiPrivacy: string;
  announcementTitle: string;
  announcementHistoryButton: string;
  announcementDescription: string;
  announcementList1: string;
  announcementList2: string;
  announcementList3: string;
  aboutTitle: string;
  aboutDescription: string;
  profileLinkLabel: string;
  repoLinkLabel: string;
  pageFaceTitle: string;
  pageFaceDescription: string;
  pageStyleTitle: string;
  pageStyleDescription: string;
  pagePromptTitle: string;
  pagePromptDescription: string;
  pagePaperTitle: string;
  pagePaperDescription: string;
  moduleCanvas: string;
  modulePanel: string;
  modulePipeline: string;
  moduleStorage: string;
};

type BaseLanguage = 'zh' | 'ja' | 'en' | 'ru';

const translations: Record<BaseLanguage, Messages> = {
  zh: {
  appTitle: 'Original Character Maker',
  appSubtitle: '自定义 OC 角色中控台',
  versionLabel: '版本',
  overviewTitle: '单图进，多资产出',
  overviewDescription:
      '把捏脸、转画风、角色 Prompt / LLM / TTS 封装与 paper2gal 素材生成统一到同一个入口页里，方便集中管理角色创作流程。',
  workflowTitle: '开始新的工作流',
  workflowDescription: '从这里直接进入捏脸、转画风、角色 Prompt + LLM / TTS 或 paper2gal 工作台。',
  workflowHint: '点击开始会打开四个主入口弹窗，也可以直接点击上面的图标卡片进入。',
  workflowFormats: '支持 PNG / JPG / WEBP，推荐上传单人立绘或清晰半身图。',
    startButton: '开始',
    settingsButton: '设置',
    progressTitle: '工作流进度',
    progressDescription: '还没有开始任何工作流。进入对应入口后，进度和任务日志会显示在这里。',
    outputTitle: '阶段输出',
    outputDescription: '暂无输出。后续在捏脸、转画风和素材生成流程里的中间结果都会放到这里。',
    privacyNote: '本网站所有信息均在本地保存，不会上传你的角色社卡、个人信息或 API 私钥。',
    footerNote: 'Copyright © 2026 Mirako Company. Developed by Hanazar Ochikawa.',
    metricModules: '主入口',
    metricLanguages: '界面语言',
    metricStorage: '本地保存',
    featureFace: '捏脸',
    featureStyle: '转画风',
    featureSeries: '生成系列素材',
    featurePrompt: '角色 Prompt + LLM / TTS',
    featurePaper: 'paper2gal 图片素材',
    backHome: '返回首页',
    openSettings: '打开设置',
    comingSoon: '功能页面框架',
    preparedModules: '已准备模块',
    placeholderTodo: '下一步',
    placeholderCanvas: '主工作区画布与预览',
    placeholderSettings: '参数面板与模块设置',
    placeholderPipeline: '任务队列、接口调用与输出区',
    placeholderHint: '当前页面保留了完整结构，后续可直接进入对应功能。',
    startModalTitle: '选择工作台入口',
    startModalDescription: '先进入你现在要使用的四个主入口之一。',
    startModalSeriesTitle: '生成系列素材',
    startModalSeriesDescription: '这里分成两个子入口，分别进入对应的素材流程。',
    actionFace: '捏脸',
    actionStyle: '转画风',
    actionSeries: '生成系列素材',
    actionPromptSuite: '角色 Prompt + LLM / TTS 封装',
    actionPaper2Gal: 'paper2gal 图片素材生成',
    actionBack: '返回上一级',
    settingsTitle: '项目设置',
    tabStyle: '样式',
    tabLanguage: '语言',
    tabApi: '接口',
    tabAnnouncement: '公告',
    tabAbout: '关于',
    stylePresetTitle: '样式预设',
    stylePresetDefault: '默认样式',
    stylePresetPaper2Gal: 'paper2gal 官方样式',
    themeModeTitle: '模式',
    themeLight: '浅色',
    themeDeep: '深色',
    customContrastLabel: '自定义对比度',
    customContrastHint: '调节整体界面的明暗对比强度。',
    accentTitle: '配色样式',
    customAccentLabel: '自定义配色',
    styleLockedTitle: 'paper2gal 样式已锁定',
    styleLockedDescription: '启用官方样式后，会固定背景、主色和深浅模式，不再允许调整其他配色。',
    fontTitle: '字体',
    fontSans: '默认无衬线',
    fontRounded: '圆角标题风格',
    fontSerif: '衬线风格',
    languageTitle: '界面语言',
    apiModeTitle: '接口模式',
    builtinMode: '使用内置模型',
    customApiMode: '自定义 API',
    apiBaseTitle: 'API 地址',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API Key',
    apiKeyPlaceholder: '填写你自己的 API Key',
    apiHelp: '所有接口配置只保存在当前浏览器本地。',
    apiHint: '静态页面只会读取这里填写的地址和密钥，不会主动上传其他角色信息。',
    apiEffectiveTitle: '当前生效地址',
    apiEffectiveBuiltin: '当前使用内置模型占位配置，后续可替换为你自己的本地或远程服务。',
    apiEffectiveCustom: '当前优先使用你填写的自定义 API 地址。',
    apiPrivacy: '本网站所有信息均在本地保存，不会上传任何角色社卡、个人信息或私钥。',
    announcementTitle: '公告',
    announcementHistoryButton: '查看往期公告',
    announcementDescription: '0.3.2 把首页改成公告 + 四入口结构，设置与样式继续同步全局，Prompt / TTS 页补上更完整的编辑和复制操作。',
    announcementList1: '首页左侧主卡切换为当前公告，开始与设置按钮合并到主操作区，并只保留捏脸、转画风、Prompt / LLM / TTS、paper2gal 四个入口。',
    announcementList2: '离站提醒现在会在未保存进度时拦截刷新或关闭页面，项目设置、样式和对比度会继续保存在本地并在重载后恢复。',
    announcementList3: 'Prompt / LLM / TTS 页新增分区工具栏、文档区与系统提示词单独复制按钮，并补上更接近音频封装的 TTS 参数区。',
    aboutTitle: '关于',
    aboutDescription: '这个项目会作为你的 OC 角色创作入口，集中管理角色编辑、画风处理和系列素材生成。',
    profileLinkLabel: 'GitHub 主页',
    repoLinkLabel: '仓库地址',
    pageFaceTitle: '捏脸编辑器',
    pageFaceDescription: '左侧管理部件资产，中间预览角色画布，右侧调整参数并处理保存与导出。',
    pageStyleTitle: '转画风',
    pageStyleDescription: '上传角色图像、调整 AI 参数、查看任务进度，并导出结果、错误包和调试 JSON。',
    pagePromptTitle: '角色 Prompt + LLM / TTS 封装',
    pagePromptDescription: '在富文本编辑器中整理世界观与角色设定，并在下方配置 LLM 与 TTS 封装参数。',
    pagePaperTitle: 'paper2gal 图片素材生成',
    pagePaperDescription: '整理 paper2gal 素材输入、输出数量和执行控制，作为后续仓库联动的工作台入口。',
    moduleCanvas: '主工作区画布',
    modulePanel: '右侧参数 / 功能面板',
    modulePipeline: '任务队列与输出结果区',
    moduleStorage: '本地配置与历史记录',
  },
  ja: {
    appTitle: 'Original Character Maker',
    appSubtitle: 'OC キャラクター統合ハブ',
    versionLabel: 'バージョン',
    overviewTitle: 'キャラクター制作入口',
    overviewDescription:
      '顔編集、画風変換、Prompt / LLM / TTS ラッパー、paper2gal 素材生成を 1 つの入口ページにまとめています。',
    workflowTitle: '新しいワークフローを開始',
    workflowDescription: 'ここから顔編集、画風変換、Prompt / LLM / TTS、paper2gal の各ワークベンチへ直接入れます。',
    workflowHint: '開始ボタンを押すと 4 つの主入口モーダルが開き、上のカードから直接入ることもできます。',
    workflowFormats: 'PNG / JPG / WEBP に対応。単体キャラ立ち絵や鮮明な半身図を推奨します。',
    startButton: '開始',
    settingsButton: '設定',
    progressTitle: 'ワークフロー進捗',
    progressDescription: 'まだワークフローは開始されていません。開始後に進捗とログがここへ表示されます。',
    outputTitle: '段階出力',
    outputDescription: '現在は出力がありません。今後の中間結果や完成物はここに集約されます。',
    privacyNote: 'このサイトの情報はすべてローカル保存です。キャラ資料、個人情報、API キーはアップロードしません。',
    footerNote: 'Copyright © 2026 Mirako Company. Developed by Hanazar Ochikawa.',
    metricModules: 'メイン入口',
    metricLanguages: '言語対応',
    metricStorage: 'ローカル保存',
    featureFace: '捏脸',
    featureStyle: '画風変換',
    featureSeries: 'シリーズ素材生成',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'paper2gal 素材',
    backHome: 'ホームへ戻る',
    openSettings: '設定を開く',
    comingSoon: '機能ページの骨組み',
    preparedModules: '準備済みモジュール',
    placeholderTodo: '次のステップ',
    placeholderCanvas: 'メインキャンバスとプレビュー',
    placeholderSettings: 'パラメータパネルと設定連動',
    placeholderPipeline: 'タスクキュー、API、出力領域',
    placeholderHint: '現在はページ構造を先に確保しています。',
    startModalTitle: 'ワークベンチ入口を選択',
    startModalDescription: '今使いたい 4 つの主入口から 1 つ選んでください。',
    startModalSeriesTitle: 'シリーズ素材生成',
    startModalSeriesDescription: 'ここではさらに 2 つの子入口へ分けています。',
    actionFace: '捏脸',
    actionStyle: '画風変換',
    actionSeries: 'シリーズ素材生成',
    actionPromptSuite: 'Prompt + LLM / TTS ラッパー',
    actionPaper2Gal: 'paper2gal 素材生成',
    actionBack: '戻る',
    settingsTitle: 'プロジェクト設定',
    tabStyle: 'スタイル',
    tabLanguage: '言語',
    tabApi: 'API',
    tabAnnouncement: 'お知らせ',
    tabAbout: '情報',
    stylePresetTitle: 'スタイルプリセット',
    stylePresetDefault: 'デフォルト',
    stylePresetPaper2Gal: 'paper2gal 公式',
    themeModeTitle: 'モード',
    themeLight: 'ライト',
    themeDeep: 'ダーク',
    customContrastLabel: 'カスタムコントラスト',
    customContrastHint: '画面全体のコントラスト強度を調整します。',
    accentTitle: '配色',
    customAccentLabel: 'カスタム配色',
    styleLockedTitle: 'paper2gal スタイル固定',
    styleLockedDescription: '公式スタイルを有効化すると背景、主色、明暗モードが固定されます。',
    fontTitle: 'フォント',
    fontSans: '標準サンセリフ',
    fontRounded: '丸みタイトル',
    fontSerif: 'セリフ体',
    languageTitle: '表示言語',
    apiModeTitle: 'API モード',
    builtinMode: '内蔵モデル',
    customApiMode: 'カスタム API',
    apiBaseTitle: 'API URL',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API Key',
    apiKeyPlaceholder: '自分の API Key を入力',
    apiHelp: 'すべての設定は現在のブラウザにだけ保存されます。',
    apiHint: 'ここで設定した URL とキーのみを読み取り、他のデータは送信しません。',
    apiEffectiveTitle: '現在の有効先',
    apiEffectiveBuiltin: '現在は内蔵プレースホルダー設定を使用しています。',
    apiEffectiveCustom: '現在は入力されたカスタム API を優先します。',
    apiPrivacy: 'このサイトの情報はすべてローカル保存です。',
    announcementTitle: 'お知らせ',
    announcementHistoryButton: '過去のお知らせを見る',
    announcementDescription: '0.3.2 ではホームを「お知らせ + 4 入口」構成へ整理し、設定同期と Prompt / TTS 編集体験をさらに改善しました。',
    announcementList1: 'ホーム左側の主カードは現在のお知らせ表示に切り替わり、開始ボタンと設定ボタンは同じ操作エリアにまとめられました。',
    announcementList2: '未保存の進捗がある場合は再読込や離脱時に確認が入り、設定・スタイル・コントラストは再読込後も維持されます。',
    announcementList3: 'Prompt / LLM / TTS ページには分区ツールバー、個別コピー操作、より音声寄りの TTS 設定が追加されました。',
    aboutTitle: '情報',
    aboutDescription: 'このプロジェクトは OC 制作の統合入口として機能します。',
    profileLinkLabel: 'GitHub プロフィール',
    repoLinkLabel: 'リポジトリ',
    pageFaceTitle: '顔編集',
    pageFaceDescription: '左側でパーツ資産を管理し、中央でキャラを確認し、右側で調整と保存 / 書き出しを行います。',
    pageStyleTitle: '画風変換',
    pageStyleDescription: '画像入力、AI パラメータ、進捗ログ、結果、エラー JSON をまとめて扱う画風変換ワークベンチです。',
    pagePromptTitle: 'Prompt + LLM / TTS',
    pagePromptDescription: 'リッチテキストで世界観と設定を編集し、その下で LLM / TTS 封装を管理します。',
    pagePaperTitle: 'paper2gal 素材生成',
    pagePaperDescription: 'paper2gal 用の素材入力、出力数、実行ログをまとめる入口ワークベンチです。',
    moduleCanvas: 'メイン作業領域',
    modulePanel: '右側パネル',
    modulePipeline: 'タスクと出力',
    moduleStorage: 'ローカル保存と履歴',
  },
  en: {
    appTitle: 'Original Character Maker',
    appSubtitle: 'Custom OC control center',
    versionLabel: 'Version',
    overviewTitle: 'Character creation entry',
    overviewDescription:
      'Face making, style transfer, prompt tooling, and paper2gal asset generation are grouped into one entry page for a cleaner workflow.',
    workflowTitle: 'Start a new workflow',
    workflowDescription: 'Jump straight into Face Maker, Style Transfer, Prompt + LLM / TTS, or the paper2gal workbench from here.',
    workflowHint: 'Press Start to open the four-entry launcher, or click any icon card above to jump in directly.',
    workflowFormats: 'Supports PNG / JPG / WEBP. Single-character art or a clean half-body image is recommended.',
    startButton: 'Start',
    settingsButton: 'Settings',
    progressTitle: 'Workflow progress',
    progressDescription: 'No workflow has started yet. Progress logs will appear here after you enter a tool.',
    outputTitle: 'Stage outputs',
    outputDescription: 'No output yet. Future intermediate and final assets will be shown here.',
    privacyNote: 'Everything on this site stays local. No OC sheets, personal data, or API secrets are uploaded.',
    footerNote: 'Copyright © 2026 Mirako Company. Developed by Hanazar Ochikawa.',
    metricModules: 'Main entries',
    metricLanguages: 'Interface languages',
    metricStorage: 'Local storage',
    featureFace: 'Face Maker',
    featureStyle: 'Style Transfer',
    featureSeries: 'Series Assets',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'paper2gal Assets',
    backHome: 'Back home',
    openSettings: 'Open settings',
    comingSoon: 'Feature shell',
    preparedModules: 'Prepared modules',
    placeholderTodo: 'Next steps',
    placeholderCanvas: 'Main workspace canvas and preview',
    placeholderSettings: 'Parameter panel and module settings',
    placeholderPipeline: 'Task queue, API calls, and outputs',
    placeholderHint: 'This page currently reserves the layout structure for the real tool.',
    startModalTitle: 'Choose a workbench',
    startModalDescription: 'Select one of the four main workbenches to enter first.',
    startModalSeriesTitle: 'Generate series assets',
    startModalSeriesDescription: 'This branch is split into two child entries for later integration.',
    actionFace: 'Face Maker',
    actionStyle: 'Style Transfer',
    actionSeries: 'Generate Series Assets',
    actionPromptSuite: 'Character Prompt + LLM / TTS',
    actionPaper2Gal: 'paper2gal Asset Generation',
    actionBack: 'Back',
    settingsTitle: 'Project Settings',
    tabStyle: 'Style',
    tabLanguage: 'Language',
    tabApi: 'API',
    tabAnnouncement: 'Announcement',
    tabAbout: 'About',
    stylePresetTitle: 'Style preset',
    stylePresetDefault: 'Default',
    stylePresetPaper2Gal: 'paper2gal official',
    themeModeTitle: 'Mode',
    themeLight: 'Light',
    themeDeep: 'Deep',
    customContrastLabel: 'Custom contrast',
    customContrastHint: 'Adjust the overall contrast intensity of the interface.',
    accentTitle: 'Accent palette',
    customAccentLabel: 'Custom accent',
    styleLockedTitle: 'paper2gal style locked',
    styleLockedDescription: 'The official paper2gal preset locks the background, primary color, and depth mode.',
    fontTitle: 'Font',
    fontSans: 'Sans',
    fontRounded: 'Rounded',
    fontSerif: 'Serif',
    languageTitle: 'Interface language',
    apiModeTitle: 'Interface mode',
    builtinMode: 'Built-in model',
    customApiMode: 'Custom API',
    apiBaseTitle: 'API endpoint',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API key',
    apiKeyPlaceholder: 'Enter your API key',
    apiHelp: 'All interface settings stay in the current browser only.',
    apiHint: 'The static page reads only the address and key configured here.',
    apiEffectiveTitle: 'Current endpoint',
    apiEffectiveBuiltin: 'The app is using the built-in placeholder configuration right now.',
    apiEffectiveCustom: 'The app currently prioritizes your custom API endpoint.',
    apiPrivacy: 'Everything stays local in this browser.',
    announcementTitle: 'Announcement',
    announcementHistoryButton: 'View past announcements',
    announcementDescription: 'Version 0.3.2 reshapes the homepage around announcements and four direct tools, while tightening persistence, modal behavior, and the Prompt / TTS editor.',
    announcementList1: 'The left homepage panel now shows the current release notice, while Start and Settings sit together in the main action area and the redundant series launcher is removed.',
    announcementList2: 'Reloading or closing the site now warns when a workflow still has unsaved progress, while project settings, styles, and contrast continue to persist locally.',
    announcementList3: 'The Prompt / LLM / TTS page now has grouped Word-style toolbar sections, per-field copy actions, and a more audio-oriented TTS configuration area.',
    aboutTitle: 'About',
    aboutDescription: 'This project is the unified entry point for your OC creation workflow.',
    profileLinkLabel: 'GitHub profile',
    repoLinkLabel: 'Repository',
    pageFaceTitle: 'Face Maker',
    pageFaceDescription: 'Manage modular assets on the left, preview the character in the middle, and adjust controls plus export actions on the right.',
    pageStyleTitle: 'Style Transfer',
    pageStyleDescription: 'Upload an image, tune AI parameters, monitor the run, and export result, error, and debug payloads from one workbench.',
    pagePromptTitle: 'Prompt + LLM / TTS',
    pagePromptDescription: 'Edit the OC world sheet in a rich-text workspace, then configure the LLM and TTS wrappers underneath.',
    pagePaperTitle: 'paper2gal Asset Generation',
    pagePaperDescription: 'Prepare paper2gal inputs, output counts, and execution controls in one bridge workbench.',
    moduleCanvas: 'Main workspace',
    modulePanel: 'Control panel',
    modulePipeline: 'Task queue and outputs',
    moduleStorage: 'Local settings and history',
  },
  ru: {
    appTitle: 'Original Character Maker',
    appSubtitle: 'Центр управления OC',
    versionLabel: 'Версия',
    overviewTitle: 'Точка входа в создание персонажа',
    overviewDescription:
      'Редактор лица, перенос стиля, prompt-инструменты и paper2gal собраны на одной входной странице.',
    workflowTitle: 'Запустить новый workflow',
    workflowDescription: 'Отсюда можно сразу перейти в редактор лица, перенос стиля, Prompt + LLM / TTS или paper2gal.',
    workflowHint: 'Кнопка старта открывает модальное окно с четырьмя основными входами, но можно зайти и напрямую по карточке.',
    workflowFormats: 'Поддерживаются PNG / JPG / WEBP. Рекомендуется одиночный персонаж или чистый полуторс.',
    startButton: 'Старт',
    settingsButton: 'Настройки',
    progressTitle: 'Прогресс workflow',
    progressDescription: 'Workflow ещё не запускался. После входа логи и прогресс появятся здесь.',
    outputTitle: 'Промежуточные результаты',
    outputDescription: 'Пока результатов нет. Будущие материалы будут отображаться здесь.',
    privacyNote: 'Вся информация хранится локально. Данные персонажа, личная информация и API-ключи не загружаются.',
    footerNote: 'Copyright © 2026 Mirako Company. Developed by Hanazar Ochikawa.',
    metricModules: 'Основные входы',
    metricLanguages: 'Языков интерфейса',
    metricStorage: 'Локальное хранение',
    featureFace: 'Редактор лица',
    featureStyle: 'Перенос стиля',
    featureSeries: 'Серийные материалы',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'paper2gal материалы',
    backHome: 'На главную',
    openSettings: 'Открыть настройки',
    comingSoon: 'Каркас страницы',
    preparedModules: 'Подготовленные модули',
    placeholderTodo: 'Следующее',
    placeholderCanvas: 'Основное полотно и превью',
    placeholderSettings: 'Панель параметров и настройки',
    placeholderPipeline: 'Очередь задач, API и вывод',
    placeholderHint: 'Сейчас страница сохраняет структуру для будущего инструмента.',
    startModalTitle: 'Выберите рабочий стол',
    startModalDescription: 'Сначала выберите один из четырёх основных рабочих столов.',
    startModalSeriesTitle: 'Генерация серии',
    startModalSeriesDescription: 'Эта ветка разделена на два под-входа.',
    actionFace: 'Редактор лица',
    actionStyle: 'Перенос стиля',
    actionSeries: 'Генерация серии',
    actionPromptSuite: 'Prompt + LLM / TTS',
    actionPaper2Gal: 'paper2gal генерация',
    actionBack: 'Назад',
    settingsTitle: 'Настройки проекта',
    tabStyle: 'Стиль',
    tabLanguage: 'Язык',
    tabApi: 'API',
    tabAnnouncement: 'Объявление',
    tabAbout: 'О проекте',
    stylePresetTitle: 'Пресет стиля',
    stylePresetDefault: 'По умолчанию',
    stylePresetPaper2Gal: 'paper2gal',
    themeModeTitle: 'Режим',
    themeLight: 'Светлый',
    themeDeep: 'Тёмный',
    customContrastLabel: 'Пользовательский контраст',
    customContrastHint: 'Регулирует общую контрастность интерфейса.',
    accentTitle: 'Палитра',
    customAccentLabel: 'Своя палитра',
    styleLockedTitle: 'Стиль paper2gal зафиксирован',
    styleLockedDescription: 'Официальный paper2gal фиксирует фон, основной цвет и режим глубины.',
    fontTitle: 'Шрифт',
    fontSans: 'Sans',
    fontRounded: 'Rounded',
    fontSerif: 'Serif',
    languageTitle: 'Язык интерфейса',
    apiModeTitle: 'Режим API',
    builtinMode: 'Встроенная модель',
    customApiMode: 'Свой API',
    apiBaseTitle: 'Адрес API',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API-ключ',
    apiKeyPlaceholder: 'Введите API-ключ',
    apiHelp: 'Все настройки сохраняются только в текущем браузере.',
    apiHint: 'Страница читает только адрес и ключ, указанные здесь.',
    apiEffectiveTitle: 'Текущий адрес',
    apiEffectiveBuiltin: 'Сейчас используется встроенная заглушка.',
    apiEffectiveCustom: 'Сейчас приоритет у вашего адреса API.',
    apiPrivacy: 'Всё остаётся локально в браузере.',
    announcementTitle: 'Объявление',
    announcementHistoryButton: 'Смотреть прошлые объявления',
    announcementDescription: 'Версия 0.3.2 перестраивает главную страницу вокруг объявлений и четырёх прямых входов, а также улучшает сохранение, модальные окна и редактор Prompt / TTS.',
    announcementList1: 'Левая главная карточка теперь показывает текущее объявление, а кнопки запуска и настроек объединены в одной зоне действий без лишнего пункта series.',
    announcementList2: 'При обновлении или закрытии страницы появится предупреждение о несохранённом прогрессе, а настройки, темы и контраст по-прежнему хранятся локально.',
    announcementList3: 'На странице Prompt / LLM / TTS появился сгруппированный тулбар в стиле Word, отдельные кнопки копирования и более аудио-ориентированный блок TTS.',
    aboutTitle: 'О проекте',
    aboutDescription: 'Этот проект служит единым входом в ваш рабочий процесс создания OC.',
    profileLinkLabel: 'GitHub профиль',
    repoLinkLabel: 'Репозиторий',
    pageFaceTitle: 'Редактор лица',
    pageFaceDescription: 'Слева управляются ассеты, по центру — холст персонажа, справа — параметры, сохранение и экспорт.',
    pageStyleTitle: 'Перенос стиля',
    pageStyleDescription: 'Загружайте изображение, настраивайте AI-параметры, следите за прогрессом и выгружайте результат, ошибки и debug JSON.',
    pagePromptTitle: 'Prompt + LLM / TTS',
    pagePromptDescription: 'Редактируйте мир и карточки OC в rich-text редакторе, а ниже настраивайте LLM и TTS-обёртки.',
    pagePaperTitle: 'paper2gal генерация',
    pagePaperDescription: 'Здесь собираются входы paper2gal, число выходов и управление запуском для дальнейшей интеграции.',
    moduleCanvas: 'Основное рабочее поле',
    modulePanel: 'Панель управления',
    modulePipeline: 'Очередь задач и вывод',
    moduleStorage: 'Локальные настройки и история',
  },
};

const paletteOptions: Array<{
  value: AccentPalette;
  swatch: string;
  label: Record<BaseLanguage, string>;
}> = [
  { value: 'ocean', swatch: '#4da3ff', label: { zh: '海蓝', ja: 'オーシャン', en: 'Ocean', ru: 'Океан' } },
  { value: 'emerald', swatch: '#45d08d', label: { zh: '翡翠', ja: 'エメラルド', en: 'Emerald', ru: 'Изумруд' } },
  { value: 'amber', swatch: '#f5b94f', label: { zh: '琥珀', ja: 'アンバー', en: 'Amber', ru: 'Янтарь' } },
  { value: 'rose', swatch: '#f36a9d', label: { zh: '玫瑰', ja: 'ローズ', en: 'Rose', ru: 'Роза' } },
  { value: 'violet', swatch: '#9370ff', label: { zh: '紫藤', ja: 'バイオレット', en: 'Violet', ru: 'Фиалка' } },
  { value: 'slate', swatch: '#9bb2c9', label: { zh: '石墨', ja: 'スレート', en: 'Slate', ru: 'Сланец' } },
  { value: 'crimson', swatch: '#ef476f', label: { zh: '绯红', ja: 'クリムゾン', en: 'Crimson', ru: 'Кармин' } },
  { value: 'teal', swatch: '#22c1c3', label: { zh: '湖青', ja: 'ティール', en: 'Teal', ru: 'Тил' } },
  { value: 'gold', swatch: '#e3b341', label: { zh: '鎏金', ja: 'ゴールド', en: 'Gold', ru: 'Золото' } },
  { value: 'cyan', swatch: '#5bc0eb', label: { zh: '青空', ja: 'シアン', en: 'Cyan', ru: 'Циан' } },
  { value: 'custom', swatch: '#7c5cff', label: { zh: '自定义', ja: 'カスタム', en: 'Custom', ru: 'Своя' } },
];

const languageOptions: Array<{
  value: AppLanguage;
  label: string;
}> = [
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

const fontPresetOptions: Array<{ value: FontPreset; label: string }> = [
  { value: 'sans', label: '系统无衬线' },
  { value: 'serif', label: '系统衬线' },
  { value: 'mono', label: '等宽字' },
  { value: 'heiti', label: '黑体' },
  { value: 'songti', label: '宋体' },
  { value: 'kaiti', label: '楷体' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'times', label: 'Times' },
  { value: 'verdana', label: 'Verdana' },
  { value: 'fira', label: 'Fira Sans' },
  { value: 'custom', label: '自定义字体' },
];

const translationAliases: Record<AppLanguage, BaseLanguage> = {
  zh: 'zh',
  ja: 'ja',
  en: 'en',
  ru: 'ru',
  ko: 'en',
  fr: 'en',
  de: 'en',
  es: 'en',
  it: 'en',
  pt: 'en',
};

const localizedMessages: Record<AppLanguage, Messages> = {
  zh: translations.zh,
  ja: translations.ja,
  en: translations.en,
  ru: translations.ru,
  ko: {
    ...translations.en,
    appSubtitle: '커스텀 OC 캐릭터 허브',
    overviewTitle: '한 장으로, 더 많은 자산으로',
    overviewDescription:
      'Face Maker, style transfer, Character Prompt / LLM / TTS packaging, and paper2gal asset generation are managed from one entry page.',
    workflowTitle: '새 워크플로 시작',
    workflowDescription: '여기에서 원하는 기능으로 바로 이동하세요.',
    workflowHint: '바로가기 버튼을 눌러 해당 작업대로 들어갈 수 있습니다.',
    startButton: '시작',
    settingsButton: '설정',
    featureFace: '페이스 메이커',
    featureStyle: '스타일 변환',
    featureSeries: '시리즈 자산',
    featurePrompt: '프롬프트 + LLM / TTS',
    featurePaper: 'paper2gal 자산',
    backHome: '홈으로',
    openSettings: '설정 열기',
    announcementTitle: '공지',
    announcementHistoryButton: '이전 공지 보기',
    announcementDescription: '0.3.2에서는 홈을 공지 + 4개 직접 진입 구조로 재정리하고, 설정 유지와 Prompt / TTS 편집 흐름을 더 안정적으로 다듬었습니다.',
    announcementList1: '홈 왼쪽 메인 카드는 현재 공지를 보여주고, 시작과 설정 버튼은 같은 작업 구역으로 묶였으며 시리즈 분기는 제거되었습니다.',
    announcementList2: '저장되지 않은 진행이 있으면 새로고침이나 페이지 이탈 시 경고가 나타나고, 프로젝트 설정·스타일·대비 값은 다시 열어도 유지됩니다.',
    announcementList3: 'Prompt / LLM / TTS 페이지에는 Word식 분할 툴바, 필드별 복사 버튼, 오디오 작업에 더 가까운 TTS 설정 구역이 추가되었습니다.',
    pageFaceTitle: '페이스 메이커',
    pageStyleTitle: '스타일 변환',
    pagePromptTitle: '캐릭터 Prompt + LLM / TTS',
    pagePaperTitle: 'paper2gal 자산 생성',
  },
  fr: {
    ...translations.en,
    appSubtitle: 'Centre de contrôle OC personnalisé',
    overviewTitle: 'Une image, plusieurs assets',
    overviewDescription:
      'Face Maker, transfert de style, Character Prompt / LLM / TTS et génération d’assets paper2gal sont regroupés dans une seule entrée.',
    workflowTitle: 'Démarrer un nouveau workflow',
    workflowDescription: 'Entrez directement dans la fonction dont vous avez besoin.',
    workflowHint: 'Les cartes d’entrée ouvrent maintenant directement chaque espace de travail.',
    startButton: 'Démarrer',
    settingsButton: 'Paramètres',
    featureFace: 'Face Maker',
    featureStyle: 'Transfert de style',
    featureSeries: 'Assets de série',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'Assets paper2gal',
    backHome: 'Retour accueil',
    openSettings: 'Ouvrir les paramètres',
    announcementTitle: 'Annonce',
    announcementHistoryButton: 'Voir les annonces passées',
    announcementDescription: 'La version 0.3.2 réorganise l’accueil autour des annonces et de quatre entrées directes, tout en améliorant la persistance, les modales et l’éditeur Prompt / TTS.',
    announcementList1: 'La carte principale de gauche affiche désormais l’annonce courante, tandis que Démarrer et Paramètres sont regroupés dans la même zone d’action.',
    announcementList2: 'Un avertissement apparaît désormais lors d’un rechargement ou d’une fermeture si un workflow n’est pas enregistré, et les styles, réglages et contrastes restent stockés localement.',
    announcementList3: 'La page Prompt / LLM / TTS reçoit une barre d’outils segmentée façon Word, des boutons de copie par zone et un bloc TTS plus orienté audio.',
    pageFaceTitle: 'Face Maker',
    pageStyleTitle: 'Transfert de style',
    pagePromptTitle: 'Character Prompt + LLM / TTS',
    pagePaperTitle: 'Génération d’assets paper2gal',
  },
  de: {
    ...translations.en,
    appSubtitle: 'Benutzerdefiniertes OC-Kontrollzentrum',
    overviewTitle: 'Ein Bild, mehrere Assets',
    overviewDescription:
      'Face Maker, Stiltransfer, Character Prompt / LLM / TTS und paper2gal-Asset-Erzeugung werden auf einer gemeinsamen Startseite verwaltet.',
    workflowTitle: 'Neuen Workflow starten',
    workflowDescription: 'Springe direkt in die Funktion, die du jetzt brauchst.',
    workflowHint: 'Die Einstiegskarten führen jetzt direkt in die jeweiligen Arbeitsbereiche.',
    startButton: 'Starten',
    settingsButton: 'Einstellungen',
    featureFace: 'Face Maker',
    featureStyle: 'Stiltransfer',
    featureSeries: 'Serien-Assets',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'paper2gal-Assets',
    backHome: 'Zur Startseite',
    openSettings: 'Einstellungen öffnen',
    announcementTitle: 'Ankündigung',
    announcementHistoryButton: 'Frühere Ankündigungen ansehen',
    announcementDescription: 'Version 0.3.2 baut die Startseite rund um Ankündigungen und vier direkte Werkzeuge um und verbessert zugleich Persistenz, Modale und den Prompt-/TTS-Editor.',
    announcementList1: 'Die linke Hauptkarte auf der Startseite zeigt jetzt die aktuelle Ankündigung, während Starten und Einstellungen gemeinsam im Aktionsbereich liegen.',
    announcementList2: 'Beim Neuladen oder Schließen erscheint jetzt eine Warnung bei ungespeichertem Fortschritt; Projektoptionen, Stil und Kontrast bleiben lokal erhalten.',
    announcementList3: 'Die Prompt-/LLM-/TTS-Seite hat nun eine gruppierte Word-ähnliche Werkzeugleiste, separate Kopieraktionen pro Bereich und einen audioorientierteren TTS-Block.',
    pageFaceTitle: 'Face Maker',
    pageStyleTitle: 'Stiltransfer',
    pagePromptTitle: 'Character Prompt + LLM / TTS',
    pagePaperTitle: 'paper2gal-Asset-Generierung',
  },
  es: {
    ...translations.en,
    appSubtitle: 'Centro de control OC personalizado',
    overviewTitle: 'Una imagen, más assets',
    overviewDescription:
      'Face Maker, transferencia de estilo, Character Prompt / LLM / TTS y generación de assets paper2gal se gestionan desde una sola entrada.',
    workflowTitle: 'Iniciar un nuevo flujo',
    workflowDescription: 'Entra directamente en la función que necesitas.',
    workflowHint: 'Las tarjetas de acceso ahora abren cada banco de trabajo directamente.',
    startButton: 'Iniciar',
    settingsButton: 'Configuración',
    featureFace: 'Face Maker',
    featureStyle: 'Transferencia de estilo',
    featureSeries: 'Assets en serie',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'Assets paper2gal',
    backHome: 'Volver al inicio',
    openSettings: 'Abrir configuración',
    announcementTitle: 'Anuncio',
    announcementHistoryButton: 'Ver anuncios anteriores',
    announcementDescription: 'La versión 0.3.2 reorganiza la página principal alrededor de anuncios y cuatro accesos directos, y además mejora la persistencia, los modales y el editor Prompt / TTS.',
    announcementList1: 'La tarjeta principal de la izquierda ahora muestra el anuncio actual, mientras que Iniciar y Configuración se agrupan en la misma zona de acciones.',
    announcementList2: 'Al recargar o cerrar la página aparece una advertencia si hay progreso sin guardar, y la configuración, el estilo y el contraste siguen guardándose en local.',
    announcementList3: 'La página Prompt / LLM / TTS ahora incluye una barra por grupos al estilo Word, botones de copia por campo y una zona TTS más cercana a un flujo de audio real.',
    pageFaceTitle: 'Face Maker',
    pageStyleTitle: 'Transferencia de estilo',
    pagePromptTitle: 'Character Prompt + LLM / TTS',
    pagePaperTitle: 'Generación de assets paper2gal',
  },
  it: {
    ...translations.en,
    appSubtitle: 'Centro di controllo OC personalizzato',
    overviewTitle: 'Una sola immagine, più asset',
    overviewDescription:
      'Face Maker, style transfer, Character Prompt / LLM / TTS e generazione di asset paper2gal sono raccolti in un unico ingresso.',
    workflowTitle: 'Avvia un nuovo workflow',
    workflowDescription: 'Entra subito nella funzione che ti serve.',
    workflowHint: 'Le carte di accesso ora aprono direttamente ogni banco di lavoro.',
    startButton: 'Avvia',
    settingsButton: 'Impostazioni',
    featureFace: 'Face Maker',
    featureStyle: 'Style transfer',
    featureSeries: 'Asset di serie',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'Asset paper2gal',
    backHome: 'Torna alla home',
    openSettings: 'Apri impostazioni',
    announcementTitle: 'Annuncio',
    announcementHistoryButton: 'Vedi annunci precedenti',
    announcementDescription: 'La versione 0.3.2 riorganizza la home intorno agli annunci e a quattro ingressi diretti, migliorando anche persistenza, modali ed editor Prompt / TTS.',
    announcementList1: 'La scheda principale di sinistra ora mostra l’annuncio corrente, mentre Avvia e Impostazioni sono raccolti nella stessa area operativa.',
    announcementList2: 'Durante ricarica o chiusura appare ora un avviso se c’è progresso non salvato, e impostazioni, stile e contrasto restano memorizzati in locale.',
    announcementList3: 'La pagina Prompt / LLM / TTS ora include una toolbar a gruppi in stile Word, pulsanti di copia per singolo campo e una sezione TTS più orientata all’audio.',
    pageFaceTitle: 'Face Maker',
    pageStyleTitle: 'Style transfer',
    pagePromptTitle: 'Character Prompt + LLM / TTS',
    pagePaperTitle: 'Generazione asset paper2gal',
  },
  pt: {
    ...translations.en,
    appSubtitle: 'Central de controle OC personalizada',
    overviewTitle: 'Uma imagem, mais assets',
    overviewDescription:
      'Face Maker, transferência de estilo, Character Prompt / LLM / TTS e geração de assets paper2gal ficam reunidos em uma única entrada.',
    workflowTitle: 'Iniciar um novo fluxo',
    workflowDescription: 'Entre direto na função que você precisa agora.',
    workflowHint: 'Os cartões de entrada agora abrem cada bancada de trabalho diretamente.',
    startButton: 'Iniciar',
    settingsButton: 'Configurações',
    featureFace: 'Face Maker',
    featureStyle: 'Transferência de estilo',
    featureSeries: 'Assets em série',
    featurePrompt: 'Prompt + LLM / TTS',
    featurePaper: 'Assets paper2gal',
    backHome: 'Voltar ao início',
    openSettings: 'Abrir configurações',
    announcementTitle: 'Aviso',
    announcementHistoryButton: 'Ver avisos anteriores',
    announcementDescription: 'A versão 0.3.2 reorganiza a página inicial em torno de anúncios e quatro entradas diretas, além de melhorar persistência, modais e o editor Prompt / TTS.',
    announcementList1: 'O cartão principal à esquerda agora mostra o anúncio atual, enquanto Iniciar e Configurações ficam juntos na mesma área de ações.',
    announcementList2: 'Ao recarregar ou fechar a página, agora há aviso se existir progresso sem salvar; configurações, estilo e contraste continuam guardados localmente.',
    announcementList3: 'A página Prompt / LLM / TTS agora traz uma barra segmentada no estilo Word, botões de cópia por campo e uma área TTS mais próxima de um fluxo de áudio real.',
    pageFaceTitle: 'Face Maker',
    pageStyleTitle: 'Transferência de estilo',
    pagePromptTitle: 'Character Prompt + LLM / TTS',
    pagePaperTitle: 'Geração de assets paper2gal',
  },
};

const announcementHistory = [
  {
    version: '0.3.2',
    date: '2026-04-14',
    title: '0.3.2 公告主页化与编辑器工具栏升级',
    summary: '首页改成公告 + 四入口结构，未保存离站提醒覆盖刷新场景，Prompt / TTS 页补上更完整的分区工具栏和复制动作。',
    details: [
      '首页左侧主卡切换为当前公告，开始和设置按钮放到同一区域，往期公告入口可直接打开设置里的公告面板。',
      '全局对比度继续生效，浅色模式背景不再残留黑色深色渐变；所有主按钮在高亮时会整块染上当前样式色。',
      'Prompt / LLM / TTS 页把工具栏重组为更接近 Word 的分区布局，并给文档编辑区和系统提示词分别补上独立复制按钮。',
    ],
  },
  {
    version: '0.3.1',
    date: '2026-04-13',
    title: '0.3.1 首页入口与本地持久化修正',
    summary: '修复转画风页返回首页确认层级异常，补齐工作流参数本地保存，并继续整理首页入口结构。',
    details: [
      '转画风页的返回首页确认弹窗加强了层级和显示稳定性，避免出现只剩遮罩的异常状态。',
      '转画风、Prompt / LLM / TTS 和 paper2gal 的设置参数现在都会写入本地存储，刷新页面后继续保留。',
      '首页移除了 3 / 10 / Local 指标块，说明文字上移到站点副标题下，并补齐功能入口图标按钮。',
    ],
  },
  {
    version: '0.3.0',
    date: '2026-04-13',
    title: '0.3.0 工作台页面升级',
    summary: '首页改成单卡入口，转画风、Prompt / LLM / TTS 与 paper2gal 三个页面升级为真正可操作的工作台。',
    details: [
      '首页把两块主卡合并为统一入口区，只保留三大功能入口、开始动作与本地优先的站点说明。',
      '转画风页补上图片输入、模型与采样参数、详细日志、明确错误包、结果数据和复制 / 下载调试动作。',
      '角色 Prompt + LLM / TTS 页补上富文本编辑器、OC 模板、封装配置，三个功能页统一支持返回首页前确认。',
    ],
  },
  {
    version: '0.2.2',
    date: '2026-04-12',
    title: '0.2.2 首页清理与样式自定义',
    summary: '移除首页半成品占位区，补上自定义配色和全局对比度，并修正一轮主题与状态逻辑。',
    details: [
      '首页移除了工作流进度、阶段输出和上传占位内容，入口结构更像正式站点首页。',
      '样式页新增自定义配色和全局对比度调节，自定义颜色输入带有非法值回退保护。',
      '修正主入口数量与文案不一致、paper2gal 锁定时自定义配色区显示不准确等问题。',
    ],
  },
  {
    version: '0.2.1',
    date: '2026-04-12',
    title: '0.2.1 捏脸编辑器壳与公告历史',
    summary: '新增 VRoid 风格捏脸编辑器布局、返回确认弹窗、10 语言、10 字体与历史公告面板。',
    details: [
      '捏脸页改成左侧资产面板、中间透明画布、右侧参数面板，并加入顶部工具栏。',
      '返回首页前会检测当前草稿是否保存，未保存时弹出更明确的提醒。',
      '公告页扩展为当前公告 + 历史公告列表，并补齐 0.1.0 到 0.2.0 的版本记录。',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-04-12',
    title: '0.2.0 紧凑化 UI 与入口动效',
    summary: '压缩主页面比例、入口弹窗改图标、补全按钮高亮和渐显动画。',
    details: [
      '主页整体缩放并贴近 Character Workflow Agent 的布局比例。',
      '入口弹窗从编号卡片改成了图标卡片，交互反馈更清晰。',
      '设置面板的打开关闭动画和按钮按压动画一起补齐。',
    ],
  },
  {
    version: '0.1.5',
    date: '2026-04-11',
    title: '0.1.5 主页结构细化',
    summary: '开始和设置按钮迁移到主操作区，并继续梳理首页卡片结构。',
    details: [
      '首页的动作区与信息区分开，功能入口更集中。',
      '调整文案结构，减少开发者视角的占位表述。',
      '为后续工作流卡片和设置页联动打基础。',
    ],
  },
  {
    version: '0.1.4',
    date: '2026-04-11',
    title: '0.1.4 主题同步整理',
    summary: 'paper2gal 主题和默认主题的变量重新同步，设置页同步修正。',
    details: [
      'paper2gal 主题开启后锁定主色和明暗模式。',
      '整理了主题变量，避免主页和设置页不同步。',
      '给后续扩展更多配色留了结构空间。',
    ],
  },
  {
    version: '0.1.3',
    date: '2026-04-10',
    title: '0.1.3 设置页与入口弹窗',
    summary: '项目设置、功能入口弹窗和基础多语言切换已经接通。',
    details: [
      '设置页建立样式、语言、接口、公告和关于五个分区。',
      '开始按钮打开功能入口弹窗，形成站点一级导航。',
      '本地保存的设置状态已经接入浏览器存储。',
    ],
  },
  {
    version: '0.1.2',
    date: '2026-04-10',
    title: '0.1.2 首页主题与动效底座',
    summary: '补上暗色基底、玻璃卡片、基础渐显动效和站点背景氛围。',
    details: [
      '站点整体视觉方向确定为深色创作工作台。',
      '加入渐显动画和卡片阴影，为后续交互动效准备底座。',
      '开始整理按钮、卡片和标题的统一节奏。',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-04-09',
    title: '0.1.1 首页与流程入口初版',
    summary: '主页、开始流程和设置面板的第一版框架完成。',
    details: [
      '首页形成主面板和功能入口的基础结构。',
      '开始流程弹窗建立了捏脸、转画风和生成系列素材的主入口。',
      '站点开始具备作为 OC 创作入口页的基本形态。',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-04-09',
    title: '0.1.0 项目起步',
    summary: '项目初始化完成，前端工程、路由壳和基础资源组织开始落地。',
    details: [
      'Vite + React + TypeScript 的前端底座建立。',
      '确定以本地保存和角色创作中控台为核心方向。',
      '开始规划捏脸、转画风与系列素材生成三条主线。',
    ],
  },
] as const;

function hexToRgb(hex: string) {
  const normalized = hex.trim().replace('#', '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return '79, 157, 247';
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `${red}, ${green}, ${blue}`;
}

const defaultSettings: SettingsState = {
  stylePreset: 'default',
  depth: 'deep',
  accent: 'ocean',
  customAccentColor: '#7c5cff',
  contrast: 100,
  language: 'zh',
  customFontFamily: '',
  interfaceMode: 'builtin',
  apiBaseUrl: '',
  apiKey: '',
  fontPreset: 'sans',
};

function loadInitialSettings(): SettingsState {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<SettingsState>;
    const nextSettings = { ...defaultSettings, ...parsed };

    if ((nextSettings as { fontPreset?: string }).fontPreset === 'rounded') {
      nextSettings.fontPreset = 'sans';
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(nextSettings.customAccentColor)) {
      nextSettings.customAccentColor = defaultSettings.customAccentColor;
    }

    if (typeof nextSettings.contrast !== 'number' || Number.isNaN(nextSettings.contrast)) {
      nextSettings.contrast = defaultSettings.contrast;
    }

    nextSettings.contrast = Math.min(130, Math.max(80, Math.round(nextSettings.contrast)));
    return nextSettings;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultSettings;
  }
}

function App() {
  const [settings, setSettings] = useState<SettingsState>(() => loadInitialSettings());
  const [screen, setScreen] = useState<FeatureScreen>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('style');
  const [modalStep, setModalStep] = useState<StartModalStep>(null);

  // Keep UI preferences local-only so the shell behaves like a desktop-style tool launcher.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const resolvedLanguage = translationAliases[settings.language];
  const messages = localizedMessages[settings.language];
  const effectivePreset = settings.stylePreset;
  const effectiveDepth: ThemeDepth = effectivePreset === 'paper2gal' ? 'light' : settings.depth;
  const effectiveAccent: AccentPalette = effectivePreset === 'paper2gal' ? 'rose' : settings.accent;
  const customAccentHex = /^#[0-9a-fA-F]{6}$/.test(settings.customAccentColor)
    ? settings.customAccentColor
    : defaultSettings.customAccentColor;
  const customAccentRgb = hexToRgb(customAccentHex);

  const appClassName = [
    'app-shell',
    `preset-${effectivePreset}`,
    `depth-${effectiveDepth}`,
    `accent-${effectiveAccent}`,
    `font-${settings.fontPreset}`,
  ].join(' ');
  const appStyle = {
    ['--ui-contrast' as string]: `${settings.contrast}%`,
    ...(settings.fontPreset === 'custom' && settings.customFontFamily
      ? ({ ['--custom-font-family' as string]: settings.customFontFamily } as CSSProperties)
      : {}),
    ...(effectiveAccent === 'custom'
      ? ({
          ['--accent-solid' as string]: customAccentHex,
          ['--accent-rgb' as string]: customAccentRgb,
        } as CSSProperties)
      : {}),
  } as CSSProperties;

  function updateSettings(patch: Partial<SettingsState>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function navigateTo(nextScreen: Exclude<FeatureScreen, 'home'>) {
    setScreen(nextScreen);
    setModalStep(null);
  }

  function openSettings(tab: SettingsTab = 'style') {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  }

  const sharedPageProps = {
    appSubtitle: messages.appSubtitle,
    backHome: messages.backHome,
    openSettings: messages.openSettings,
    privacyNote: messages.privacyNote,
    language: settings.language,
    onBack: () => setScreen('home'),
    onOpenSettings: () => openSettings('style'),
  };

  return (
    <div className={appClassName} style={appStyle}>
      <div className="app-background">
        <div className="orb orb-left" />
        <div className="orb orb-right" />
        <div className="grid-layer" />
      </div>

      {screen === 'home' ? (
        <HomeScreen
          messages={messages}
          onNavigate={navigateTo}
          onOpenSettings={() => openSettings('style')}
          onOpenAnnouncementArchive={() => openSettings('announcement')}
          onOpenStart={() => setModalStep('root')}
        />
      ) : screen === 'face-maker' ? (
        <FaceMakerPage
          messages={messages}
          language={settings.language}
          onBack={() => setScreen('home')}
          onOpenSettings={() => openSettings('style')}
        />
      ) : screen === 'style-transfer' ? (
        <StyleTransferPage
          {...sharedPageProps}
          pageTitle={messages.pageStyleTitle}
          pageDescription={messages.pageStyleDescription}
        />
      ) : screen === 'prompt-suite' ? (
        <PromptSuitePage
          {...sharedPageProps}
          pageTitle={messages.pagePromptTitle}
          pageDescription={messages.pagePromptDescription}
        />
      ) : screen === 'paper2gal' ? (
        <Paper2GalPage
          {...sharedPageProps}
          pageTitle={messages.pagePaperTitle}
          pageDescription={messages.pagePaperDescription}
        />
      ) : (
        <FeaturePage
          screen={screen}
          messages={messages}
          language={settings.language}
          onBack={() => setScreen('home')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {modalStep && (
        <StartModal
          step={modalStep}
          messages={messages}
          onClose={() => setModalStep(null)}
          onSelect={navigateTo}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          initialTab={settingsInitialTab}
          messages={messages}
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={updateSettings}
        />
      )}
    </div>
  );
}

function HomeScreen({
  messages,
  onNavigate,
  onOpenSettings,
  onOpenAnnouncementArchive,
  onOpenStart,
}: {
  messages: Messages;
  onNavigate: (screen: Exclude<FeatureScreen, 'home'>) => void;
  onOpenSettings: () => void;
  onOpenAnnouncementArchive: () => void;
  onOpenStart: () => void;
}) {
  return (
    <main className="home-shell">
      <section className="top-banner fade-up delay-1">
        <div className="top-banner-copy">
          <h1>{messages.appTitle}</h1>
          <p className="banner-subtitle">{messages.appSubtitle}</p>
          <p className="banner-description">{messages.overviewDescription}</p>
        </div>
        <div className="top-banner-side">
          <div className="version-pill">
            <span>{messages.versionLabel}</span>
            <strong>{VERSION}</strong>
          </div>
        </div>
      </section>

      <section className="home-hero-card fade-up delay-2">
        <div className="home-hero-grid">
          <article className="home-hero-copy">
            <p className="section-label">{messages.announcementTitle}</p>
            <h2>{VERSION}</h2>
            <p>{messages.announcementDescription}</p>
            <ul className="home-announcement-list">
              <li>{messages.announcementList1}</li>
              <li>{messages.announcementList2}</li>
              <li>{messages.announcementList3}</li>
            </ul>
            <div className="workflow-actions home-announcement-actions">
              <button className="secondary-button" type="button" onClick={onOpenAnnouncementArchive}>
                {messages.announcementHistoryButton}
              </button>
            </div>
          </article>

          <article className="home-hero-workflow">
            <h3>{messages.workflowTitle}</h3>
            <p>{messages.workflowDescription}</p>

            <div className="workflow-list horizontal">
              <button className="workflow-item compact workflow-entry-button" type="button" onClick={() => onNavigate('face-maker')}>
                <ActionIcon kind="face-maker" />
                <span>{messages.featureFace}</span>
              </button>
              <button className="workflow-item compact workflow-entry-button" type="button" onClick={() => onNavigate('style-transfer')}>
                <ActionIcon kind="style-transfer" />
                <span>{messages.featureStyle}</span>
              </button>
              <button className="workflow-item compact workflow-entry-button" type="button" onClick={() => onNavigate('prompt-suite')}>
                <ActionIcon kind="prompt-suite" />
                <span>{messages.featurePrompt}</span>
              </button>
              <button className="workflow-item compact workflow-entry-button" type="button" onClick={() => onNavigate('paper2gal')}>
                <ActionIcon kind="paper2gal" />
                <span>{messages.featurePaper}</span>
              </button>
            </div>

            <div className="workflow-actions">
              <button className="primary-button giant-button workflow-action-button" type="button" onClick={onOpenStart}>
                {messages.startButton}
              </button>
              <button className="secondary-button giant-button workflow-action-button" type="button" onClick={onOpenSettings}>
                {messages.settingsButton}
              </button>
            </div>

            <p className="workflow-subhint">{messages.workflowHint}</p>
          </article>
        </div>
      </section>

      <footer className="home-footer fade-up delay-4">
        <div className="notice-banner">{messages.privacyNote}</div>
        <p>{messages.footerNote}</p>
      </footer>
    </main>
  );
}

type FaceMakerCopy = {
  saved: string;
  unsaved: string;
  unsavedWarning: string;
  savedWarning: string;
  reset: string;
  saveDraft: string;
  export: string;
  workboard: string;
  assetHairTitle: string;
  assetEyesTitle: string;
  assetAccessoryTitle: string;
  paramsTitle: string;
  projectStatusTitle: string;
  headScale: string;
  eyeScale: string;
  mouthCurve: string;
  tilt: string;
  currentHair: string;
  currentEyes: string;
  currentAccessory: string;
  continueEdit: string;
  confirmReturn: string;
  confirmTitle: string;
  confirmDirty: string;
  confirmClean: string;
};

const faceMakerCopy: Record<BaseLanguage, FaceMakerCopy> = {
  zh: {
    saved: '已保存',
    unsaved: '未保存',
    unsavedWarning: '你还没保存',
    savedWarning: '当前内容已保存',
    reset: '重置',
    saveDraft: '保存草稿',
    export: '导出',
    workboard: '工作画板',
    assetHairTitle: '发型资产',
    assetEyesTitle: '眼型资产',
    assetAccessoryTitle: '配件资产',
    paramsTitle: '参数调整',
    projectStatusTitle: '项目状态',
    headScale: '头部比例',
    eyeScale: '眼睛大小',
    mouthCurve: '嘴角弧度',
    tilt: '整体倾角',
    currentHair: '当前发型',
    currentEyes: '当前眼型',
    currentAccessory: '当前配件',
    continueEdit: '继续编辑',
    confirmReturn: '确认返回',
    confirmTitle: '确定返回首页吗？',
    confirmDirty: '你还没保存当前捏脸项目，返回后未保存的调整不会保留。',
    confirmClean: '当前内容已经保存，返回首页后可以稍后再继续编辑。',
  },
  ja: {
    saved: '保存済み',
    unsaved: '未保存',
    unsavedWarning: 'まだ保存していません',
    savedWarning: '現在の内容は保存済みです',
    reset: 'リセット',
    saveDraft: '下書きを保存',
    export: '書き出し',
    workboard: '作業ボード',
    assetHairTitle: '髪型アセット',
    assetEyesTitle: '目元アセット',
    assetAccessoryTitle: 'アクセサリー',
    paramsTitle: 'パラメータ調整',
    projectStatusTitle: 'プロジェクト状態',
    headScale: '頭部比率',
    eyeScale: '目の大きさ',
    mouthCurve: '口元カーブ',
    tilt: '全体の傾き',
    currentHair: '現在の髪型',
    currentEyes: '現在の目元',
    currentAccessory: '現在のアクセサリー',
    continueEdit: '編集を続ける',
    confirmReturn: '戻る',
    confirmTitle: 'ホームへ戻りますか？',
    confirmDirty: '現在の捏脸プロジェクトはまだ保存されていません。戻ると未保存の調整は失われます。',
    confirmClean: '現在の内容は保存済みです。ホームへ戻って後で続けられます。',
  },
  en: {
    saved: 'Saved',
    unsaved: 'Unsaved',
    unsavedWarning: 'Unsaved changes',
    savedWarning: 'Everything is saved',
    reset: 'Reset',
    saveDraft: 'Save draft',
    export: 'Export',
    workboard: 'Workbench',
    assetHairTitle: 'Hair assets',
    assetEyesTitle: 'Eye assets',
    assetAccessoryTitle: 'Accessories',
    paramsTitle: 'Adjustments',
    projectStatusTitle: 'Project status',
    headScale: 'Head scale',
    eyeScale: 'Eye size',
    mouthCurve: 'Mouth curve',
    tilt: 'Overall tilt',
    currentHair: 'Current hair',
    currentEyes: 'Current eyes',
    currentAccessory: 'Current accessory',
    continueEdit: 'Keep editing',
    confirmReturn: 'Return',
    confirmTitle: 'Return to the homepage?',
    confirmDirty: 'This face-maker draft still has unsaved changes. Returning now will discard them.',
    confirmClean: 'The current face-maker draft is already saved. You can safely come back later.',
  },
  ru: {
    saved: 'Сохранено',
    unsaved: 'Не сохранено',
    unsavedWarning: 'Есть несохранённые изменения',
    savedWarning: 'Текущий черновик сохранён',
    reset: 'Сбросить',
    saveDraft: 'Сохранить черновик',
    export: 'Экспорт',
    workboard: 'Рабочее поле',
    assetHairTitle: 'Ассеты волос',
    assetEyesTitle: 'Ассеты глаз',
    assetAccessoryTitle: 'Аксессуары',
    paramsTitle: 'Параметры',
    projectStatusTitle: 'Состояние проекта',
    headScale: 'Размер головы',
    eyeScale: 'Размер глаз',
    mouthCurve: 'Изгиб рта',
    tilt: 'Общий наклон',
    currentHair: 'Текущая причёска',
    currentEyes: 'Текущие глаза',
    currentAccessory: 'Текущий аксессуар',
    continueEdit: 'Продолжить редактирование',
    confirmReturn: 'Вернуться',
    confirmTitle: 'Вернуться на главную?',
    confirmDirty: 'Текущий проект face-maker ещё не сохранён. Если вернуться сейчас, правки будут потеряны.',
    confirmClean: 'Текущий черновик уже сохранён. Можно безопасно вернуться и продолжить позже.',
  },
};

const localizedFaceMakerCopy: Record<AppLanguage, FaceMakerCopy> = {
  zh: faceMakerCopy.zh,
  ja: faceMakerCopy.ja,
  en: faceMakerCopy.en,
  ru: faceMakerCopy.ru,
  ko: faceMakerCopy.en,
  fr: faceMakerCopy.en,
  de: faceMakerCopy.en,
  es: faceMakerCopy.en,
  it: faceMakerCopy.en,
  pt: faceMakerCopy.en,
};

function FaceMakerPage({
  messages,
  language,
  onBack,
  onOpenSettings,
}: {
  messages: Messages;
  language: AppLanguage;
  onBack: () => void;
  onOpenSettings: () => void;
}) {
  const copy = localizedFaceMakerCopy[language];
  const initialDraft = {
    hair: 'air-bob',
    eyes: 'soft-round',
    accessory: 'none',
    headScale: 52,
    eyeScale: 48,
    mouthCurve: 56,
    tilt: 0,
  };

  const [draft, setDraft] = useState(initialDraft);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(initialDraft));
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isDirty = JSON.stringify(draft) !== savedSnapshot;

  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const assetGroups = [
    {
      title: copy.assetHairTitle,
      key: 'hair' as const,
      items: [
        { value: 'air-bob', label: '空气波波' },
        { value: 'long-straight', label: '直长发' },
        { value: 'twin-tail', label: '双马尾' },
        { value: 'wolf-cut', label: '狼尾层次' },
      ],
    },
    {
      title: copy.assetEyesTitle,
      key: 'eyes' as const,
      items: [
        { value: 'soft-round', label: '圆润眼' },
        { value: 'sharp', label: '上挑眼' },
        { value: 'sleepy', label: '慵懒眼' },
        { value: 'idol', label: '偶像眼' },
      ],
    },
    {
      title: copy.assetAccessoryTitle,
      key: 'accessory' as const,
      items: [
        { value: 'none', label: '无配件' },
        { value: 'glasses', label: '眼镜' },
        { value: 'ribbon', label: '发饰' },
        { value: 'scar', label: '伤痕' },
      ],
    },
  ];

  function updateDraft<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function saveDraft() {
    setSavedSnapshot(JSON.stringify(draft));
  }

  function resetDraft() {
    setDraft(initialDraft);
  }

  function confirmBack() {
    setIsConfirmOpen(true);
  }

  const headScale = draft.headScale / 100;
  const eyeScale = draft.eyeScale / 50;
  const mouthCurve = (draft.mouthCurve - 50) / 10;

  return (
    <main className="feature-shell face-editor-shell">
      <header className="feature-header fade-up delay-1">
        <button className="secondary-button small-button" type="button" onClick={confirmBack}>
          {messages.backHome}
        </button>
        <div className="feature-header-meta">
          <span>{isDirty ? copy.unsaved : copy.saved}</span>
          <button className="secondary-button small-button" type="button" onClick={onOpenSettings}>
            {messages.openSettings}
          </button>
        </div>
      </header>

      <section className="editor-workbench fade-up delay-2">
        <div className="editor-toolbar">
          <div className="editor-toolbar-copy">
            <p className="section-label">{messages.appSubtitle}</p>
            <h2>{messages.pageFaceTitle}</h2>
          </div>
          <div className="editor-toolbar-actions">
            <span className={`save-indicator ${isDirty ? 'dirty' : 'clean'}`}>{isDirty ? copy.unsavedWarning : copy.savedWarning}</span>
            <button className="secondary-button small-button" type="button" onClick={resetDraft}>
              {copy.reset}
            </button>
            <button className="secondary-button small-button" type="button" onClick={saveDraft}>
              {copy.saveDraft}
            </button>
            <button className="primary-button small-button" type="button">
              {copy.export}
            </button>
          </div>
        </div>

        <div className="editor-layout">
          <aside className="editor-side editor-assets">
            {assetGroups.map((group) => (
              <section key={group.title} className="editor-panel-block">
                <h3>{group.title}</h3>
                <div className="asset-grid">
                  {group.items.map((item) => (
                    <button
                      key={item.value}
                      className={`asset-card ${draft[group.key] === item.value ? 'active' : ''}`}
                      type="button"
                      onClick={() => updateDraft(group.key, item.value)}
                    >
                      <span className="asset-thumb" />
                      <strong>{item.label}</strong>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </aside>

          <section className="editor-stage-shell">
            <div className="stage-toolbar">
              <span>{copy.workboard}</span>
              <div className="stage-toolbar-actions">
                <button className="tool-dot active" type="button" aria-label="Preview mode" />
                <button className="tool-dot" type="button" aria-label="Reference mode" />
                <button className="tool-dot" type="button" aria-label="Overlay mode" />
              </div>
            </div>
            <div className="editor-stage">
              <div className="checkerboard-layer" />
              <div className="character-stage" style={{ transform: `rotate(${draft.tilt}deg)` }}>
                <div className={`hair-shape ${draft.hair}`} />
                <div className="head-shape" style={{ transform: `scale(${headScale})` }}>
                  <div className={`eye-pair ${draft.eyes}`} style={{ transform: `scale(${eyeScale})` }}>
                    <span />
                    <span />
                  </div>
                  <div className="mouth-line" style={{ borderRadius: `${8 + mouthCurve * 2}px` }} />
                </div>
                {draft.accessory !== 'none' && <div className={`accessory-chip ${draft.accessory}`} />}
              </div>
            </div>
          </section>

          <aside className="editor-side editor-controls">
            <section className="editor-panel-block">
              <h3>{copy.paramsTitle}</h3>
              <label className="slider-row">
                <span>{copy.headScale}</span>
                <input type="range" min="40" max="70" value={draft.headScale} onChange={(event) => updateDraft('headScale', Number(event.target.value))} />
              </label>
              <label className="slider-row">
                <span>{copy.eyeScale}</span>
                <input type="range" min="38" max="62" value={draft.eyeScale} onChange={(event) => updateDraft('eyeScale', Number(event.target.value))} />
              </label>
              <label className="slider-row">
                <span>{copy.mouthCurve}</span>
                <input type="range" min="40" max="64" value={draft.mouthCurve} onChange={(event) => updateDraft('mouthCurve', Number(event.target.value))} />
              </label>
              <label className="slider-row">
                <span>{copy.tilt}</span>
                <input type="range" min="-10" max="10" value={draft.tilt} onChange={(event) => updateDraft('tilt', Number(event.target.value))} />
              </label>
            </section>

            <section className="editor-panel-block">
              <h3>{copy.projectStatusTitle}</h3>
              <div className="status-stack">
                <div className="status-card-mini">
                  <strong>{draft.hair}</strong>
                  <span>{copy.currentHair}</span>
                </div>
                <div className="status-card-mini">
                  <strong>{draft.eyes}</strong>
                  <span>{copy.currentEyes}</span>
                </div>
                <div className="status-card-mini">
                  <strong>{draft.accessory}</strong>
                  <span>{copy.currentAccessory}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>

      <footer className="face-editor-footer fade-up delay-3">
        <div className="notice-banner">{messages.privacyNote}</div>
      </footer>

      {isConfirmOpen && (
        <ConfirmReturnModal
          copy={copy}
          isDirty={isDirty}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={onBack}
        />
      )}
    </main>
  );
}

function ConfirmReturnModal({
  copy,
  isDirty,
  onCancel,
  onConfirm,
}: {
  copy: FaceMakerCopy;
  isDirty: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [isClosing, setIsClosing] = useState(false);

  function requestClose() {
    setIsClosing(true);
    window.setTimeout(onCancel, MODAL_CLOSE_MS);
  }

  function confirmLeave() {
    setIsClosing(true);
    window.setTimeout(onConfirm, MODAL_CLOSE_MS);
  }

  return (
    <div className={`modal-backdrop ${isClosing ? 'closing' : 'opening'}`} role="presentation" onClick={requestClose}>
      <section className={`modal-card confirm-modal modal-surface ${isClosing ? 'closing' : 'opening'}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={requestClose} aria-label="Close">
          ×
        </button>
        <p className="section-label">{copy.confirmTitle}</p>
        <h2>{copy.confirmTitle}</h2>
        <p className="modal-description">{isDirty ? copy.confirmDirty : copy.confirmClean}</p>
        <div className="confirm-actions">
          <button className="secondary-button" type="button" onClick={requestClose}>
            {copy.continueEdit}
          </button>
          <button className="primary-button" type="button" onClick={confirmLeave}>
            {copy.confirmReturn}
          </button>
        </div>
      </section>
    </div>
  );
}

function FeaturePage({
  screen,
  messages,
  language,
  onBack,
  onOpenSettings,
}: {
  screen: Exclude<FeatureScreen, 'home'>;
  messages: Messages;
  language: AppLanguage;
  onBack: () => void;
  onOpenSettings: () => void;
}) {
  const details = getFeatureDetails(screen, messages);

  return (
    <main className="feature-shell">
      <header className="feature-header fade-up delay-1">
        <button className="secondary-button small-button" type="button" onClick={onBack}>
          {messages.backHome}
        </button>
        <div className="feature-header-meta">
          <span>{messages.comingSoon}</span>
          <button className="secondary-button small-button" type="button" onClick={onOpenSettings}>
            {messages.openSettings}
          </button>
        </div>
      </header>

      <section className="feature-main">
        <div className="feature-intro-card fade-up delay-2">
          <p className="section-label">{messages.appSubtitle}</p>
          <h2>{details.title}</h2>
          <p>{details.description}</p>
          <div className="language-badge">{language.toUpperCase()}</div>
        </div>

        <div className="feature-layout-card fade-up delay-3">
          <div className="feature-layout-grid">
            <div className="layout-column workspace-column">
              <div className="layout-card tall-card">
                <span>{messages.moduleCanvas}</span>
                <strong>{details.workspaceTitle}</strong>
              </div>
            </div>
            <div className="layout-column side-column">
              <div className="layout-card">
                <span>{messages.modulePanel}</span>
                <strong>{details.panelTitle}</strong>
              </div>
              <div className="layout-card">
                <span>{messages.modulePipeline}</span>
                <strong>{details.pipelineTitle}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-bottom-grid">
        <article className="info-panel fade-up delay-4">
          <h3>{messages.preparedModules}</h3>
          <ul>
            <li>{messages.placeholderCanvas}</li>
            <li>{messages.placeholderSettings}</li>
            <li>{messages.moduleStorage}</li>
          </ul>
        </article>

        <article className="info-panel fade-up delay-5">
          <h3>{messages.placeholderTodo}</h3>
          <ul>
            <li>{messages.placeholderPipeline}</li>
            <li>{details.todoOne}</li>
            <li>{details.todoTwo}</li>
          </ul>
        </article>
      </section>

      <p className="feature-hint fade-up delay-6">{messages.privacyNote}</p>
    </main>
  );
}

function ActionIcon({
  kind,
}: {
  kind: 'face-maker' | 'style-transfer' | 'prompt-suite' | 'paper2gal';
}) {
  const paths = {
    'face-maker': (
      <>
        <circle cx="20" cy="15" r="6" />
        <path d="M11 30c0-5 4-9 9-9s9 4 9 9" />
        <path d="M8 19c2 9 6 14 12 14s10-5 12-14" />
      </>
    ),
    'style-transfer': (
      <>
        <path d="M10 27c0-8 5-14 12-14 4 0 7 2 9 5" />
        <path d="M22 10h10v10" />
        <path d="M32 10 20 22" />
        <path d="M10 30h20" />
      </>
    ),
    'prompt-suite': (
      <>
        <path d="M10 10h20v14H18l-6 6v-6h-2z" />
        <path d="M15 16h10" />
        <path d="M15 20h7" />
      </>
    ),
    paper2gal: (
      <>
        <rect x="9" y="10" width="22" height="20" rx="4" />
        <circle cx="16" cy="17" r="2.5" />
        <path d="m13 27 5-5 4 4 4-6 4 7" />
      </>
    ),
  } as const;

  return (
    <span className="action-icon-wrap fade-up">
      <svg className="action-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths[kind]}
      </svg>
    </span>
  );
}

function StartModal({
  step,
  messages,
  onClose,
  onSelect,
}: {
  step: Exclude<StartModalStep, null>;
  messages: Messages;
  onClose: () => void;
  onSelect: (screen: Exclude<FeatureScreen, 'home'>) => void;
}) {
  const [isClosing, setIsClosing] = useState(false);

  function requestClose() {
    setIsClosing(true);
    window.setTimeout(onClose, MODAL_CLOSE_MS);
  }

  return (
    <div className={`modal-backdrop ${isClosing ? 'closing' : 'opening'}`} role="presentation" onClick={requestClose}>
      <section className={`modal-card action-modal modal-surface ${isClosing ? 'closing' : 'opening'}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={requestClose} aria-label="Close">
          ×
        </button>

        <p className="section-label">{messages.appSubtitle}</p>
        <h2>{messages.startModalTitle}</h2>
        <p className="modal-description">{messages.startModalDescription}</p>

        <div className="action-grid root-grid">
          <button className="action-tile" type="button" onClick={() => onSelect('face-maker')}>
            <ActionIcon kind="face-maker" />
            <strong>{messages.actionFace}</strong>
          </button>
          <button className="action-tile" type="button" onClick={() => onSelect('style-transfer')}>
            <ActionIcon kind="style-transfer" />
            <strong>{messages.actionStyle}</strong>
          </button>
          <button className="action-tile" type="button" onClick={() => onSelect('prompt-suite')}>
            <ActionIcon kind="prompt-suite" />
            <strong>{messages.actionPromptSuite}</strong>
          </button>
          <button className="action-tile" type="button" onClick={() => onSelect('paper2gal')}>
            <ActionIcon kind="paper2gal" />
            <strong>{messages.actionPaper2Gal}</strong>
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsModal({
  initialTab,
  messages,
  settings,
  onClose,
  onUpdate,
}: {
  initialTab: SettingsTab;
  messages: Messages;
  settings: SettingsState;
  onClose: () => void;
  onUpdate: (patch: Partial<SettingsState>) => void;
}) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedAnnouncementVersion, setSelectedAnnouncementVersion] = useState<
    (typeof announcementHistory)[number]['version']
  >(announcementHistory[0].version);
  const styleLocked = settings.stylePreset === 'paper2gal';
  const resolvedLanguage = translationAliases[settings.language];
  const customAccentHex = /^#[0-9a-fA-F]{6}$/.test(settings.customAccentColor)
    ? settings.customAccentColor
    : defaultSettings.customAccentColor;
  const effectiveEndpoint =
    settings.interfaceMode === 'custom' && settings.apiBaseUrl
      ? settings.apiBaseUrl
      : settings.interfaceMode === 'custom'
        ? 'https://your-api.example.com'
        : 'builtin://placeholder-model';

  const tabs: Array<{ key: SettingsTab; label: string }> = [
    { key: 'style', label: messages.tabStyle },
    { key: 'language', label: messages.tabLanguage },
    { key: 'api', label: messages.tabApi },
    { key: 'announcement', label: messages.tabAnnouncement },
    { key: 'about', label: messages.tabAbout },
  ];

  const selectedAnnouncement =
    announcementHistory.find((item) => item.version === selectedAnnouncementVersion) ?? announcementHistory[0];

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  function requestClose() {
    setIsClosing(true);
    window.setTimeout(onClose, MODAL_CLOSE_MS);
  }

  return (
    <div className={`modal-backdrop ${isClosing ? 'closing' : 'opening'}`} role="presentation" onClick={requestClose}>
      <section className={`modal-card settings-modal modal-surface ${isClosing ? 'closing' : 'opening'}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={requestClose} aria-label="Close">
          ×
        </button>

        <h2 className="settings-title">{messages.settingsTitle}</h2>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            {tabs.map((item) => (
              <button
                key={item.key}
                className={`settings-tab ${tab === item.key ? 'active' : ''}`}
                type="button"
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </aside>

          <div className="settings-content">
            {tab === 'style' && (
              <>
                <section className="settings-section">
                  <h3>{messages.stylePresetTitle}</h3>
                  <div className="chip-row">
                    <button
                      className={`choice-chip ${settings.stylePreset === 'default' ? 'active' : ''}`}
                      type="button"
                      onClick={() => onUpdate({ stylePreset: 'default' })}
                    >
                      {messages.stylePresetDefault}
                    </button>
                    <button
                      className={`choice-chip ${settings.stylePreset === 'paper2gal' ? 'active' : ''}`}
                      type="button"
                      onClick={() => onUpdate({ stylePreset: 'paper2gal' })}
                    >
                      {messages.stylePresetPaper2Gal}
                    </button>
                  </div>
                </section>

                <section className="settings-section">
                  <h3>{messages.themeModeTitle}</h3>
                  <div className="chip-row">
                    <button
                      className={`choice-chip ${settings.depth === 'light' ? 'active' : ''}`}
                      type="button"
                      disabled={styleLocked}
                      onClick={() => onUpdate({ depth: 'light' })}
                    >
                      {messages.themeLight}
                    </button>
                    <button
                      className={`choice-chip ${settings.depth === 'deep' ? 'active' : ''}`}
                      type="button"
                      disabled={styleLocked}
                      onClick={() => onUpdate({ depth: 'deep' })}
                    >
                      {messages.themeDeep}
                    </button>
                  </div>
                  <div className="contrast-control">
                    <div className="contrast-copy">
                      <strong>{messages.customContrastLabel}</strong>
                      <span>{messages.customContrastHint}</span>
                    </div>
                    <div className="contrast-slider-row">
                      <input
                        className="contrast-slider"
                        type="range"
                        min="80"
                        max="130"
                        step="1"
                        value={settings.contrast}
                        onChange={(event) => onUpdate({ contrast: Number(event.target.value) })}
                      />
                      <span className="contrast-value">{settings.contrast}%</span>
                    </div>
                  </div>
                </section>

                <section className="settings-section">
                  <h3>{messages.accentTitle}</h3>
                  <div className="palette-grid">
                    {paletteOptions.map((item) => (
                    <button
                      key={item.value}
                      className={`palette-chip ${settings.accent === item.value ? 'active' : ''}`}
                      type="button"
                      disabled={styleLocked}
                      onClick={() => onUpdate({ accent: item.value })}
                    >
                        <span className="palette-dot" style={{ backgroundColor: item.swatch }} />
                        {item.label[resolvedLanguage]}
                      </button>
                    ))}
                  </div>
                  {settings.accent === 'custom' && !styleLocked && (
                    <div className="custom-accent-shell">
                      <label className="custom-accent-row">
                        <input
                          className="custom-color-input"
                          type="color"
                          value={customAccentHex}
                          onChange={(event) => onUpdate({ customAccentColor: event.target.value })}
                        />
                        <input
                          className="settings-input"
                          type="text"
                          value={settings.customAccentColor}
                          placeholder="#7c5cff"
                          onChange={(event) => onUpdate({ customAccentColor: event.target.value })}
                          onBlur={() => {
                            if (!/^#[0-9a-fA-F]{6}$/.test(settings.customAccentColor)) {
                              onUpdate({ customAccentColor: customAccentHex });
                            }
                          }}
                        />
                      </label>
                      <p className="muted-copy">{messages.customAccentLabel}</p>
                    </div>
                  )}
                </section>

                <section className="settings-section">
                  <h3>{messages.fontTitle}</h3>
                  <div className="palette-grid">
                    {fontPresetOptions.map((item) => (
                      <button
                        key={item.value}
                        className={`palette-chip ${settings.fontPreset === item.value ? 'active' : ''}`}
                        type="button"
                        onClick={() => onUpdate({ fontPreset: item.value })}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {settings.fontPreset === 'custom' && (
                    <div className="custom-font-shell">
                      <input
                        className="settings-input"
                        type="text"
                        placeholder="输入页面字体名称，例如: LXGW WenKai"
                        value={settings.customFontFamily}
                        onChange={(event) => onUpdate({ customFontFamily: event.target.value })}
                      />
                    </div>
                  )}
                </section>

                {styleLocked && (
                  <section className="settings-section tip-section">
                    <h3>{messages.styleLockedTitle}</h3>
                    <p>{messages.styleLockedDescription}</p>
                  </section>
                )}
              </>
            )}

            {tab === 'language' && (
              <section className="settings-section">
                <h3>{messages.languageTitle}</h3>
                <div className="palette-grid">
                  {languageOptions.map((item) => (
                    <button
                      key={item.value}
                      className={`palette-chip ${settings.language === item.value ? 'active' : ''}`}
                      type="button"
                      onClick={() => onUpdate({ language: item.value })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {tab === 'api' && (
              <>
                <section className="settings-section">
                  <h3>{messages.apiModeTitle}</h3>
                  <div className="chip-row">
                    <button
                      className={`choice-chip ${settings.interfaceMode === 'builtin' ? 'active' : ''}`}
                      type="button"
                      onClick={() => onUpdate({ interfaceMode: 'builtin' })}
                    >
                      {messages.builtinMode}
                    </button>
                    <button
                      className={`choice-chip ${settings.interfaceMode === 'custom' ? 'active' : ''}`}
                      type="button"
                      onClick={() => onUpdate({ interfaceMode: 'custom' })}
                    >
                      {messages.customApiMode}
                    </button>
                  </div>
                </section>

                {settings.interfaceMode === 'custom' && (
                  <>
                    <section className="settings-section">
                      <h3>{messages.apiBaseTitle}</h3>
                      <input
                        className="settings-input"
                        type="url"
                        placeholder={messages.apiBasePlaceholder}
                        value={settings.apiBaseUrl}
                        onChange={(event) => onUpdate({ apiBaseUrl: event.target.value })}
                      />
                    </section>

                    <section className="settings-section">
                      <h3>{messages.apiKeyTitle}</h3>
                      <input
                        className="settings-input"
                        type="password"
                        placeholder={messages.apiKeyPlaceholder}
                        value={settings.apiKey}
                        onChange={(event) => onUpdate({ apiKey: event.target.value })}
                      />
                      <p className="muted-copy">{messages.apiHelp}</p>
                      <p className="muted-copy">{messages.apiHint}</p>
                    </section>
                  </>
                )}

                <section className="settings-section tip-section">
                  <h3>{messages.apiEffectiveTitle}</h3>
                  <p className="muted-copy">{effectiveEndpoint}</p>
                  <p>{settings.interfaceMode === 'custom' ? messages.apiEffectiveCustom : messages.apiEffectiveBuiltin}</p>
                  <p className="tiny-copy">{messages.apiPrivacy}</p>
                </section>
              </>
            )}

            {tab === 'announcement' && (
              <section className="settings-section announcement-shell">
                <div className="announcement-list">
                  {announcementHistory.map((item) => (
                    <button
                      key={item.version}
                      className={`announcement-entry ${selectedAnnouncement.version === item.version ? 'active' : ''}`}
                      type="button"
                      onClick={() => setSelectedAnnouncementVersion(item.version)}
                    >
                      <span>{item.date}</span>
                      <strong>{item.version}</strong>
                      <p>{item.summary}</p>
                    </button>
                  ))}
                </div>
                <div className="announcement-detail">
                  <span>{selectedAnnouncement.date}</span>
                  <h3>{selectedAnnouncement.title}</h3>
                  <p>{selectedAnnouncement.summary}</p>
                  <ul>
                    {selectedAnnouncement.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {tab === 'about' && (
              <section className="settings-section">
                <h3>{messages.aboutTitle}</h3>
                <p>{messages.aboutDescription}</p>
                <div className="link-list">
                  <a href="https://github.com/hzagaming" rel="noreferrer" target="_blank">
                    {messages.profileLinkLabel}
                  </a>
                  <a href="https://github.com/hzagaming/Original-Character-Maker" rel="noreferrer" target="_blank">
                    {messages.repoLinkLabel}
                  </a>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function getFeatureDetails(screen: Exclude<FeatureScreen, 'home'>, messages: Messages) {
  switch (screen) {
    case 'face-maker':
      return {
        title: messages.pageFaceTitle,
        description: messages.pageFaceDescription,
        workspaceTitle: 'Character Canvas',
        panelTitle: 'Face / Hair / Palette',
        pipelineTitle: 'Presets / Export',
        todoOne: '补角色图层、部位分类和颜色系统',
        todoTwo: '补随机生成、重置与导出 PNG',
      };
    case 'style-transfer':
      return {
        title: messages.pageStyleTitle,
        description: messages.pageStyleDescription,
        workspaceTitle: 'Input / Output Preview',
        panelTitle: 'Model / Prompt / Seed',
        pipelineTitle: 'Queue / History',
        todoOne: '补输入图片、模型选择和参数面板',
        todoTwo: '补任务状态、结果预览与下载',
      };
    case 'prompt-suite':
      return {
        title: messages.pagePromptTitle,
        description: messages.pagePromptDescription,
        workspaceTitle: 'Prompt Workspace',
        panelTitle: 'LLM / TTS Config',
        pipelineTitle: 'Generated Assets',
        todoOne: '补角色资料、Prompt 模板和导出逻辑',
        todoTwo: '补 LLM / TTS 服务封装与本地保存',
      };
    case 'paper2gal':
      return {
        title: messages.pagePaperTitle,
        description: messages.pagePaperDescription,
        workspaceTitle: 'paper2gal Stage',
        panelTitle: 'Asset Controls',
        pipelineTitle: 'Outputs / Logs',
        todoOne: '补图片素材工作流配置与启动入口',
        todoTwo: '补 Character Workflow 仓库联动',
      };
  }
}

export default App;
