import { ErrorBase } from "./ErrorBase.js";
////////////////////////////////////////////////////////////////////////////////
export class InternalError extends ErrorBase {
    constructor(params) {
        super({
            ...params,
            name: "InternalError",
            message: params.message ?? "internal error",
        });
    }
}
////////////////////////////////////////////////////////////////////////////////
export function assert(condition, message) {
    if (!condition) {
        throw new InternalError({ message: message ?? "Assertion failed" });
    }
}
//# sourceMappingURL=InternalError.js.map