import {contentView, crypto, Stack, tabris, TextView} from 'tabris';

const stack = Stack({stretch: true, spacing: 8, padding: 16, alignment: 'stretchX'})
  .appendTo(contentView);
tabris.onLog(({message}) => stack.append(TextView({text: message})));

(async function() {
  await signAndVerify();
  await signAndVerifyWithKeysInTeeRequiringAuth();
}()).catch(console.error);

async function signAndVerify() {
  console.log('ECDSA signing/verification with generated keys:');
  const generationAlgorithm = {name: 'ECDSA' as const, namedCurve: 'P-256' as const};
  const signingAlgorithm = {name: 'ECDSAinDERFormat' as const, hash: 'SHA-256' as const};

  // Generate a key pair for signing and verifying
  const keyPair = await crypto.subtle.generateKey(generationAlgorithm, true, ['sign', 'verify']);

  // Export the public key and import it back
  const publicKeySpki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKey = await crypto.subtle.importKey('spki', publicKeySpki, generationAlgorithm, true, ['verify']);

  // Sign a message
  const message = await new Blob(['Message']).arrayBuffer();
  const signature = await crypto.subtle.sign(signingAlgorithm, keyPair.privateKey, message);
  console.log('Signature:', new Uint8Array(signature).join(', '));

  // Verify the signature
  const isValid = await crypto.subtle.verify(signingAlgorithm, publicKey, signature, message);
  console.log('Signature valid:', isValid);
}

async function signAndVerifyWithKeysInTeeRequiringAuth() {
  console.log('ECDSA signing/verification with keys generated in a trusted execution environment (TEE):');
  const generationAlgorithm = {name: 'ECDSA' as const, namedCurve: 'P-256' as const};
  const signingAlgorithm = {name: 'ECDSAinDERFormat' as const, hash: 'SHA-256' as const};

  // Generate a key pair for signing and verifying
  const keyPair = await crypto.subtle.generateKey(
    generationAlgorithm,
    true,
    ['sign', 'verify'],
    {inTee: true, usageRequiresAuth: true}
  );

  // Export the private key and import it back
  const privateKeyHandle = await crypto.subtle.exportKey('teeKeyHandle', keyPair.privateKey);
  const algorithm = {name: 'ECDSA' as const, namedCurve: 'P-256' as const};
  const privateKey = await crypto.subtle.importKey('teeKeyHandle', privateKeyHandle, algorithm, true, ['sign']);

  // Export the public key and import it back
  const publicKeySpki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKey = await crypto.subtle.importKey('spki', publicKeySpki, algorithm, true, ['verify']);

  // Sign a message
  const message = await new Blob(['Message']).arrayBuffer();
  const signature = await crypto.subtle.sign(signingAlgorithm, privateKey, message);
  console.log('Signature:', new Uint8Array(signature).join(', '));

  // Verify the signature
  const isValid = await crypto.subtle.verify(signingAlgorithm, publicKey, signature, message);
  console.log('Signature valid:', isValid);
}
