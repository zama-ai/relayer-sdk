class TypedPlaintextMock {
  private constructor() {
    this.bytes = new Uint8Array();
    this.fhe_type = 0;
  }
  free(): void {}
  bytes: Uint8Array;
  fhe_type: number;
}

class ServerIdAddrMock {
  private _id: number;
  private _addr: string;
  private constructor() {
    this._id = 0;
    this._addr = '';
  }
  free(): void {}
  static new_server_id_addr(id: number, addr: string): ServerIdAddrMock {
    const s = new ServerIdAddrMock();
    s._id = id;
    s._addr = addr;
    return s;
  }
  get mock_id() {
    return this._id;
  }
  get mock_addr() {
    return this._addr;
  }
}

class ClientMock {
  private _server_addrs: ServerIdAddrMock[];
  private _client_address_hex: string;
  private _fhe_parameter: string;
  private constructor() {
    this._server_addrs = [];
    this._client_address_hex = '';
    this._fhe_parameter = '';
  }
  free(): void {}
  static new_client(
    server_addrs: ServerIdAddrMock[],
    client_address_hex: string,
    fhe_parameter: string,
  ): ClientMock {
    const c = new ClientMock();
    c._server_addrs = server_addrs;
    c._client_address_hex = client_address_hex;
    c._fhe_parameter = fhe_parameter;
    return c;
  }
  get mock_server_addrs() {
    return this._server_addrs;
  }
  get mock_client_address_hex() {
    return this._client_address_hex;
  }
  get mock_fhe_parameter() {
    return this._fhe_parameter;
  }
}

class PublicEncKeyMlKem512Mock {
  private _data: Uint8Array;
  private constructor() {
    this._data = new Uint8Array();
  }
  free(): void {}
  static u8vec_to_ml_kem_pke_pk(v: Uint8Array): PublicEncKeyMlKem512Mock {
    const a = new PublicEncKeyMlKem512Mock();
    a._data = v;
    return a;
  }
  static ml_kem_pke_get_pk(
    sk: PrivateEncKeyMlKem512Mock,
  ): PublicEncKeyMlKem512Mock {
    const a = new PublicEncKeyMlKem512Mock();
    a._data = new Uint8Array();
    return a;
  }
  mock_to_u8vec(): Uint8Array {
    return this._data;
  }
}

class PrivateEncKeyMlKem512Mock {
  private _data: Uint8Array;
  private constructor() {
    this._data = new Uint8Array();
  }
  free(): void {}
  static u8vec_to_ml_kem_pke_sk(v: Uint8Array): PrivateEncKeyMlKem512Mock {
    const a = new PrivateEncKeyMlKem512Mock();
    a._data = v;
    return a;
  }
  static ml_kem_pke_keygen(): PrivateEncKeyMlKem512Mock {
    const a = new PrivateEncKeyMlKem512Mock();
    a._data = new Uint8Array();
    return a;
  }
  mock_to_u8vec(): Uint8Array {
    return this._data;
  }
}

/*
import * as TFHEPkg from 'node-tfhe';
import * as TKMSPkg from 'node-tkms';

global.TFHE = TFHEPkg;
global.TKMS = TKMSPkg;
*/

//   pubKey = TKMS.u8vec_to_ml_kem_pke_pk(fromHexString(publicKey));
//   privKey = TKMS.u8vec_to_ml_kem_pke_sk(fromHexString(privateKey));
//   return TKMS.new_server_id_addr(index + 1, signer);

// const client = TKMS.new_client(indexedKmsSigners, userAddress, 'default');
//   const decryption = TKMS.process_user_decryption_resp_from_js(
//     client,
//     payloadForVerification,
//     eip712Domain,
//     json.response,
//     pubKey,
//     privKey,
//     true,
//   );
//   const keypair = TKMS.ml_kem_pke_keygen();
//   return {
//     publicKey: bytesToHexNo0x(
//       TKMS.ml_kem_pke_pk_to_u8vec(TKMS.ml_kem_pke_get_pk(keypair)),
//     ),
//     privateKey: bytesToHexNo0x(TKMS.ml_kem_pke_sk_to_u8vec(keypair)),

export function u8vec_to_ml_kem_pke_pk(
  v: Uint8Array,
): PublicEncKeyMlKem512Mock {
  return PublicEncKeyMlKem512Mock.u8vec_to_ml_kem_pke_pk(v);
}

export function u8vec_to_ml_kem_pke_sk(
  v: Uint8Array,
): PrivateEncKeyMlKem512Mock {
  return PrivateEncKeyMlKem512Mock.u8vec_to_ml_kem_pke_sk(v);
}

export function new_client(
  server_addrs: ServerIdAddrMock[],
  client_address_hex: string,
  fhe_parameter: string,
): ClientMock {
  return ClientMock.new_client(server_addrs, client_address_hex, fhe_parameter);
}

export function process_user_decryption_resp_from_js(
  client: ClientMock,
  request: any,
  eip712_domain: any,
  agg_resp: any,
  enc_pk: PublicEncKeyMlKem512Mock,
  enc_sk: PrivateEncKeyMlKem512Mock,
  verify: boolean,
): TypedPlaintextMock[] {
  return [];
}

export function ml_kem_pke_keygen(): PrivateEncKeyMlKem512Mock {
  return PrivateEncKeyMlKem512Mock.ml_kem_pke_keygen();
}

export function ml_kem_pke_get_pk(
  sk: PrivateEncKeyMlKem512Mock,
): PublicEncKeyMlKem512Mock {
  return PublicEncKeyMlKem512Mock.ml_kem_pke_get_pk(sk);
}

export function ml_kem_pke_sk_to_u8vec(
  sk: PrivateEncKeyMlKem512Mock,
): Uint8Array {
  return sk.mock_to_u8vec();
}

export function new_server_id_addr(id: number, addr: string): ServerIdAddrMock {
  return ServerIdAddrMock.new_server_id_addr(id, addr);
}

export function ml_kem_pke_pk_to_u8vec(
  pk: PublicEncKeyMlKem512Mock,
): Uint8Array {
  return pk.mock_to_u8vec();
}
