
const fadeInConstructor =
    (params) => {
        return (widget) => {
            // TODO: discard non animated params.
            widget.set({
                opacity: 0.0,
                transform: {
                    translationX: params.translationX || 0,
                    translationY: params.translationY || 0,
                }
            });
            widget.animate({
                opacity: 1.0,
                transform: {translationX: 0, translationY: 0}
            }, {
                duration: params.duration,
                delay: params.delay,
                easing: "ease-out"
            });
        }
}

// TODO: accept also a JSON based interface.
export function fadeIn(duration: number = 400, delay = 0) {
    return fadeInConstructor({duration, delay});
}

export function fadeInRight(duration: number = 400, delay = 0, distance = 32) {
    return fadeInConstructor({duration, delay, translationX: distance});
}

export function fadeInLeft(duration: number  = 400, delay = 0, distance = 32) {
    return fadeInConstructor({duration, delay, translationX: distance * (-1) });
}

export function fadeInDown(duration: number  = 400, delay = 0, distance = 32) {
    return fadeInConstructor({duration, delay, translationY: distance});
}

export function fadeInUp(duration: number  = 400, delay = 0, distance = 32) {
    return fadeInConstructor({duration, delay, translationY: distance * (-1) });
}