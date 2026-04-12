import { useEffect, useState } from 'react';
import type {
  AccentPalette,
  AppLanguage,
  FeatureScreen,
  SettingsState,
  SettingsTab,
  StartModalStep,
  ThemeDepth,
} from './types';

const VERSION = '0.1.0';
const STORAGE_KEY = 'oc-maker.settings';

type Messages = {
  appTitle: string;
  versionLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  startButton: string;
  settingsButton: string;
  statusTitle: string;
  statusDescription: string;
  featureCards: [string, string, string];
  featureLabelFace: string;
  featureLabelStyle: string;
  featureLabelSeries: string;
  localOnlyNote: string;
  footerNote: string;
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
  accentTitle: string;
  styleLockedTitle: string;
  styleLockedDescription: string;
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

const translations: Record<AppLanguage, Messages> = {
  zh: {
    appTitle: 'Original Character Maker',
    versionLabel: '版本',
    heroEyebrow: '自定义 OC 角色中控台',
    heroTitle: '先把角色世界的入口搭起来',
    heroDescription:
      '主页、开始流程、设置面板和四个主要功能入口已经规划进同一套框架里，先把网站骨架做稳，后面再逐个填功能。',
    startButton: '开始',
    settingsButton: '设置',
    statusTitle: '当前阶段',
    statusDescription: '0.1.0 框架版已经就位，接下来可以继续补捏脸编辑器、转画风流程和系列素材工作流。',
    featureCards: ['捏脸编辑器框架', '转画风入口占位', '生成系列素材流程'],
    featureLabelFace: '捏脸',
    featureLabelStyle: '转画风',
    featureLabelSeries: '生成系列素材',
    localOnlyNote: '本网站所有信息均在本地保存，不会上传，不会窃取你的角色社卡、个人信息或 API 私钥。',
    footerNote: '所有设置都会保存在本地浏览器中，后续可以继续接入角色工作流与素材管线。',
    backHome: '返回首页',
    openSettings: '打开设置',
    comingSoon: '功能占位',
    preparedModules: '已预留模块',
    placeholderTodo: '下一步建议',
    placeholderCanvas: '角色预览区与控制面板',
    placeholderSettings: '对应模块设置与入口联动',
    placeholderPipeline: '后续接入真实工作流与接口',
    placeholderHint: '当前页面先作为骨架页面存在，方便我们继续往里填具体功能。',
    startModalTitle: '开始新的工作流',
    startModalDescription: '先选择你现在要进入的功能入口，页面框架已经准备好。',
    startModalSeriesTitle: '生成系列素材',
    startModalSeriesDescription: '这里先拆成两个子入口，后面分别接入你的工作流实现。',
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
    accentTitle: '配色样式',
    styleLockedTitle: 'paper2gal 样式已锁定',
    styleLockedDescription: '启用官方样式后，会固定粉白条纹背景与品牌色，不再允许调整深浅和其他配色。',
    languageTitle: '界面语言',
    apiModeTitle: '接口模式',
    builtinMode: '使用内置模型',
    customApiMode: '自定义 API',
    apiBaseTitle: 'API 地址',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API Key',
    apiKeyPlaceholder: '填写你自己的 API Key',
    apiHelp: '可以先保留为空，后续接入生成工作流时再启用。所有配置仅保存在当前浏览器本地。',
    apiHint: '静态页面只会读取这里填写的地址和密钥，不会主动上传其他角色信息。',
    apiEffectiveTitle: '当前生效地址',
    apiEffectiveBuiltin: '当前正在使用内置模型占位配置，后续可替换为本地或远程服务。',
    apiEffectiveCustom: '当前将优先使用你填写的自定义 API 地址。',
    apiPrivacy: '本网站所有信息均在本地保存，不会上传任何角色社卡、个人信息或私钥。',
    announcementTitle: '公告',
    announcementDescription: '目前是 0.1.0 起步版本，重点先把站点外壳、导航和配置体系搭起来。',
    announcementList1: '已完成 homepage 主面板、开始弹窗与设置面板框架。',
    announcementList2: '已预留捏脸、转画风、角色 Prompt/LLM/TTS、paper2gal 四个功能入口。',
    announcementList3: '后续将逐步接入真实编辑器、接口调用和 Character Workflow 仓库联动。',
    aboutTitle: '关于',
    aboutDescription: '这个项目会作为你的 OC 角色创作入口，集中管理捏脸、画风转换和系列素材生成。',
    profileLinkLabel: 'GitHub 主页',
    repoLinkLabel: '仓库地址',
    pageFaceTitle: '捏脸编辑器',
    pageFaceDescription: '这里先放编辑器页面框架，后续可以继续接入脸型、五官、发型、配色和导出逻辑。',
    pageStyleTitle: '转画风',
    pageStyleDescription: '这里先保留画风转换的页面框架，后续可以继续补模型选择、输入输出和任务进度。',
    pagePromptTitle: '角色 Prompt + LLM / TTS 封装',
    pagePromptDescription: '这里先作为脚本与配置的壳子，后续接入角色 Prompt 生成、LLM 调用与语音封装。',
    pagePaperTitle: 'paper2gal 图片素材生成',
    pagePaperDescription: '这里先保留 paper2gal 的入口页，后续再把图片素材生成流程嵌进来。',
    moduleCanvas: '主工作区画布',
    modulePanel: '右侧参数 / 功能面板',
    modulePipeline: '任务队列与输出结果区',
    moduleStorage: '本地配置与历史记录',
  },
  ja: {
    appTitle: 'Original Character Maker',
    versionLabel: 'バージョン',
    heroEyebrow: 'OC キャラクター制作ハブ',
    heroTitle: 'まずは世界観の入口を作る',
    heroDescription:
      'ホーム、開始フロー、設定パネル、4 つの主要機能入口を同じフレームにまとめ、まずはサイトの骨組みを安定させます。',
    startButton: '開始',
    settingsButton: '設定',
    statusTitle: '現在の段階',
    statusDescription: '0.1.0 のフレーム版を用意しました。次は顔編集、画風変換、シリーズ素材ワークフローを順に追加できます。',
    featureCards: ['顔編集フレーム', '画風変換入口', 'シリーズ素材ワークフロー'],
    featureLabelFace: '捏脸',
    featureLabelStyle: '画風変換',
    featureLabelSeries: 'シリーズ素材生成',
    localOnlyNote:
      'このサイトの情報はすべてローカル保存です。キャラクター設定、個人情報、API キーを勝手に送信することはありません。',
    footerNote: '設定はブラウザのローカルに保存されます。後からキャラクターワークフローと素材パイプラインを接続できます。',
    backHome: 'ホームへ戻る',
    openSettings: '設定を開く',
    comingSoon: 'プレースホルダー',
    preparedModules: '用意済みモジュール',
    placeholderTodo: '次のおすすめ',
    placeholderCanvas: 'キャラクタープレビューと操作パネル',
    placeholderSettings: 'モジュール設定と入口の連携',
    placeholderPipeline: '実際のワークフローと API の接続',
    placeholderHint: 'このページは今は骨組みです。ここから具体的な機能を追加していけます。',
    startModalTitle: '新しいワークフローを開始',
    startModalDescription: 'まずは入る機能を選んでください。ページの骨組みはすでに準備できています。',
    startModalSeriesTitle: 'シリーズ素材生成',
    startModalSeriesDescription: 'ここでは 2 つのサブ入口に分け、後からそれぞれのワークフローを接続できます。',
    actionFace: '捏脸',
    actionStyle: '画風変換',
    actionSeries: 'シリーズ素材生成',
    actionPromptSuite: 'キャラ Prompt + LLM / TTS ラッパー',
    actionPaper2Gal: 'paper2gal 画像素材生成',
    actionBack: '前に戻る',
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
    accentTitle: 'カラーパレット',
    styleLockedTitle: 'paper2gal スタイルは固定されています',
    styleLockedDescription:
      '公式スタイルを有効化すると、ピンク系ストライプ背景とブランドカラーに固定され、明暗や他の配色は変更できません。',
    languageTitle: '表示言語',
    apiModeTitle: 'API モード',
    builtinMode: '内蔵モデルを使う',
    customApiMode: 'カスタム API',
    apiBaseTitle: 'API URL',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API Key',
    apiKeyPlaceholder: '自分の API Key を入力',
    apiHelp: '今は空欄でも構いません。後から生成ワークフロー接続時に有効化できます。設定はブラウザ内にのみ保存されます。',
    apiHint: '静的ページはここで指定した URL とキーだけを読み取り、他のキャラクター情報は送信しません。',
    apiEffectiveTitle: '現在の有効先',
    apiEffectiveBuiltin: '現在は内蔵モデル用のプレースホルダー設定を使用中です。後でローカルまたはリモートサービスに差し替えられます。',
    apiEffectiveCustom: '現在は入力されたカスタム API URL を優先して使用します。',
    apiPrivacy: 'このサイトの情報はすべてローカル保存です。キャラクター資料、個人情報、秘密鍵はアップロードされません。',
    announcementTitle: 'お知らせ',
    announcementDescription: '現在は 0.1.0 の立ち上げ版で、サイト外殻、ナビゲーション、設定体系の構築を優先しています。',
    announcementList1: 'homepage、開始モーダル、設定モーダルのフレームを作成しました。',
    announcementList2: '顔編集、画風変換、Prompt/LLM/TTS、paper2gal の 4 入口を確保しました。',
    announcementList3: '今後は実際のエディタ、API 呼び出し、Character Workflow 連携を段階的に追加します。',
    aboutTitle: '情報',
    aboutDescription: 'このプロジェクトは OC 制作の統合入口として、顔編集、画風変換、シリーズ素材生成をまとめて扱います。',
    profileLinkLabel: 'GitHub プロフィール',
    repoLinkLabel: 'リポジトリ',
    pageFaceTitle: '顔編集',
    pageFaceDescription: 'ここには今後、顔型、パーツ、髪型、配色、書き出しなどの編集ロジックを接続できます。',
    pageStyleTitle: '画風変換',
    pageStyleDescription: 'ここには今後、モデル選択、入出力、タスク進行管理などの UI を追加できます。',
    pagePromptTitle: 'キャラ Prompt + LLM / TTS',
    pagePromptDescription: 'ここには今後、キャラ Prompt 生成、LLM 呼び出し、音声封装を接続できます。',
    pagePaperTitle: 'paper2gal 画像素材生成',
    pagePaperDescription: 'ここには今後、paper2gal の画像素材生成フローを組み込めます。',
    moduleCanvas: 'メインワークスペース',
    modulePanel: '右側パラメータ / 機能パネル',
    modulePipeline: 'タスクキューと出力結果',
    moduleStorage: 'ローカル設定と履歴',
  },
  en: {
    appTitle: 'Original Character Maker',
    versionLabel: 'Version',
    heroEyebrow: 'Custom OC creation hub',
    heroTitle: 'Build the front door to the character world first',
    heroDescription:
      'The homepage, launch flow, settings panel, and four major feature entries now live in one shared shell so we can fill in the real tools step by step.',
    startButton: 'Start',
    settingsButton: 'Settings',
    statusTitle: 'Current phase',
    statusDescription: 'The 0.1.0 shell is in place. Next we can layer in the face editor, style transfer flow, and series asset workflow.',
    featureCards: ['Face maker scaffold', 'Style transfer entry', 'Series asset workflow'],
    featureLabelFace: 'Face Maker',
    featureLabelStyle: 'Style Transfer',
    featureLabelSeries: 'Series Assets',
    localOnlyNote:
      'Everything on this site stays local. We do not upload or steal your OC cards, personal information, or API secrets.',
    footerNote: 'All settings are stored in your local browser and can later be connected to your character workflow and asset pipeline.',
    backHome: 'Back home',
    openSettings: 'Open settings',
    comingSoon: 'Feature scaffold',
    preparedModules: 'Prepared modules',
    placeholderTodo: 'Suggested next step',
    placeholderCanvas: 'Character preview and control panel',
    placeholderSettings: 'Module settings and entry wiring',
    placeholderPipeline: 'Real workflow and API integration',
    placeholderHint: 'This page is intentionally a scaffold for now so we can keep filling it with actual functionality.',
    startModalTitle: 'Start a new workflow',
    startModalDescription: 'Choose the area you want to enter first. The page shells are already prepared.',
    startModalSeriesTitle: 'Generate series assets',
    startModalSeriesDescription: 'This branch is split into two sub-entries first so we can wire each workflow later.',
    actionFace: 'Face Maker',
    actionStyle: 'Style Transfer',
    actionSeries: 'Generate Series Assets',
    actionPromptSuite: 'Character Prompt + LLM / TTS Wrapper',
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
    accentTitle: 'Accent palette',
    styleLockedTitle: 'paper2gal style is locked',
    styleLockedDescription:
      'When the official paper2gal style is enabled, the striped pink background and brand color are fixed, so depth and other palettes cannot be changed.',
    languageTitle: 'Interface language',
    apiModeTitle: 'Interface mode',
    builtinMode: 'Use built-in model',
    customApiMode: 'Custom API',
    apiBaseTitle: 'API endpoint',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API key',
    apiKeyPlaceholder: 'Enter your own API key',
    apiHelp: 'You can leave this empty for now and connect it later. Everything is stored only in the current browser.',
    apiHint: 'The static page only reads the address and key configured here. It does not upload other character data by itself.',
    apiEffectiveTitle: 'Current effective endpoint',
    apiEffectiveBuiltin: 'The shell is currently using a built-in placeholder configuration that can later be replaced by a local or remote service.',
    apiEffectiveCustom: 'The app will currently prioritize the custom API endpoint you entered.',
    apiPrivacy: 'All information stays local to this site and browser. No OC sheets, personal data, or secrets are uploaded automatically.',
    announcementTitle: 'Announcement',
    announcementDescription: 'This is the 0.1.0 starter build focused on the site shell, navigation, and configuration system.',
    announcementList1: 'Homepage main panel, launch modal, and settings shell are complete.',
    announcementList2: 'Face maker, style transfer, prompt/LLM/TTS, and paper2gal entries are reserved.',
    announcementList3: 'The next passes will connect the real editor, API calls, and Character Workflow repository integration.',
    aboutTitle: 'About',
    aboutDescription: 'This project will act as the unified entry for your OC creation flow, covering face making, style transfer, and series asset generation.',
    profileLinkLabel: 'GitHub profile',
    repoLinkLabel: 'Repository',
    pageFaceTitle: 'Face Maker',
    pageFaceDescription: 'This page is ready to host the future editor for face shape, features, hairstyle, palettes, and export.',
    pageStyleTitle: 'Style Transfer',
    pageStyleDescription: 'This page is reserved for the future style transfer flow, model options, inputs, outputs, and task progress.',
    pagePromptTitle: 'Character Prompt + LLM / TTS Wrapper',
    pagePromptDescription: 'This page is ready for future prompt generation, LLM calls, and voice packaging.',
    pagePaperTitle: 'paper2gal Asset Generation',
    pagePaperDescription: 'This page is reserved for the future paper2gal image asset generation workflow.',
    moduleCanvas: 'Main workspace canvas',
    modulePanel: 'Right-side controls and tools',
    modulePipeline: 'Task queue and output results',
    moduleStorage: 'Local settings and history',
  },
  ru: {
    appTitle: 'Original Character Maker',
    versionLabel: 'Версия',
    heroEyebrow: 'Центр создания OC',
    heroTitle: 'Сначала построим вход в мир персонажа',
    heroDescription:
      'Главная страница, стартовый поток, панель настроек и четыре основных входа уже собраны в единую оболочку, чтобы затем спокойно наполнять её функциями.',
    startButton: 'Старт',
    settingsButton: 'Настройки',
    statusTitle: 'Текущий этап',
    statusDescription: 'Оболочка 0.1.0 уже готова. Дальше можно по шагам добавлять редактор лица, перенос стиля и поток серийных материалов.',
    featureCards: ['Каркас редактора лица', 'Вход переноса стиля', 'Поток серийных материалов'],
    featureLabelFace: 'Редактор лица',
    featureLabelStyle: 'Перенос стиля',
    featureLabelSeries: 'Серийные материалы',
    localOnlyNote:
      'Вся информация на сайте хранится локально. Мы не загружаем и не крадём карточки персонажей, личные данные или API-ключи.',
    footerNote: 'Все настройки сохраняются в локальном браузере и позже могут быть связаны с character workflow и пайплайном материалов.',
    backHome: 'На главную',
    openSettings: 'Открыть настройки',
    comingSoon: 'Каркас функции',
    preparedModules: 'Подготовленные модули',
    placeholderTodo: 'Следующий шаг',
    placeholderCanvas: 'Превью персонажа и панель управления',
    placeholderSettings: 'Настройки модуля и связка входов',
    placeholderPipeline: 'Подключение реального workflow и API',
    placeholderHint: 'Пока это каркас страницы, чтобы нам было удобно постепенно добавлять реальные возможности.',
    startModalTitle: 'Запустить новый workflow',
    startModalDescription: 'Сначала выберите нужный вход. Каркасы страниц уже подготовлены.',
    startModalSeriesTitle: 'Генерация серии материалов',
    startModalSeriesDescription: 'Эта ветка сначала разделена на два под-входа, чтобы потом отдельно подключить каждый workflow.',
    actionFace: 'Редактор лица',
    actionStyle: 'Перенос стиля',
    actionSeries: 'Генерация серии',
    actionPromptSuite: 'Character Prompt + LLM / TTS',
    actionPaper2Gal: 'paper2gal генерация материалов',
    actionBack: 'Назад',
    settingsTitle: 'Настройки проекта',
    tabStyle: 'Стиль',
    tabLanguage: 'Язык',
    tabApi: 'API',
    tabAnnouncement: 'Объявление',
    tabAbout: 'О проекте',
    stylePresetTitle: 'Пресет стиля',
    stylePresetDefault: 'По умолчанию',
    stylePresetPaper2Gal: 'Официальный paper2gal',
    themeModeTitle: 'Режим',
    themeLight: 'Светлый',
    themeDeep: 'Тёмный',
    accentTitle: 'Палитра',
    styleLockedTitle: 'Стиль paper2gal зафиксирован',
    styleLockedDescription:
      'При включении официального стиля paper2gal розово-белый полосатый фон и фирменный цвет фиксируются, поэтому глубину и другие палитры менять нельзя.',
    languageTitle: 'Язык интерфейса',
    apiModeTitle: 'Режим интерфейса',
    builtinMode: 'Использовать встроенную модель',
    customApiMode: 'Свой API',
    apiBaseTitle: 'Адрес API',
    apiBasePlaceholder: 'https://your-api.example.com',
    apiKeyTitle: 'API-ключ',
    apiKeyPlaceholder: 'Введите свой API-ключ',
    apiHelp: 'Пока можно оставить пустым и включить позже. Всё хранится только в текущем браузере.',
    apiHint: 'Статическая страница читает только адрес и ключ, указанные здесь, и не отправляет другие данные персонажа сама по себе.',
    apiEffectiveTitle: 'Текущий активный адрес',
    apiEffectiveBuiltin: 'Сейчас используется встроенная заглушка, которую позже можно заменить локальным или удалённым сервисом.',
    apiEffectiveCustom: 'Сейчас приложение будет использовать указанный вами адрес пользовательского API.',
    apiPrivacy: 'Вся информация остаётся локально в браузере. Карточки OC, личные данные и секреты автоматически не загружаются.',
    announcementTitle: 'Объявление',
    announcementDescription: 'Сейчас это стартовая версия 0.1.0, где основной упор сделан на оболочку сайта, навигацию и систему настроек.',
    announcementList1: 'Готовы главная панель, стартовое модальное окно и оболочка настроек.',
    announcementList2: 'Зарезервированы входы для face maker, style transfer, Prompt/LLM/TTS и paper2gal.',
    announcementList3: 'Следующие итерации подключат реальный редактор, вызовы API и интеграцию с Character Workflow.',
    aboutTitle: 'О проекте',
    aboutDescription: 'Этот проект станет единым входом для твоего процесса создания OC: редактор лица, перенос стиля и генерация серийных материалов.',
    profileLinkLabel: 'Профиль GitHub',
    repoLinkLabel: 'Репозиторий',
    pageFaceTitle: 'Редактор лица',
    pageFaceDescription: 'Эта страница уже готова под будущий редактор формы лица, черт, причёски, палитр и экспорта.',
    pageStyleTitle: 'Перенос стиля',
    pageStyleDescription: 'Эта страница оставлена под будущий workflow переноса стиля, выбора моделей, входов, выходов и прогресса задач.',
    pagePromptTitle: 'Character Prompt + LLM / TTS',
    pagePromptDescription: 'Эта страница готова под будущую генерацию промптов, вызовы LLM и голосовую упаковку.',
    pagePaperTitle: 'paper2gal генерация материалов',
    pagePaperDescription: 'Эта страница зарезервирована под будущий workflow генерации материалов paper2gal.',
    moduleCanvas: 'Главное рабочее полотно',
    modulePanel: 'Правая панель инструментов',
    modulePipeline: 'Очередь задач и результаты',
    moduleStorage: 'Локальные настройки и история',
  },
};

const paletteOptions: Array<{
  value: AccentPalette;
  swatch: string;
  label: Record<AppLanguage, string>;
}> = [
  {
    value: 'ocean',
    swatch: '#4da3ff',
    label: { zh: '海蓝', ja: 'オーシャン', en: 'Ocean', ru: 'Океан' },
  },
  {
    value: 'emerald',
    swatch: '#45d08d',
    label: { zh: '翡翠', ja: 'エメラルド', en: 'Emerald', ru: 'Изумруд' },
  },
  {
    value: 'amber',
    swatch: '#f5b94f',
    label: { zh: '琥珀', ja: 'アンバー', en: 'Amber', ru: 'Янтарь' },
  },
  {
    value: 'rose',
    swatch: '#f36a9d',
    label: { zh: '玫瑰', ja: 'ローズ', en: 'Rose', ru: 'Роза' },
  },
  {
    value: 'violet',
    swatch: '#9370ff',
    label: { zh: '紫藤', ja: 'バイオレット', en: 'Violet', ru: 'Фиалка' },
  },
  {
    value: 'slate',
    swatch: '#9bb2c9',
    label: { zh: '石墨', ja: 'スレート', en: 'Slate', ru: 'Сланец' },
  },
];

const languageOptions: Array<{
  value: AppLanguage;
  label: Record<AppLanguage, string>;
}> = [
  {
    value: 'zh',
    label: { zh: '中文', ja: '中国語', en: 'Chinese', ru: 'Китайский' },
  },
  {
    value: 'ja',
    label: { zh: '日文', ja: '日本語', en: 'Japanese', ru: 'Японский' },
  },
  {
    value: 'en',
    label: { zh: '英文', ja: '英語', en: 'English', ru: 'Английский' },
  },
  {
    value: 'ru',
    label: { zh: '俄文', ja: 'ロシア語', en: 'Russian', ru: 'Русский' },
  },
];

const defaultSettings: SettingsState = {
  stylePreset: 'default',
  depth: 'deep',
  accent: 'ocean',
  language: 'zh',
  interfaceMode: 'builtin',
  apiBaseUrl: '',
  apiKey: '',
};

function App() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [screen, setScreen] = useState<FeatureScreen>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalStep, setModalStep] = useState<StartModalStep>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<SettingsState>;
      setSettings({ ...defaultSettings, ...parsed });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const messages = translations[settings.language];
  const effectivePreset = settings.stylePreset;
  const effectiveDepth: ThemeDepth = settings.stylePreset === 'paper2gal' ? 'light' : settings.depth;
  const effectiveAccent: AccentPalette = settings.stylePreset === 'paper2gal' ? 'rose' : settings.accent;

  const appClassName = [
    'app-shell',
    `preset-${effectivePreset}`,
    `depth-${effectiveDepth}`,
    `accent-${effectiveAccent}`,
  ].join(' ');

  function updateSettings(patch: Partial<SettingsState>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  function openSeriesModal() {
    setModalStep('series');
  }

  function navigateTo(nextScreen: Exclude<FeatureScreen, 'home'>) {
    setScreen(nextScreen);
    setModalStep(null);
  }

  return (
    <div className={appClassName}>
      <div className="app-background">
        <div className="orb orb-left" />
        <div className="orb orb-right" />
        <div className="grid-layer" />
      </div>

      {screen === 'home' ? (
        <HomeScreen
          messages={messages}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStart={() => setModalStep('root')}
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
          onBack={() => setModalStep('root')}
          onOpenSeries={openSeriesModal}
          onSelect={navigateTo}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
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
  onOpenSettings,
  onOpenStart,
}: {
  messages: Messages;
  onOpenSettings: () => void;
  onOpenStart: () => void;
}) {
  return (
    <main className="home-shell">
      <section className="hero-panel">
        <div className="hero-topline">
          <div>
            <p className="eyebrow">{messages.heroEyebrow}</p>
            <h1>{messages.appTitle}</h1>
          </div>
          <div className="version-pill">
            <span>{messages.versionLabel}</span>
            <strong>{VERSION}</strong>
          </div>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <h2>{messages.heroTitle}</h2>
            <p>{messages.heroDescription}</p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={onOpenStart}>
                {messages.startButton}
              </button>
              <button className="secondary-button" type="button" onClick={onOpenSettings}>
                {messages.settingsButton}
              </button>
            </div>
          </div>

          <div className="hero-preview">
            <div className="preview-card preview-card-main">
              <span>{messages.featureLabelFace}</span>
              <strong>{messages.featureCards[0]}</strong>
            </div>
            <div className="preview-card preview-card-sub">
              <span>{messages.featureLabelStyle}</span>
              <strong>{messages.featureCards[1]}</strong>
            </div>
            <div className="preview-card preview-card-sub">
              <span>{messages.featureLabelSeries}</span>
              <strong>{messages.featureCards[2]}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="status-strip">
        <div className="status-card">
          <p className="section-label">{messages.statusTitle}</p>
          <p>{messages.statusDescription}</p>
        </div>
        <div className="status-card note-card">
          <p className="section-label">Local First</p>
          <p>{messages.localOnlyNote}</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>{messages.footerNote}</p>
      </footer>
    </main>
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
      <header className="feature-header">
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
        <div className="feature-intro-card">
          <p className="eyebrow">{messages.appTitle}</p>
          <h2>{details.title}</h2>
          <p>{details.description}</p>
          <div className="language-badge">{language.toUpperCase()}</div>
        </div>

        <div className="feature-layout-card">
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
        <article className="info-panel">
          <h3>{messages.preparedModules}</h3>
          <ul>
            <li>{messages.placeholderCanvas}</li>
            <li>{messages.placeholderSettings}</li>
            <li>{messages.moduleStorage}</li>
          </ul>
        </article>

        <article className="info-panel">
          <h3>{messages.placeholderTodo}</h3>
          <ul>
            <li>{messages.placeholderPipeline}</li>
            <li>{details.todoOne}</li>
            <li>{details.todoTwo}</li>
          </ul>
        </article>
      </section>

      <p className="feature-hint">{messages.placeholderHint}</p>
    </main>
  );
}

function StartModal({
  step,
  messages,
  onClose,
  onBack,
  onOpenSeries,
  onSelect,
}: {
  step: Exclude<StartModalStep, null>;
  messages: Messages;
  onClose: () => void;
  onBack: () => void;
  onOpenSeries: () => void;
  onSelect: (screen: Exclude<FeatureScreen, 'home'>) => void;
}) {
  const isSeriesStep = step === 'series';
  const title = isSeriesStep ? messages.startModalSeriesTitle : messages.startModalTitle;
  const description = isSeriesStep ? messages.startModalSeriesDescription : messages.startModalDescription;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-card action-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="eyebrow">{messages.appTitle}</p>
        <h2>{title}</h2>
        <p className="modal-description">{description}</p>

        <div className="action-grid">
          {!isSeriesStep ? (
            <>
              <button className="action-tile" type="button" onClick={() => onSelect('face-maker')}>
                <span>01</span>
                <strong>{messages.actionFace}</strong>
              </button>
              <button className="action-tile" type="button" onClick={() => onSelect('style-transfer')}>
                <span>02</span>
                <strong>{messages.actionStyle}</strong>
              </button>
              <button className="action-tile" type="button" onClick={onOpenSeries}>
                <span>03</span>
                <strong>{messages.actionSeries}</strong>
              </button>
            </>
          ) : (
            <>
              <button className="action-tile" type="button" onClick={() => onSelect('prompt-suite')}>
                <span>03-A</span>
                <strong>{messages.actionPromptSuite}</strong>
              </button>
              <button className="action-tile" type="button" onClick={() => onSelect('paper2gal')}>
                <span>03-B</span>
                <strong>{messages.actionPaper2Gal}</strong>
              </button>
            </>
          )}
        </div>

        {isSeriesStep && (
          <button className="back-link" type="button" onClick={onBack}>
            {messages.actionBack}
          </button>
        )}
      </section>
    </div>
  );
}

function SettingsModal({
  messages,
  settings,
  onClose,
  onUpdate,
}: {
  messages: Messages;
  settings: SettingsState;
  onClose: () => void;
  onUpdate: (patch: Partial<SettingsState>) => void;
}) {
  const [tab, setTab] = useState<SettingsTab>('style');
  const styleLocked = settings.stylePreset === 'paper2gal';
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

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-card settings-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
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
                        {item.label[settings.language]}
                      </button>
                    ))}
                  </div>
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
                      {item.label[settings.language]}
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

                <section className="settings-section tip-section">
                  <h3>{messages.apiEffectiveTitle}</h3>
                  <p className="muted-copy">{effectiveEndpoint}</p>
                  <p>{settings.interfaceMode === 'custom' ? messages.apiEffectiveCustom : messages.apiEffectiveBuiltin}</p>
                  <p className="tiny-copy">{messages.apiPrivacy}</p>
                </section>
              </>
            )}

            {tab === 'announcement' && (
              <section className="settings-section">
                <h3>{messages.announcementTitle}</h3>
                <p>{messages.announcementDescription}</p>
                <div className="announcement-card">
                  <strong>{VERSION}</strong>
                  <ul>
                    <li>{messages.announcementList1}</li>
                    <li>{messages.announcementList2}</li>
                    <li>{messages.announcementList3}</li>
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
        todoTwo: '补随机生成、重置和导出 PNG',
      };
    case 'style-transfer':
      return {
        title: messages.pageStyleTitle,
        description: messages.pageStyleDescription,
        workspaceTitle: 'Input / Output Preview',
        panelTitle: 'Model / Prompt / Seed',
        pipelineTitle: 'Queue / History',
        todoOne: '补输入图片、模型选择和参数面板',
        todoTwo: '补任务状态、结果预览和下载',
      };
    case 'prompt-suite':
      return {
        title: messages.pagePromptTitle,
        description: messages.pagePromptDescription,
        workspaceTitle: 'Prompt Workspace',
        panelTitle: 'LLM / TTS Config',
        pipelineTitle: 'Generated Assets',
        todoOne: '补角色资料输入、Prompt 模板和导出',
        todoTwo: '补 LLM/TTS 服务封装与本地保存',
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
