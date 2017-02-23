
/**
 * Executes a function after the timer expires.
 *
 * @param func
 *   The function to be executed after the timer expires.
 * @param delay
 *   The time, in milliseconds, the timer should wait before the specified function is executed.
 *   If this parameter is omitted, a value of 0 is used.
 * @param args
 *   The arguments to pass to the function.
 * @returns an handle to use in `clearTimeout`.
 */
declare function setTimeout(func: (...args: any[]) => void, delay?: number, ...args: any[]): number;

/**
 * Repeatedly calls a function with a fixed delay between each call.
 *
 * @param func
 *   The function to be executed every `delay` milliseconds.
 * @param delay
 *   The time, in milliseconds, the timer should wait before the specified function is executed.
 * @param args
 *   Additional arguments to pass to the function.
 * @returns an handle to use in `clearInterval`.
 */
declare function setInterval(func: (...args: any[]) => void, delay: number, ...args: any[]): number;

/**
 * Cancels the call of a function previously established by calling `setTimeout()`.
 *
 * @param handle
 *   The identifier of the timeout to cancel, as returned by the corresponding call to `setTimeout()`.
 */
declare function clearTimeout(handle: number): void;

/**
 * Cancels repeating calls to a function previously established by a call to `setInterval()`.
 *
 * @param handle
 *   The identifier of the timeout to cancel, as returned by the corresponding call to `setInterval()`.
 */
declare function clearInterval(handle: number): void;
