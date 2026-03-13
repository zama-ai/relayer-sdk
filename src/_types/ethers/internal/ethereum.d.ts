import type { DecodeParameters, DecodeReturnType, EncodePackedParameters, EncodePackedReturnType, EncodeParameters, EncodeReturnType, EthereumModuleFactory, GetChainIdReturnType, TrustedClient, ReadContractParameters, RecoverTypedDataAddressParameters, RecoverTypedDataAddressReturnType } from "../../core/modules/ethereum/types.js";
import type { ethers as EthersT } from "ethers";
export declare function recoverTypedDataAddress(parameters: RecoverTypedDataAddressParameters): Promise<RecoverTypedDataAddressReturnType>;
export declare function encodePacked(parameters: EncodePackedParameters): EncodePackedReturnType;
export declare function encode(parameters: EncodeParameters): EncodeReturnType;
export declare function decode(parameters: DecodeParameters): DecodeReturnType;
export declare function readContract(hostPublicClient: TrustedClient<EthersT.ContractRunner>, parameters: ReadContractParameters): Promise<unknown>;
export declare function getChainId<T extends EthersT.ContractRunner>(hostPublicClient: TrustedClient<T>): Promise<GetChainIdReturnType>;
export declare const ethereumModule: EthereumModuleFactory;
//# sourceMappingURL=ethereum.d.ts.map