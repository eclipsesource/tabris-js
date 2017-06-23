export default function(target) {
  target.requestAnimationFrame = function (fn) {
    return target.setTimeout(fn, 0);
  };
  target.cancelAnimationFrame = function(timerId) {
    return target.clearTimeout(timerId);
  };
}
