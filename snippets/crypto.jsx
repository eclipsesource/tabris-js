import {TextView, crypto, contentView} from 'tabris';

const data = new Uint8Array(24);
crypto.getRandomValues(data);

contentView.append(
  <TextView stretchX padding={16} font='16px monospace'>
    {data.join(' ')}
  </TextView>
);
