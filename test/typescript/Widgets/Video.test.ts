import {Video} from 'tabris';

let widget: Video;

// Properties
let autoPlay: boolean;
let controlsVisible: boolean;
let duration: number;
let position: number;
let speed: number;
let state: 'empty' | 'fail' | 'finish' | 'open' | 'pause' | 'play' | 'ready' | 'stale';
let url: string;

widget.autoPlay = autoPlay;
widget.controlsVisible = controlsVisible;
widget.url = url;

autoPlay = widget.autoPlay;
controlsVisible = widget.controlsVisible;
duration = widget.duration;
position = widget.position;
speed = widget.speed;
state = widget.state;
url = widget.url;

// Methods
let voidReturnValue: void;

voidReturnValue = widget.pause();
voidReturnValue = widget.play();
voidReturnValue = widget.play(speed);
voidReturnValue = widget.seek(position);
