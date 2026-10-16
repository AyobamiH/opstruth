export interface AnalyticsEngineDataset {
  writeDataPoint(point: { indexes?: string[]; blobs?: string[]; doubles?: number[] }): void;
}
export const MACHINE_DISCOVERY_PATHS: readonly string[];
export function isMachineDiscoveryPath(pathname: string): boolean;
export function classifyAgentCrawler(userAgent: string): string | null;
export function crawlerPathGroup(pathname: string): string;
export function crawlerTelemetryPoint(
  request: Request,
  status: number,
): {
  crawler: string;
  productSurface: string;
  pageGroup: string;
  method: string;
  status: number;
} | null;
export function recordAgentCrawler(
  request: Request,
  status: number,
  dataset?: AnalyticsEngineDataset,
): boolean;
