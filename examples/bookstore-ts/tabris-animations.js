var fadeInConstructor = function (params) {
    return function (widget) {
        // TODO: discard non animated params.
        widget.set({
            opacity: 0.0,
            transform: {
                translationX: params.translationX || 0,
                translationY: params.translationY || 0
            }
        });
        widget.animate({
            opacity: 1.0,
            transform: { translationX: 0, translationY: 0 }
        }, {
            duration: params.duration,
            delay: params.delay,
            easing: "ease-out"
        });
    };
};
// TODO: accept also a JSON based interface.
function fadeIn(duration, delay) {
    if (duration === void 0) { duration = 400; }
    if (delay === void 0) { delay = 0; }
    return fadeInConstructor({ duration: duration, delay: delay });
}
exports.fadeIn = fadeIn;
function fadeInRight(duration, delay, distance) {
    if (duration === void 0) { duration = 400; }
    if (delay === void 0) { delay = 0; }
    if (distance === void 0) { distance = 32; }
    return fadeInConstructor({ duration: duration, delay: delay, translationX: distance });
}
exports.fadeInRight = fadeInRight;
function fadeInLeft(duration, delay, distance) {
    if (duration === void 0) { duration = 400; }
    if (delay === void 0) { delay = 0; }
    if (distance === void 0) { distance = 32; }
    return fadeInConstructor({ duration: duration, delay: delay, translationX: distance * (-1) });
}
exports.fadeInLeft = fadeInLeft;
function fadeInDown(duration, delay, distance) {
    if (duration === void 0) { duration = 400; }
    if (delay === void 0) { delay = 0; }
    if (distance === void 0) { distance = 32; }
    return fadeInConstructor({ duration: duration, delay: delay, translationY: distance });
}
exports.fadeInDown = fadeInDown;
function fadeInUp(duration, delay, distance) {
    if (duration === void 0) { duration = 400; }
    if (delay === void 0) { delay = 0; }
    if (distance === void 0) { distance = 32; }
    return fadeInConstructor({ duration: duration, delay: delay, translationY: distance * (-1) });
}
exports.fadeInUp = fadeInUp;
