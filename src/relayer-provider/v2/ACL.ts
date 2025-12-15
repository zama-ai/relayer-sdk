// import { ethers } from "ethers"
// import { ChecksummedAddress, isChecksummedAddress } from '../../utils/address';

// export class ACL {
//   private _aclAddress: ChecksummedAddress;
//   constructor(aclAddress: ChecksummedAddress) {
//     if (!isChecksummedAddress) {
//       throw new Rel();
//     }
//     this._aclAddress = aclAddress;
//   }
//   public aa() {
//     const acl = new ethers.Contract(aclContractAddress, aclABI, provider);

//     let handles: `0x${string}`[];
//     try {
//       handles = await Promise.all(
//         _handles.map(async (_handle) => {
//           const handle =
//             typeof _handle === 'string'
//               ? toHexString(fromHexString(_handle), true)
//               : toHexString(_handle, true);

//           const isAllowedForDecryption =
//             await acl.isAllowedForDecryption(handle);
//           if (!isAllowedForDecryption) {
//             throw new Error(
//               `Handle ${handle} is not allowed for public decryption!`,
//             );
//           }
//           return handle;
//         }),
//       );
//     } catch (e) {
//       throw e;
//     }
//   }
// }
