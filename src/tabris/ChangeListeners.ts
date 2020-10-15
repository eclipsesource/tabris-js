import Listeners from './Listeners';
import Observable from './Observable';

export default class ChangeListeners<
  Target extends object = any,
  Property extends string & keyof Target = any
> extends Listeners<{value: Target[Property]}> {

  private $values?: Observable<Target[Property]>;
  private $current: () => Target[Property];

  constructor(target: Target, property: Property) {
    propertyCheck(target, property);
    super(target, property + 'Changed');
    this.$current = () => target[property];
    Object.defineProperty(this, 'values', {
      get: () => Reflect.get(ChangeListeners.prototype, 'values', this)
    });
  }

  public trigger(eventData?: {value: Target[Property]}) {
    if (!eventData || !('value' in eventData)) {
      throw new Error('Can not trigger change event without "value" property in event data');
    }
    return super.trigger(eventData);
  }

  public get values() {
    if (!this.$values) {
      this.$values = new Observable(observer => {
        observer.next(this.$current());
        const subscription = this.subscribe({
          next: event => observer.next(event.value),
          error: observer.error,
          complete: observer.complete
        });
        return () => subscription.unsubscribe();
      });
    }
    return this.$values as Observable<Target[Property]>;
  }

}

function propertyCheck(target: object, property: string) {
  if (!(property in target)) {
    throw new Error(`Target has no property "${property}"`);
  }
}
