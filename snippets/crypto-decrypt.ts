import {contentView,  crypto,  Stack,  tabris,  TextView} from 'tabris';

const stack = Stack({stretch: true,  spacing: 8,  padding: 16,  alignment: 'stretchX'})
  .appendTo(contentView);
tabris.onLog(({message}) => stack.append(TextView({text: message})));

(async function() {

  {
    console.log('AES-GCM decryption with imported keys:');
    const privateKey = await importKey('pkcs8', privateKeyData());
    const publicKey = await importKey('spki', publicKeyData());
    const {decrypted} = await decryptWithAESGCM(encryptedData(),  publicKey,  privateKey);
    console.log(await new Blob([decrypted]).text());
  }

  {
    console.log('AES-GCM encryption/decryption with generated keys:');
    const message = await new Blob(['Secret message 2']).arrayBuffer();
    const secretKeys = await generateECDHKeyPair();
    const ephemeralKeys = await generateECDHKeyPair();
    const encrypted = await encryptWithAESGCM(message,  secretKeys.publicKey,  ephemeralKeys.privateKey);
    const {decrypted} = await decryptWithAESGCM(encrypted,  ephemeralKeys.publicKey,  secretKeys.privateKey);
    console.log(await new Blob([decrypted]).text());

    console.log('Public Key spki:');
    const publicKeySpki = await crypto.subtle.exportKey('spki',  ephemeralKeys.publicKey);
    console.log(new Uint8Array(publicKeySpki).join(', '));
  }

}());

async function importKey(format: 'spki' | 'pkcs8', data: ArrayBuffer) {
  return await crypto.subtle.importKey(
    format,
    data,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey']
  );
}

async function decryptWithAESGCM(
  encrypted: ArrayBuffer,
  publicKey: CryptoKey,
  privateKey: CryptoKey
) {
  const deriveSharedSecretResult = await deriveSharedSecret(publicKey,  privateKey);
  const deriveAESKeyResult = await deriveAESKey(deriveSharedSecretResult);
  return {
    decrypted: await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(12)
      },
      deriveAESKeyResult,
      encrypted
    ),
    sharedKey: deriveAESKeyResult
  };
}

async function encryptWithAESGCM(
  data: ArrayBuffer,
  publicKey: CryptoKey,
  privateKey: CryptoKey
) {
  const deriveSharedSecretResult = await deriveSharedSecret(publicKey,  privateKey);
  const deriveAESKeyResult = await deriveAESKey(deriveSharedSecretResult);
  return await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(12)
    },
    deriveAESKeyResult,
    data
  );
}

async function generateECDHKeyPair() {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    false,
    ['deriveKey']
  );
}

async function deriveAESKey(sharedSecret: CryptoKey) {
  return await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
      info: new Uint8Array([9, 0, 1, 2, 3, 4, 5, 6])
    },
    sharedSecret,
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt',  'decrypt']
  );
}

async function deriveSharedSecret(publicKey: CryptoKey,  privateKey: CryptoKey) {
  return await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
      public: publicKey
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['deriveKey', 'deriveBits']
  );
}

function publicKeyData() {
  return new Uint8Array([
    48, 89, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 3, 66, 0, 4, 38, 250,
    176, 145, 42, 65, 187, 31, 100, 234, 60, 30, 162, 107, 213, 143, 93, 51, 56, 179, 191, 178, 111, 125, 184,
    208, 97, 96, 54, 180, 178, 226, 118, 165, 30, 119, 176, 234, 11, 72, 4, 141, 190, 190, 56, 148, 176, 141, 252,
    246, 29, 22, 203, 184, 123, 15, 92, 159, 93, 27, 52, 134, 51, 88
  ]).buffer;
}

function privateKeyData() {
  return new Uint8Array([
    48, 129, 135, 2, 1, 0, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 4, 109,
    48, 107, 2, 1, 1, 4, 32, 192, 35, 31, 140, 63, 172, 141, 185, 224, 104, 5, 40, 168, 198, 86, 223, 72, 207,
    30, 192, 102, 70, 247, 78, 195, 222, 2, 31, 242, 165, 236, 229, 161, 68, 3, 66, 0, 4, 52, 107, 50, 224, 230,
    118, 167, 189, 121, 130, 167, 34, 139, 5, 194, 52, 21, 45, 144, 251, 143, 62, 146, 6, 235, 63, 104, 32, 207,
    55, 135, 11, 248, 220, 66, 231, 151, 77, 140, 171, 189, 49, 162, 77, 226, 245, 227, 89, 27, 191, 133, 71, 145,
    1, 211, 207, 191, 35, 2, 5, 75, 28, 248, 55
  ]).buffer;
}

function encryptedData() {
  return new Uint8Array([
    239, 245, 62, 37, 247, 8, 172, 72, 100, 113, 222, 127, 83, 60, 235, 132, 181, 165, 147, 254, 160, 143, 240, 107,
    16, 37, 248, 132, 14, 197, 54, 1
  ]).buffer;
}
