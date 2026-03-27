import type { Fhevm, OptionalNativeClient } from "../types/coreFhevmClient.js";
import { bytesToHexLarge, hexToBytesFaster } from "../base/bytes.js";
import type { ErrorMetadataParams } from "../base/errors/ErrorBase.js";
import { InvalidTypeError } from "../base/errors/InvalidTypeError.js";
import type {
  DecryptAndReconstructUserModuleFunction,
  DecryptAndReconstructUserParameters,
  GetTkmsPublicKeyHexUserModuleFunction,
  WithDecryptModule,
} from "../modules/decrypt/types.js";
import type { FhevmRuntime, WithDecrypt } from "../types/coreFhevmRuntime.js";
import type { Bytes, BytesHex } from "../types/primitives.js";
import type { TkmsPrivateKey } from "../types/tkms-p.js";
import type { FhevmChain } from "../types/fhevmChain.js";

////////////////////////////////////////////////////////////////////////////////

/**
 * End-to-end transport key pair for encrypted communication between user and KMS.
 *
 * This key pair is used for:
 * - Creating decrypt permits (EIP-712 messages signed by the user)
 * - Decrypting FHE ciphertexts via the threshold KMS protocol
 * - Establishing secure channels for decryption results
 *
 * The key pair contains a TKMS (Threshold Key Management System) private key
 * that never leaves the user's control. Methods are bound via closures to prevent
 * key extraction.
 */
export type E2eTransportKeyPair = GetTkmsPublicKeyHexUserModuleFunction &
  DecryptAndReconstructUserModuleFunction & {
    readonly serialize: () => Promise<BytesHex>;
  };

/**
 * @deprecated Use {@link E2eTransportKeyPair} instead.
 * This alias is maintained for backward compatibility.
 */
export type FhevmDecryptionKey = E2eTransportKeyPair;

////////////////////////////////////////////////////////////////////////////////
// FhevmDecryptionKeyImpl
//
// Unexported class wrapping closures that bind a tkmsPrivateKey.
// - Class: enables instanceof checks (isFhevmDecryptionKey)
// - Closures: methods capture privateKey without exposing it
// - Frozen: instance, class, and prototype are all immutable
// - Tree-shakable: unused exports are eliminated by bundlers
// - No this pitfalls: methods are own properties, not prototype-bound

class FhevmDecryptionKeyImpl implements FhevmDecryptionKey {
  readonly decryptAndReconstruct: DecryptAndReconstructUserModuleFunction["decryptAndReconstruct"];
  readonly getTkmsPublicKeyHex: GetTkmsPublicKeyHexUserModuleFunction["getTkmsPublicKeyHex"];
  readonly serialize: () => Promise<BytesHex>;

  constructor(parameters: {
    decryptAndReconstruct: DecryptAndReconstructUserModuleFunction["decryptAndReconstruct"];
    getTkmsPublicKeyHex: GetTkmsPublicKeyHexUserModuleFunction["getTkmsPublicKeyHex"];
    serialize: () => Promise<BytesHex>;
  }) {
    this.decryptAndReconstruct = parameters.decryptAndReconstruct;
    this.getTkmsPublicKeyHex = parameters.getTkmsPublicKeyHex;
    this.serialize = parameters.serialize;
    Object.freeze(this);
  }
}

Object.freeze(FhevmDecryptionKeyImpl);
Object.freeze(FhevmDecryptionKeyImpl.prototype);

////////////////////////////////////////////////////////////////////////////////

/** Type guard: returns true if value was created by {@link createFhevmDecryptionKey}. */
export function isFhevmDecryptionKey(
  value: unknown,
): value is FhevmDecryptionKey {
  return value instanceof FhevmDecryptionKeyImpl;
}

////////////////////////////////////////////////////////////////////////////////

/** Throws {@link InvalidTypeError} if value is not a valid {@link FhevmDecryptionKey}. */
export function assertIsFhevmDecryptionKey(
  value: unknown,
  options: { subject?: string } & ErrorMetadataParams,
): asserts value is FhevmDecryptionKey {
  if (!isFhevmDecryptionKey(value)) {
    throw new InvalidTypeError(
      {
        subject: options.subject,
        type: typeof value,
        expectedType: "FhevmDecryptionKey",
      },
      options,
    );
  }
}

////////////////////////////////////////////////////////////////////////////////

/** Creates a {@link FhevmDecryptionKey} by binding a private key (raw bytes or deserialized) into closures. */
export async function createFhevmDecryptionKey(
  fhevmRuntime: FhevmRuntime<WithDecryptModule>,
  parameters: {
    tkmsPrivateKey: TkmsPrivateKey;
  },
): Promise<FhevmDecryptionKey> {
  // TkmsPrivateKey
  const tkmsPrivateKey = parameters.tkmsPrivateKey;
  // sync fn
  fhevmRuntime.decrypt.verifyTkmsPrivateKey({ tkmsPrivateKey });

  return new FhevmDecryptionKeyImpl({
    async decryptAndReconstruct(
      decryptParameters: DecryptAndReconstructUserParameters,
    ) {
      return fhevmRuntime.decrypt.decryptAndReconstruct({
        tkmsPrivateKey,
        ...decryptParameters,
      });
    },
    async getTkmsPublicKeyHex() {
      return fhevmRuntime.decrypt.getTkmsPublicKeyHex({
        tkmsPrivateKey,
      });
    },
    async serialize() {
      const pkBytes = await fhevmRuntime.decrypt.serializeTkmsPrivateKey({
        tkmsPrivateKey,
      });
      return bytesToHexLarge(pkBytes, false /* no0x */);
    },
  });
}

/** Generates a fresh {@link FhevmDecryptionKey}. */
export async function generateFhevmDecryptionKey(
  fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>,
): Promise<FhevmDecryptionKey> {
  const tkmsPrivateKey = await fhevm.runtime.decrypt.generateTkmsPrivateKey();
  return createFhevmDecryptionKey(fhevm.runtime, { tkmsPrivateKey });
}

/** Restores a {@link FhevmDecryptionKey} from serialized form (Bytes or BytesHex). */
export async function loadFhevmDecryptionKey(
  fhevm: Fhevm<FhevmChain | undefined, WithDecrypt, OptionalNativeClient>,
  parameters: {
    readonly tkmsPrivateKeyBytes: Bytes | BytesHex;
  },
): Promise<FhevmDecryptionKey> {
  let tkmsPrivateKeyBytes: Bytes;
  if (typeof parameters.tkmsPrivateKeyBytes === "string") {
    tkmsPrivateKeyBytes = hexToBytesFaster(parameters.tkmsPrivateKeyBytes, {
      strict: true,
    });
  } else {
    tkmsPrivateKeyBytes = parameters.tkmsPrivateKeyBytes;
  }

  const tkmsPrivateKey = await fhevm.runtime.decrypt.deserializeTkmsPrivateKey({
    tkmsPrivateKeyBytes,
  });

  return createFhevmDecryptionKey(fhevm.runtime, { tkmsPrivateKey });
}
