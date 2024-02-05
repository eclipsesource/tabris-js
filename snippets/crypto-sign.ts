import {contentView, crypto, Stack, tabris, TextView} from 'tabris';

const stack = Stack({stretch: true, spacing: 8, padding: 16, alignment: 'stretchX'})
  .appendTo(contentView);
tabris.onLog(({message}) => stack.append(TextView({text: message})));

(async function() {
  await signAndVerify();
  await signAndVerify({extractable: false, usageRequiresAuth: true});
}()).catch(console.error);

async function signAndVerify({extractable, usageRequiresAuth} = {extractable: true, usageRequiresAuth: false}) {
  console.log('ECDSA signing/verification with generated keys:');
  const generationAlgorithm = {name: 'ECDSA' as const, namedCurve: 'P-256' as const};
  const signingAlgorithm = {name: 'ECDSAinDERFormat' as const, hash: 'SHA-256' as const};

  // Generate a key pair for signing and verifying
  const keyPair = await crypto.subtle.generateKey(
    generationAlgorithm,
    extractable,
    ['sign', 'verify'],
    {usageRequiresAuth}
  );

  let privateKeyImportedFromTee: CryptoKey;
  if (!extractable) {
    // Export a handle of the private key stored in the Trusted Execution Environment and import it back
    const privateKeyHandle = await crypto.subtle.exportKey('raw', keyPair.privateKey);
    const alg = {name: 'ECDSA' as const, namedCurve: 'P-256' as const};
    privateKeyImportedFromTee = await crypto.subtle.importKey('raw', privateKeyHandle, alg, extractable, ['sign']);
  }

  // Export the public key and import it back
  const publicKeySpki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKey = await crypto.subtle.importKey('spki', publicKeySpki, generationAlgorithm, extractable, ['verify']);

  // Sign a message
  const message = await new Blob(['Message']).arrayBuffer();
  const privateKey = !extractable ? privateKeyImportedFromTee : keyPair.privateKey;
  const signature = await crypto.subtle.sign(signingAlgorithm, privateKey, message);
  console.log('Signature:', new Uint8Array(signature).join(', '));

  // Verify the signature
  const isValid = await crypto.subtle.verify(signingAlgorithm, publicKey, signature, message);
  console.log('Signature valid:', isValid);
}
