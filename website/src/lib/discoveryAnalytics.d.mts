export type DiscoveryAnalyticsBinding = {
  writeDataPoint(point: { indexes?: string[]; blobs?: string[]; doubles?: number[] }): void;
};
export type DiscoveryEnv = {
  DISCOVERY_ANALYTICS?: DiscoveryAnalyticsBinding;
  ASSETS?: { fetch(request: Request): Promise<Response> };
};
export function isMachineDiscoveryPath(path: string): boolean;
export function recordDiscovery(request: Request, status: number, env: DiscoveryEnv): void;
