import { NormalizedError } from "../../utils/errors/interfaces";

type SafeAsyncResult<T> = [T | null, NormalizedError | null];

export default SafeAsyncResult;