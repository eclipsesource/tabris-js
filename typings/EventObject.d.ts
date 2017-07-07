interface EventObject<T> {
  readonly [p: string]: any,
  readonly target: T,
  readonly timeStamp: number,
  readonly type: string
}
