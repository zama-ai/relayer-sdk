import type { TrustedValue } from "../../base/trustedValue.js";
import type { Bytes65Hex, BytesHex, ChecksummedAddress, Uint256 } from "../../types/primitives.js";
import type { Prettify } from "../../types/utils.js";
export declare const trustedClientBrand: unique symbol;
export type TrustedClient<T = unknown> = TrustedValue<T> & {
    [trustedClientBrand]: never;
};
export type RecoverTypedDataAddressParameters = Readonly<{
    domain: {
        chainId: Uint256;
        name: string;
        verifyingContract: ChecksummedAddress;
        version: string;
    };
    types: Record<string, Array<{
        name: string;
        type: string;
    }>>;
    primaryType: string;
    message: Record<string, unknown>;
    signature: Bytes65Hex;
}>;
export type RecoverTypedDataAddressReturnType = ChecksummedAddress;
export type RecoverTypedDataAddressModuleFunction = {
    recoverTypedDataAddress(parameters: RecoverTypedDataAddressParameters): Promise<RecoverTypedDataAddressReturnType>;
};
export type EncodePackedParameters = Readonly<{
    types: readonly string[];
    values: readonly unknown[];
}>;
export type EncodePackedReturnType = BytesHex;
export type EncodePackedModuleFunction = {
    encodePacked(parameters: EncodePackedParameters): EncodePackedReturnType;
};
export type EncodeParameters = Readonly<{
    types: readonly string[];
    values: readonly unknown[];
}>;
export type EncodeReturnType = BytesHex;
export type EncodeModuleFunction = {
    encode(parameters: EncodeParameters): EncodeReturnType;
};
export type DecodeParameters = Readonly<{
    types: readonly string[];
    encodedData: BytesHex;
}>;
export type DecodeReturnType = unknown[];
export type DecodeModuleFunction = {
    decode(parameters: DecodeParameters): DecodeReturnType;
};
export type GetChainIdReturnType = bigint;
export type GetChainIdModuleFunction = {
    getChainId(hostPublicClient: TrustedClient): Promise<GetChainIdReturnType>;
};
export type ReadContractParameters = {
    readonly address: ChecksummedAddress;
    readonly functionName: string;
    readonly abi: ReadonlyArray<Record<string, unknown>>;
    readonly args: readonly unknown[];
};
export type ReadContractReturnType = unknown;
export type ReadContractModuleFunction = {
    readContract(hostPublicClient: TrustedClient, parameters: ReadContractParameters): Promise<ReadContractReturnType>;
};
export type EthereumModule = Prettify<RecoverTypedDataAddressModuleFunction & ReadContractModuleFunction & EncodeModuleFunction & EncodePackedModuleFunction & DecodeModuleFunction & GetChainIdModuleFunction>;
export type EthereumModuleFactory = () => {
    readonly ethereum: EthereumModule;
};
//# sourceMappingURL=types.d.ts.map