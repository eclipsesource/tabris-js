type CreateOp = ['create', string, string, NativeProps];
type SetOp = ['set', string, NativeProps];
type ListenOp = ['listen', string, string, boolean];
type DestroyOp = ['destroy', string];
type Operation = CreateOp | SetOp | ListenOp | DestroyOp;

// Note: Excludes "load", "execute" and "loadAndExecute"
// since these are only used in the bootstrap code.
// See src/boot/globals.d.ts
export interface NativeClient {
  create(id: string, type: string, properties: NativeProps): void;
  get(id: string, property: string): unknown;
  set(id: string, properties: NativeProps): void;
  call(id: string, method: string, parameters: NativeProps): void;
  listen(id: string, event: string, listen: boolean): void;
  destroy(id: string): void;
  flush(operations: Operation[]): void;
}

export default class NativeBridge {

  $bridge!: NativeClient;
  $operations!: Operation[];
  $currentOperation!: {id?: string, properties?: NativeProps};
  $propertyCache!: Record<string, NativeProps>;

  constructor(bridge: NativeClient) {
    Object.defineProperties(this, {
      $bridge: {enumerable: false, writable: false, value: bridge},
      $operations: {enumerable: false, writable: true, value: []},
      $currentOperation: {enumerable: false, writable: true, value: {id: null}},
      $propertyCache: {enumerable: false, writable: true, value: {}}
    });
  }

  create(id: string, type: string): void {
    const properties = {};
    this.$operations.push(['create', id, type, properties]);
    this.$currentOperation = {id, properties};
  }

  set(id: string, name: string, value: unknown): void {
    if (this.$currentOperation.id === id && this.$currentOperation.properties) {
      this.$currentOperation.properties[name] = value;
    } else {
      const properties: NativeProps = {};
      properties[name] = value;
      this.$operations.push(['set', id, properties]);
      this.$currentOperation = {id, properties};
    }
    this.cacheValue(id, name, value);
  }

  listen(id: string, event: string, listen: boolean): void {
    this.$operations.push(['listen', id, event, listen]);
    this.$currentOperation = {id: undefined};
  }

  destroy(id: string): void {
    this.$operations.push(['destroy', id]);
    this.$currentOperation = {id: undefined};
  }

  get(id: string, name: string): unknown {
    if (this.$propertyCache[id] && name in this.$propertyCache[id]) {
      return this.$propertyCache[id][name];
    }
    this.flush();
    const result = this.$bridge.get(id, name);
    this.cacheValue(id, name, result);
    return result;
  }

  call(id: string, method: string, parameters: NativeProps): unknown {
    this.flush();
    return this.$bridge.call(id, method, parameters);
  }

  flush(): void {
    tabris.trigger('layout');
    const operations = this.$operations;
    this.$operations = [];
    this.$currentOperation = {id: undefined};
    const length = operations.length;
    if (!length) {
      return;
    }
    if (this.$bridge.flush) {
      this.$bridge.flush(operations);
    } else {
      for (let i = 0; i < length; i++) {
        const op = operations[i];
        switch (op[0]) {
          case 'create':
            this.$bridge.create(op[1], op[2], op[3]);
            break;
          case 'set':
            this.$bridge.set(op[1], op[2]);
            break;
          case 'listen':
            this.$bridge.listen(op[1], op[2], op[3]);
            break;
          case 'destroy':
            this.$bridge.destroy(op[1]);
        }
      }
    }
  }

  clearCache(): void {
    this.$propertyCache = {};
  }

  cacheValue(id: string, property: string, value: unknown): void {
    if (!this.$propertyCache[id]) {
      this.$propertyCache[id] = {};
    }
    this.$propertyCache[id][property] = value;
  }

}
