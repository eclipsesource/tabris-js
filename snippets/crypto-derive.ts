import {contentView,  crypto,  Stack,  tabris,  TextView} from 'tabris';

const stack = Stack({stretch: true,  spacing: 8,  padding: 16,  alignment: 'stretchX'})
  .appendTo(contentView);

tabris.onLog(({message}) => stack.append(TextView({text: message})));

(async () => {
  await importAndDerive();
  await generateDeriveEncryptAndDecrypt();
  await generateDeriveEncryptAndDecrypt({extractable: false, usageRequiresAuth: true});
})().catch(console.error);

async function importAndDerive() {
  const publicKeyBuffer = Uint8Array.of(
    48, 89, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2,
    1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 3,
    66, 0, 4, 134, 199, 161, 156, 179, 227, 155,  15, 133,
    227, 222, 47, 30, 76, 165, 40, 29, 216, 107, 117, 178,
    26, 178, 207, 242, 252, 229, 190, 71, 7, 128, 1, 76,
    15, 64, 178, 122, 247, 184, 175, 158, 85, 164, 244, 128,
    214, 164, 254, 146, 82, 25, 208, 196, 127, 28, 100, 235,
    120, 151, 11, 72, 140, 21, 106
  ).buffer;

  const privateKeyBuffer = Uint8Array.of(
    48, 129, 135, 2, 1, 0, 48, 19, 6, 7, 42, 134, 72, 206, 61,
    2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 4, 109, 48,
    107, 2, 1, 1, 4, 32, 133, 137, 11, 183, 95, 2, 71, 109,
    190, 162, 190, 129, 219, 229, 186, 236, 210, 248, 43, 126,
    19, 96, 141, 45, 232, 175, 231, 241, 203, 246, 92, 247,
    161, 68, 3, 66, 0, 4, 4, 6, 115, 125, 30, 72, 175, 253,
    144, 173, 126, 73, 13, 132, 117, 206, 113, 147, 78, 54,
    75, 205, 216, 209, 122, 88, 59, 246, 133, 109, 242, 254,
    78, 193, 218, 244, 8, 156, 133, 211, 83, 248, 207, 170,
    243, 114, 104, 32, 189, 128, 22, 32, 131, 13, 158, 198,
    61, 235, 214, 20, 77, 212, 105, 215
  ).buffer;

  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    {name: 'ECDH', namedCurve: 'P-256'},
    true,
    ['deriveBits']
  );

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {name: 'ECDH', namedCurve: 'P-256'},
    true,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits({
    name: 'ECDH',
    namedCurve: 'P-256',
    public: publicKey
  }, privateKey, 32 * 8);

  const array = (...args) => Uint8Array.of(...args);
  const join = (buffer) => new Uint8Array(buffer).join(',');

  test(
    'derivedBits 32B',
    new Uint8Array(derivedBits).join(','),
    '166,22,48,44,117,33,168,10,7,145,80,199,88,120,255,212,149,236,208,141,219,253,40,138,110,253,75,70,107,64,161,251'
  );

  test(
    'HKDF, with salt, 16bits',
    join(await hkdf(derivedBits, array(1, 2, 3, 4, 5, 6, 7, 8), array(), 16)),
    '63,36,169,96,129,224,201,181,157,153,102,105,56,237,200,69'
  );

  test(
    'HKDF, with salt, 24bits',
    join(await hkdf(derivedBits, array(1, 2, 3, 4, 5, 6, 7, 8), array(), 24)),
    '63,36,169,96,129,224,201,181,157,153,102,105,56,237,200,69,213,85,29,70,192,189,0,227'
  );

  test(
    'HKDF, with sharedInfo, 32bits',
    join(await hkdf(derivedBits, array(), array(1, 2, 3, 4, 5, 6, 7, 8), 32)),
    '0,147,183,24,64,253,116,152,97,0,229,224,226,244,168,128,1,206,100,137,193,34,190,14,160,146,138,8,217,140,50,90'
  );

  test(
    'HKDF, with salt and sharedInfo, 32bits',
    join(await hkdf(derivedBits, array(1, 2, 3, 4, 5, 6, 7, 8), array(9, 10, 11, 12, 13, 14, 15, 16), 32)),
    '98,141,103,102,105,62,155,153,201,202,88,215,221,51,'
    + '147,32,135,98,102,83,240,211,90,150,11,207,104,80,242,179,213,145'
  );

  async function hkdf(bits, salt, info, size) {
    const hkdfKey = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveBits']);
    return await crypto.subtle.deriveBits(
      {name: 'HKDF', hash: 'SHA-256', salt, info},
      hkdfKey,
      size * 8
    );
  }
}

async function generateDeriveEncryptAndDecrypt({extractable, usageRequiresAuth} = {
  extractable: true,
  usageRequiresAuth: false
}) {
  const ecdhP256 = {name: 'ECDH' as const, namedCurve: 'P-256' as const};
  const aesGcm = {name: 'AES-GCM' as const};

  // Generate Alice's ECDH key pair
  const alicesKeyPair = await crypto.subtle.generateKey(ecdhP256, true, ['deriveBits']);

  // Generate Bob's ECDH key pair
  const bobsKeyPair = await crypto.subtle.generateKey(ecdhP256, extractable, ['deriveBits'], {usageRequiresAuth});

  // Derive Alice's AES key
  const alicesAesKey = await deriveAesKey(bobsKeyPair.publicKey, alicesKeyPair.privateKey, 'encrypt');

  // Derive Bob's AES key
  const bobsAesKey = await deriveAesKey(alicesKeyPair.publicKey, bobsKeyPair.privateKey, 'decrypt');

  // Encrypt a message with Alice's AES key
  const message = await new Blob(['Message']).arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({...aesGcm, iv}, alicesAesKey, message);

  // Decrypt Alice's ciphertext with Bob's AES key
  const plaintext = await crypto.subtle.decrypt({...aesGcm, iv}, bobsAesKey, ciphertext);

  test('decrypted plaintext', byteArrayToString(plaintext), 'Message');

  async function deriveAesKey(publicKey: CryptoKey, privateKey: CryptoKey, usage: 'encrypt' | 'decrypt') {
    const derivedBits = await crypto.subtle.deriveBits({public: publicKey, ...ecdhP256}, privateKey, 256);
    return await crypto.subtle.importKey('raw', derivedBits, aesGcm, true, [usage]);
  }
}

function byteArrayToString(ab: ArrayBuffer) {
  return String.fromCharCode.apply(null, new Uint8Array(ab));
}

function test(name, actual, expected) {
  console.log(name, expected === actual ? 'OK' : `expected: ${expected}, actual: ${actual}`);
}
