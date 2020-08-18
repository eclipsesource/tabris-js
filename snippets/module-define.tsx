import {contentView, TextView, Module} from 'tabris';

// Using type declaration from ./types.d.ts
Module.define('/node_modules/foo', {hello: 'world'});

(async () => {
  contentView.append(
    <TextView padding={8}>
      Defined a new module "foo" with export {JSON.stringify(await import('foo'))}
    </TextView>
  );
})();
