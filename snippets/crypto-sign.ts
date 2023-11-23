import {contentView, crypto, Stack, tabris, TextView} from 'tabris';

const stack = Stack({stretch: true, spacing: 8, padding: 16, alignment: 'stretchX'})
  .appendTo(contentView);
tabris.onLog(({message}) => stack.append(TextView({text: message})));

(async function() {

  // Generate a key pair for signing and verifying
  const keyPair = await crypto.subtle.generateKey(
    {name: 'ECDSA', namedCurve: 'P-256'},
    true,
    ['sign', 'verify']
  );

  // Sign a message
  const message = await new Blob(['Message']).arrayBuffer();
  const signature = await crypto.subtle.sign(
    {name: 'ECDSAinDERFormat', hash: 'SHA-256'},
    keyPair.privateKey,
    message
  );
  console.log('Signature:', new Uint8Array(signature).join(', '));

  // Verify the signature
  const isValid = await crypto.subtle.verify(
    {name: 'ECDSAinDERFormat', hash: 'SHA-256'},
    keyPair.publicKey,
    signature, message
  );
  console.log('Signature valid:', isValid);

}());
