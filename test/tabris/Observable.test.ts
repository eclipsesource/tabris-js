import {expect, spy} from '../test';
import TabrisObservable from '../../src/tabris/Observable';
import {Observer, Subscriber, Subscription, SubscriptionHandler} from '../../src/tabris/Observable.types';
import {Observable as RxObservable} from 'rxjs';
import  * as rxjs from 'rxjs';
import  * as operators from 'rxjs/operators';
import * as symbols from '../../src/tabris/symbols';
import {SinonSpy} from 'sinon';

type Implementations = 'Tabris' | 'RX';
type Protocol = Array<{next: string} | {error: any} | {complete: true} | {closed: boolean}>;
const implementations: Readonly<Implementations[]> = Object.freeze(['RX', 'Tabris']);

describe('Observable', function() {

  implementations.forEach(impl => {

    const Observable: typeof TabrisObservable = impl === 'Tabris' ? TabrisObservable : RxObservable;

    describe(impl, function() {

      let observable: TabrisObservable<string>;
      let observer: Partial<Observer<string>>;
      let subHandler: SubscriptionHandler<string>;
      let subHandlerSpy: SinonSpy & SubscriptionHandler<string>;
      let subscription: Subscription;
      let teardownObject: {unsubscribe: SinonSpy};

      function getOutput(output: Protocol = []) {
        subscription = observable.subscribe({
          next: spy(next => output.push({next})),
          error: spy(error => output.push({error})),
          complete: spy(() => output.push({complete: true}))
        });
        return output;
      }

      beforeEach(function() {
        observer = {next: spy(), error: spy(), complete: spy()};
        teardownObject = {unsubscribe: spy()};
        subHandler = () => teardownObject;
        subHandlerSpy = spy(function() {
          return subHandler.apply(this, arguments);
        });
        observable = new Observable(subHandlerSpy);
      });

      it('can be created without subscribe callback', function() {
        expect(new Observable()).to.be.instanceOf(Observable);
      });
      if (impl === 'Tabris') {

        it('can not be created for non-function argument', function() {
          expect(() => new Observable(23 as any)).to.throw(
            TypeError, 'Expected subscribe to be a function, got number'
          );
        });

      }

      it('never calls observer without subscribe callback', async function() {
        observable = new Observable();
        expect(getOutput()).to.be.empty;
      });

      it('never calls observer without noop subscribe callback', async function() {
        expect(getOutput()).to.be.empty;
      });

      it('is observable', async function() {
        expect(observable[Symbol.observable]()).to.equal(observable);
        expect(observable[symbols.observable]()).to.equal(observable);
      });

      describe('subscribe', function() {

        it('calls subscribe callback',function() {
          observable.subscribe(observer);
          expect(subHandlerSpy).to.have.been.calledOnce;
        });

        it('calls subscribe callback in context', function() {
          observable.subscribe(observer);
          expect(subHandlerSpy).to.have.been.calledOn(observable);
        });

        it('returns subscription', function() {
          subscription = observable.subscribe();
          expect(subscription.closed).to.equal(false);
          expect(subscription.unsubscribe).to.be.instanceOf(Function);
        });

        it('passes subscriber to subscribe callback', function() {
          observable.subscribe(observer);
          const subscriber: Subscriber<string> = subHandlerSpy.args[0][0];
          expect(subscriber.next).to.be.instanceOf(Function);
          expect(subscriber.error).to.be.instanceOf(Function);
          expect(subscriber.complete).to.be.instanceOf(Function);
          expect(subscriber.closed).to.be.equal(false);
        });

        if (impl === 'Tabris') {

          it('is bound to observable', function() {
            const observableSubscribe = observable.subscribe;
            observableSubscribe(observer);
            expect(subHandlerSpy).to.have.been.calledOn(observable);
          });

        }

      });

      describe('Subscriber', function() {

        it('passes on synchronously observed values', function() {
          subHandler = subscriber => {
            subscriber.next('foo');
            subscriber.next('bar');
            subscriber.next('baz');
          };

          expect(getOutput()).to.deep.equal([{next: 'foo'}, {next: 'bar'}, {next: 'baz'}]);
        });

        it('passes on errors', function() {
          subHandler = subscriber => {
            subscriber.next('foo');
            subscriber.error('bar');
          };

          expect(getOutput()).to.deep.equal([{next: 'foo'}, {error: 'bar'}]);
        });

        it('passes on asynchronously observed values synchronously', function() {
          let next: Observer<string>['next'];
          subHandler = subscriber => next = (value: any) => subscriber.next(value);
          const output = getOutput();
          const before = output.concat();

          next('foo');
          const foo = output.concat();
          next('bar');
          const bar = output.concat();
          next('baz');
          const baz = output.concat();

          expect(before).to.deep.equal([]);
          expect(foo).to.deep.equal([{next: 'foo'}]);
          expect(bar).to.deep.equal([{next: 'foo'}, {next: 'bar'}]);
          expect(baz).to.deep.equal([{next: 'foo'}, {next: 'bar'}, {next: 'baz'}]);
        });

        it('works with timer', async function() {
          subHandler = subscriber => {
            setTimeout(() => subscriber.next('foo'), 0);
            setTimeout(() => subscriber.next('bar'), 20);
            setTimeout(() => subscriber.next('baz'), 40);
          };
          const output = getOutput();

          const before = output.concat();
          await new Promise(resolve => setTimeout(resolve, 50));
          const after = output.concat();

          expect(before).to.deep.equal([]);
          expect(after).to.deep.equal([{next: 'foo'}, {next: 'bar'}, {next: 'baz'}]);
        });

        it('passes on asynchronously observed values synchronously', function() {
          let next: Observer<string>['next'];
          subHandler = subscriber => next = (value: any) => subscriber.next(value);
          const output = getOutput();
          const before = output.concat();

          next('foo');
          const foo = output.concat();
          next('bar');
          const bar = output.concat();
          next('baz');
          const baz = output.concat();

          expect(before).to.deep.equal([]);
          expect(foo).to.deep.equal([{next: 'foo'}]);
          expect(bar).to.deep.equal([{next: 'foo'}, {next: 'bar'}]);
          expect(baz).to.deep.equal([{next: 'foo'}, {next: 'bar'}, {next: 'baz'}]);
        });

        it('closes on complete', function() {
          const output: Protocol = [];
          subHandler = subscriber => {
            output.push({closed: subscriber.closed});
            subscriber.next('foo');
            output.push({closed: subscriber.closed});
            subscriber.complete();
            output.push({closed: subscriber.closed});
          };

          getOutput(output);

          expect(output).to.deep.equal([
            {closed: false},
            {next: 'foo'},
            {closed: false},
            {complete: true},
            {closed: true}
          ]);
          expect(subscription.closed).to.be.true;
        });

        it('ignores values after error', function() {
          subHandler = subscriber => {
            subscriber.next('foo');
            subscriber.error('bar');
            subscriber.next('baz');
          };

          expect(getOutput()).to.deep.equal([
            {next: 'foo'},
            {error: 'bar'}
          ]);
        });

        it('supports overloads', function() {
          subHandler = subscriber => subscriber.next('foo');
          observable.subscribe(observer.next);
          subHandler = subscriber => subscriber.error('bar');
          observable.subscribe(null, observer.error);
          subHandler = subscriber => subscriber.complete();
          observable.subscribe(null, null, observer.complete);

          expect(observer.next).to.have.been.calledOnce;
          expect(observer.next).to.have.been.calledWith('foo');
          expect(observer.error).to.have.been.calledWith('bar');
          expect(observer.complete).to.have.been.calledWith();
        });

        if (impl === 'Tabris') {

          it('ignores unhandled errors', function() {
            // Note: RxJS somehow does not behave consistently/deterministic in this scenario
            subHandler = subscriber => {
              subscriber.error(new Error('bar'));
            };

            expect(observable.subscribe({})).not.to.throw;
          });

          it('can not emit when closed', function() {
            subHandler = subscriber => {
              subscriber.next('foo');
              subscriber.complete();
              subscriber.next('bar');
              subscriber.complete();
              subscriber.error({});
            };
            expect(getOutput()).to.deep.equal([{next: 'foo'}, {complete: true}]);
          });

          it('makes "closed" property readonly', function() {
            const output: Protocol = [];
            subHandler = subscriber => {
              (subscriber as any).closed = true;
              output.push({closed: subscriber.closed});
              (subscriber as any).closed = true;
              subscriber.next('foo');
              output.push({closed: subscriber.closed});
              subscriber.complete();
              (subscriber as any).closed = false;
              output.push({closed: subscriber.closed});
            };

            getOutput(output);

            expect(output).to.deep.equal([
              {closed: false},
              {next: 'foo'},
              {closed: false},
              {complete: true},
              {closed: true}
            ]);
          });

          it('is destructurable', function() {
            subHandler = ({next}) => next('foo');
            observable.subscribe(observer);
            subHandler = ({error}) => error('bar');
            observable.subscribe(observer);
            subHandler = ({complete}) => complete();
            observable.subscribe(observer);

            expect(observer.next).to.have.been.calledOn(observer);
            expect(observer.error).to.have.been.calledOn(observer);
            expect(observer.complete).to.have.been.calledOn(observer);
          });

        }

      });

      describe('Subscription', function() {

        it('closes on unsubscribe', function() {
          let subscriber: Subscriber<string>;
          subHandler = (_subscriber) => {
            subscriber = _subscriber;
            return teardownObject;
          };

          const output = getOutput();
          subscription.unsubscribe();
          subscriber.next('foo');

          expect(subscription.closed).to.be.true;
          expect(subscriber.closed).to.be.true;
          expect(output).to.deep.equal([]);
          expect(teardownObject.unsubscribe).to.have.been.calledOnce;
        });

        it('calls teardown on object', function() {
          observable.subscribe().unsubscribe();

          expect(teardownObject.unsubscribe).to.have.been.calledOn(teardownObject);
        });

        it('calls teardown returned after completion', function() {
          subHandler = subscriber => {
            subscriber.complete();
            return teardownObject;
          };

          getOutput();

          expect(teardownObject.unsubscribe).to.have.been.calledOnce;
        });

        it('calls teardown only once', function() {
          subscription = observable.subscribe();

          subscription.unsubscribe();
          subscription.unsubscribe();

          expect(teardownObject.unsubscribe).to.have.been.calledOnce;
        });

        it('calls teardown function', function() {
          subHandler = () => teardownObject.unsubscribe;
          observable.subscribe().unsubscribe();

          expect(teardownObject.unsubscribe).to.have.been.calledOnce;
        });

        if (impl === 'Tabris') {

          it('makes property "closed" readonly', function() {
            subscription = observable.subscribe();
            (subscription as any).closed = true;
            expect(subscription.closed).to.be.false;
          });

        }

      });

    });

    describe('RxJS Interoperability', function() {

      it('can assign RxJS Observable to Tabris Observable', function() {
        const tabrisObservable: TabrisObservable = new RxObservable();
        const tabrisObservableTyped: TabrisObservable<string> = new RxObservable<string>();
        expect(tabrisObservable).to.be.instanceOf(RxObservable);
        expect(tabrisObservableTyped).to.be.instanceOf(RxObservable);
      });

      it('does not identify Tabris Observable as RxJS Observable', function() {
        expect(rxjs.isObservable(new TabrisObservable())).to.be.false;
      });

      it('converts Tabris Observable to RxJS Observable', function() {
        expect(rxjs.from(new TabrisObservable())).to.be.instanceOf(RxObservable);
      });

      it('receives Tabris Observable "next" calls', function() {
        const cb = spy();
        const observable = rxjs.from(new TabrisObservable<number>(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.next(3);
        }));

        observable.subscribe(cb);

        expect(cb).to.have.been.calledThrice;
        expect(cb).to.have.been.calledWith(1);
        expect(cb).to.have.been.calledWith(2);
        expect(cb).to.have.been.calledWith(3);
      });

      it('receives Tabris Observable "error" calls', function() {
        const cb = spy();
        const observable = rxjs.from(new TabrisObservable(subscriber => {
          subscriber.error(1);
        }));

        observable.subscribe({error: cb});

        expect(cb).to.have.been.calledOnce;
        expect(cb).to.have.been.calledWith(1);
      });

      it('receives Tabris Observable "complete" calls', function() {
        const cb = spy();
        const observable = rxjs.from(new TabrisObservable(subscriber => {
          subscriber.complete();
        }));

        observable.subscribe({complete: cb});

        expect(cb).to.have.been.calledOnce;
      });

      it('calls Tabris Observable teardown', function() {
        const teardown = spy();
        const observable = rxjs.from(new TabrisObservable(() => teardown));

        observable.subscribe().unsubscribe();

        expect(teardown).to.have.been.calledOnce;
      });

      it('supports "pipe"', function() {
        const cb = spy();
        const observable = rxjs.from(new TabrisObservable<number>(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.next(3);
        })).pipe(operators.map(value => value * 10));

        observable.subscribe(cb);

        expect(cb).to.have.been.calledThrice;
        expect(cb).to.have.been.calledWith(10);
        expect(cb).to.have.been.calledWith(20);
        expect(cb).to.have.been.calledWith(30);
      });

    });

  });

});
