/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorSource, NormalizedError } from "./interfaces";
import FIREBASE_ERRORS from "./messages/firebase";

export function handleError(error: any): NormalizedError {
    if (error?.code?.startsWith("auth/")) {
      return {
        message: FIREBASE_ERRORS[error.code] || "Error de autenticación.",
        code: error.code,
        source: ErrorSource.Firebase,
        raw: error,
      };
    }
  
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        message: "Error de conexión. Intenta más tarde.",
        source: ErrorSource.Network,
        raw: error,
      };
    }
  
    if (error?.error?.message) {
      return {
        message: error.error.message,
        code: error.error.code,
        source: ErrorSource.Backend,
        raw: error,
      };
    }
  
    return {
      message: "Algo salió mal. Intenta más tarde.",
      source: ErrorSource.Unknown,
      raw: error,
    };
}
  