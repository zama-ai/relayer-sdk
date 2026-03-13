import { ErrorBase } from "./ErrorBase.js";
////////////////////////////////////////////////////////////////////////////////
// FheTypeError
////////////////////////////////////////////////////////////////////////////////
export class FheTypeError extends ErrorBase {
    constructor(params, options) {
        super({
            ...options,
            message: params.message,
            name: "FheTypeError",
        });
    }
    static throwFheTypeIdError(id, options) {
        let message;
        if (id === undefined) {
            message = "FheTypeId is invalid.";
        }
        else if (typeof id === "number") {
            message = `FheTypeId '${id}' is invalid.`;
        }
        else {
            message = `FheTypeId is invalid, got ${Object.prototype.toString.call(id)}.`;
        }
        throw new FheTypeError({
            message,
        }, options);
    }
    static throwFheTypeNameError(name, options) {
        let message;
        if (name === undefined) {
            message = "FheTypeName is invalid.";
        }
        else if (typeof name === "string") {
            message = `FheTypeName '${name}' is invalid.`;
        }
        else {
            message = `FheTypeName is invalid, got ${Object.prototype.toString.call(name)}.`;
        }
        throw new FheTypeError({
            message,
        }, options);
    }
}
//# sourceMappingURL=FheTypeError.js.map