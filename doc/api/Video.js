import {Video, contentView} from 'tabris';

new Video({
  width: 160, height: 90,
  url: 'resources/video.mp4'
}).appendTo(contentView);
