import {TextView, crypto, contentView, Stack, Button, Composite} from 'tabris';

const toBuffer = value => new Blob([value]).arrayBuffer();
const toHex = value => Array.prototype.map.call(
  new Uint8Array(value),
  byte => ('00' + byte.toString(16)).slice(-2)
).join('');

Stack({stretch: true, spacing: 8, padding: 16, alignment: 'stretchX', children: [

  TextView({font: '16px monospace', text: 'Press Button'}),

  Composite({stretchY: true}),

  Button({
    text: 'Random Numbers',
    onSelect() {
      const random = crypto.getRandomValues(new Uint8Array(24));
      $(TextView).only().text = toHex(random);
    }
  }),

  Button({
    text: 'SHA-1 of "Hello World"',
    async onSelect() {
      const hash = await crypto.subtle.digest('SHA-1', await toBuffer('Hello World'));
      $(TextView).only().text = toHex(hash);
    }
  }),

  Button({
    text: 'SHA-256 of "Hello World"',
    async onSelect() {
      const hash = await crypto.subtle.digest('SHA-256', await toBuffer('Hello World'));
      $(TextView).only().text = toHex(hash);
    }
  }),

  Button({
    text: 'SHA-384 of "Hello World"',
    async onSelect() {
      const hash = await crypto.subtle.digest('SHA-384', await toBuffer('Hello World'));
      $(TextView).only().text = toHex(hash);
    }
  }),

  Button({
    text: 'SHA-512 of "Hello World"',
    async onSelect() {
      const hash = await crypto.subtle.digest('SHA-512', await toBuffer('Hello World'));
      $(TextView).only().text = toHex(hash);
    }
  })

]}).appendTo(contentView);
