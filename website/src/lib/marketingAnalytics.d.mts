export interface MarketingAnalyticsOptions {
  measurementId: string;
  origin: string;
  paths: string[];
  pluginUrl: string;
  key: string;
  win?: Window;
  doc?: Document;
}
export function createMarketingAnalytics(options: MarketingAnalyticsOptions): {
  readConsent(): boolean;
  choose(accept: boolean): void;
  refresh(): void;
  start(): () => void;
};
