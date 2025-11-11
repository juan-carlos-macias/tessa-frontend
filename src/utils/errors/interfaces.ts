
export enum ErrorSource {
    Firebase = "firebase",
    Network = "network",
    Backend = "backend",
    Unknown = "unknown",
}

export type NormalizedError = {
    message: string;
    code?: string;
    source: ErrorSource;
    raw?: unknown;
};