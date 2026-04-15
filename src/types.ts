export type StylePreset = 'default' | 'paper2gal';
export type ThemeDepth = 'light' | 'deep';
export type AccentPalette =
  | 'ocean'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'slate'
  | 'crimson'
  | 'teal'
  | 'gold'
  | 'cyan'
  | 'custom';
export type AppLanguage = 'zh' | 'ja' | 'en' | 'ru' | 'ko' | 'fr' | 'de' | 'es' | 'it' | 'pt';
export type FontPreset =
  | 'sans'
  | 'serif'
  | 'mono'
  | 'heiti'
  | 'songti'
  | 'kaiti'
  | 'georgia'
  | 'times'
  | 'verdana'
  | 'fira'
  | 'custom';
export type InterfaceMode = 'builtin' | 'custom';
export type ApiPreset = 'plato';
export type FeatureScreen = 'home' | 'face-maker' | 'style-transfer' | 'prompt-suite' | 'paper2gal';
export type SettingsTab = 'style' | 'language' | 'api' | 'announcement' | 'about';
export type StartModalStep = 'root' | null;

export interface SettingsState {
  stylePreset: StylePreset;
  depth: ThemeDepth;
  accent: AccentPalette;
  customAccentColor: string;
  contrast: number;
  language: AppLanguage;
  fontPreset: FontPreset;
  customFontFamily: string;
  interfaceMode: InterfaceMode;
  apiPreset: ApiPreset;
  apiBaseUrl: string;
  apiKey: string;
}
