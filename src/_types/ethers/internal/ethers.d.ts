import type { Logger } from "../../core/types/logger.js";
export type CCfg = {
    readonly singleThread?: boolean;
    readonly numberOfThreads?: number;
    readonly locateFile?: (file: string) => URL;
    readonly logger?: Logger;
};
//# sourceMappingURL=ethers.d.ts.map