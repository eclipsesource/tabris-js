import {contentView, crypto, Stack, tabris, TextView} from 'tabris';

const stack = Stack({stretch: true, spacing: 8, padding: 16, alignment: 'stretchX'})
  .appendTo(contentView);
tabris.onLog(({message}) => stack.append(TextView({text: message})));

(async function() {
  await signAndVerify();
  await signAndVerify({inTee: true, usageRequiresAuth: true});
}()).catch(console.error);

async function signAndVerify({inTee, usageRequiresAuth} = {inTee: false, usageRequiresAuth: false}) {
  console.log('ECDSA signing/verification with generated keys:');
  const generationAlgorithm = {name: 'ECDSA' as const, namedCurve: 'P-256' as const};
  const signingAlgorithm = {name: 'ECDSAinDERFormat' as const, hash: 'SHA-256' as const};

  // Generate a key pair for signing and verifying
  const keyPair = await crypto.subtle.generateKey(
    generationAlgorithm,
    true,
    ['sign', 'verify'],
    {inTee, usageRequiresAuth}
  );

  let privateKeyImportedFromTee: CryptoKey;
  if (inTee) {
    // Export the private key and import it back
    const privateKeyHandle = await crypto.subtle.exportKey('teeKeyHandle', keyPair.privateKey);
    const alg = {name: 'ECDSA' as const, namedCurve: 'P-256' as const};
    privateKeyImportedFromTee = await crypto.subtle.importKey('teeKeyHandle', privateKeyHandle, alg, true, ['sign']);
  }

  // Export the public key and import it back
  const publicKeySpki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKey = await crypto.subtle.importKey('spki', publicKeySpki, generationAlgorithm, true, ['verify']);

  // Sign a message
  const message = await new Blob(['Message']).arrayBuffer();
  const privateKey = inTee ? privateKeyImportedFromTee : keyPair.privateKey;
  const signature = await crypto.subtle.sign(signingAlgorithm, privateKey, message);
  console.log('Signature:', new Uint8Array(signature).join(', '));

  // Verify the signature
  const isValid = await crypto.subtle.verify(signingAlgorithm, publicKey, signature, message);
  console.log('Signature valid:', isValid);
}
