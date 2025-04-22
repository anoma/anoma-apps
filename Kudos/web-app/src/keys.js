import * as ed from "@noble/ed25519";

/**
 * Currently only implemented for ed25519 keys, but could be refactored
 * to support Secp256k1 as well
 */
class Key {
  constructor(bytes) {
    this.bytes = bytes;
  }

  toHex() {
    return ed.etc.bytesToHex(this.bytes);
  }

  bytes() {
    return this.bytes;
  }

  static fromHex(hexKey) {
    return new Key(ed.etc.hexToBytes(hexKey));
  }
}

class Keypair {
  constructor(alias, privateKey, publicKey, algorithm = "ed25519") {
    this.alias = alias;
    this.privateKey = new Key(privateKey);
    this.publicKey = new Key(publicKey);
    this.algorithm = algorithm;
  }

  get values() {
    return {
      alias: this.alias,
      algorithm: this.algorithm,
      privateKey: this.privateKey.toHex(),
      publicKey: this.publicKey.toHex(),
    };
  }

  get raw() {
    return {
      alias: this.alias,
      algorithm: this.algorithm,
      privateKey: this.privateKey.bytes(),
      publicKey: this.publicKey.bytes(),
    };
  }

  static fromStoredKeypair(keypairRecord) {
    const { alias, algorithm, privateKey, publicKey } = keypairRecord;
    return new Keypair(
      alias,
      ed.etc.hexToBytes(privateKey),
      ed.etc.hexToBytes(publicKey),
      algorithm,
    );
  }

  static async genEd25519Keypair(alias) {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKey = await ed.getPublicKeyAsync(privateKey);

    return new Keypair(alias, privateKey, publicKey, "ed25519");
  }
}

export { Key, Keypair };
