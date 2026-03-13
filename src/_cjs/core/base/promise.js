"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWithBatching = executeWithBatching;
async function executeWithBatching(factories, parallel) {
    if (parallel === true) {
        return Promise.all(factories.map((f) => f()));
    }
    const results = [];
    for (const factory of factories) {
        results.push(await factory());
    }
    return results;
}
//# sourceMappingURL=promise.js.map