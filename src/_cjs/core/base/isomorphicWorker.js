"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrowserLike = isBrowserLike;
exports.getIsomorphicTarget = getIsomorphicTarget;
exports.createIsomorphicWorker = createIsomorphicWorker;
exports.createIsomorphicWorkerFromCode = createIsomorphicWorkerFromCode;
exports.runCodeInIsomorphicWorker = runCodeInIsomorphicWorker;
exports.isBlobWorkerSupported = isBlobWorkerSupported;
exports.waitForMsgType = waitForMsgType;
function isNodePort(target) {
    return typeof target.on === "function";
}
function isBrowserLike() {
    return (typeof addEventListener === "function" &&
        typeof removeEventListener === "function");
}
async function getIsomorphicTarget() {
    if (isBrowserLike())
        return self;
    const nodeWorkerModuleName = "worker_threads";
    const nodeWorkerModuleId = `node:${nodeWorkerModuleName}`;
    const { parentPort: nodeParentPort } = (await Promise.resolve(`${nodeWorkerModuleId}`).then(s => require(s)));
    if (!nodeParentPort) {
        throw new Error("Not running inside a worker thread");
    }
    return nodeParentPort;
}
async function createIsomorphicWorker(url) {
    if (isBrowserLike()) {
        return createBrowserLikeWorker(url);
    }
    return createNodeLikeWorker(url);
}
async function createIsomorphicWorkerFromCode(jsCode) {
    if (isBrowserLike()) {
        const blob = new Blob([jsCode], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);
        try {
            const browserWorker = new Worker(blobUrl);
            return browserWorker;
        }
        finally {
            URL.revokeObjectURL(blobUrl);
        }
    }
    const nodeWorkerModuleName = "worker_threads";
    const nodeWorkerModuleId = `node:${nodeWorkerModuleName}`;
    const { Worker: NodeWorker } = (await Promise.resolve(`${nodeWorkerModuleId}`).then(s => require(s)));
    return new NodeWorker(jsCode, { eval: true });
}
async function runCodeInIsomorphicWorker(code, input, timeoutMs = 30_000) {
    const browserCode = `
    self.onmessage = async ({ data }) => {
      try {
        const result = await (async (data) => { ${code} })(data);
        self.postMessage({ result });
      } catch (e) {
        self.postMessage({ error: String(e) });
      }
    };
  `;
    const nodeCode = `
    const { parentPort } = require("worker_threads");
    parentPort.on("message", async (data) => {
      try {
        const result = await (async (data) => { ${code} })(data);
        parentPort.postMessage({ result });
      } catch (e) {
        parentPort.postMessage({ error: String(e) });
      }
    });
  `;
    const workerCode = isBrowserLike() ? browserCode : nodeCode;
    const worker = await createIsomorphicWorkerFromCode(workerCode);
    return new Promise((resolve, reject) => {
        let settled = false;
        const cleanup = () => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timer);
            try {
                worker.terminate();
            }
            catch (_) {
            }
        };
        const fail = (e) => {
            cleanup();
            reject(e instanceof Error ? e : new Error(String(e)));
        };
        const handle = (msg) => {
            cleanup();
            if (msg.error !== undefined) {
                reject(new Error(typeof msg.error === "string"
                    ? msg.error
                    : JSON.stringify(msg.error)));
            }
            else {
                resolve(msg.result);
            }
        };
        const timer = setTimeout(() => {
            if (!settled)
                fail(new Error(`Worker timed out after ${String(timeoutMs)}ms`));
        }, timeoutMs);
        if ("on" in worker) {
            worker.on("message", (data) => {
                handle(data);
            });
            worker.on("error", (e) => {
                fail(e);
            });
            worker.on("exit", (exitCode) => {
                if (!settled)
                    fail(new Error(`Worker exited with code ${String(exitCode)}`));
            });
            worker.postMessage(input);
        }
        else {
            worker.onmessage = ({ data }) => {
                handle(data);
            };
            worker.onerror = (e) => {
                fail(new Error(e.message));
            };
            worker.postMessage(input);
        }
    });
}
let _blobWorkerSupportedPromise;
function isBlobWorkerSupported() {
    _blobWorkerSupportedPromise ??= runCodeInIsomorphicWorker(`return data + " world!";`, "hello", 5000).then((res) => res === "hello world!", () => false);
    return _blobWorkerSupportedPromise;
}
function createBrowserLikeWorker(url) {
    return new Worker(url, {
        type: "module",
        name: "wasm_bindgen_worker",
    });
}
async function createNodeLikeWorker(url) {
    const nodeWorkerModuleName = "worker_threads";
    const nodeWorkerModuleId = `node:${nodeWorkerModuleName}`;
    const { Worker: NodeWorker } = (await Promise.resolve(`${nodeWorkerModuleId}`).then(s => require(s)));
    if (url.startsWith("data:")) {
        const base64 = url.split(",")[1];
        if (base64 === undefined) {
            throw new Error("Invalid data url");
        }
        const nodeBufferModuleName = "buffer";
        const nodeBufferModuleId = `node:${nodeBufferModuleName}`;
        const { Buffer: NodeBuffer } = (await Promise.resolve(`${nodeBufferModuleId}`).then(s => require(s)));
        const code = NodeBuffer.from(base64, "base64").toString("utf-8");
        return new NodeWorker(code, { eval: true });
    }
    return new NodeWorker(url);
}
function waitForMsgType(target, type) {
    return new Promise((resolve) => {
        if (isNodePort(target)) {
            target.on("message", function onMsg(data) {
                if (data.type !== type)
                    return;
                target.off("message", onMsg);
                resolve(data);
            });
        }
        else {
            target.addEventListener("message", function onMsg({ data }) {
                if (data.type !== type)
                    return;
                target.removeEventListener("message", onMsg);
                resolve(data);
            });
        }
    });
}
//# sourceMappingURL=isomorphicWorker.js.map