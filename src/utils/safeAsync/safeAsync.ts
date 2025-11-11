/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleError } from "../../utils/errors/errorHandler";
import SafeAsyncResult from "./interfaces";

async function safeAsync<T>(promise: Promise<T>): Promise<SafeAsyncResult<T>> {
    try {
      const result = await promise;
      return [result, null];
    } catch (error: any) {
      return [null, handleError(error)];
    }
  }

export default safeAsync;