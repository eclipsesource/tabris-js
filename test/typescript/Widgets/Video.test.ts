import {Video, VideoStateChangedEvent} from 'tabris';

let widget: Video = new Video();

// Properties
let autoPlay: boolean;
let controlsVisible: boolean;
let duration: number;
let position: number;
let speed: number;
let state: 'empty' | 'fail' | 'finish' | 'open' | 'pause' | 'play' | 'ready' | 'stale';
let url: string;

autoPlay = widget.autoPlay;
controlsVisible = widget.controlsVisible;
duration = widget.duration;
position = widget.position;
speed = widget.speed;
state = widget.state;
url = widget.url;

widget.autoPlay = autoPlay;
widget.controlsVisible = controlsVisible;
widget.url = url;

// Methods
let voidReturnValue: void;

voidReturnValue = widget.pause();
voidReturnValue = widget.play();
voidReturnValue = widget.play(speed);
voidReturnValue = widget.seek(position);

// Events
let target: Video = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: 'empty' | 'fail' | 'finish' | 'open' | 'pause' | 'play' | 'ready' | 'stale' = 'play';

let stateChangedEvent: VideoStateChangedEvent = {target, timeStamp, type, value};

widget.on({
  stateChanged: (event: VideoStateChangedEvent) => {}
});
