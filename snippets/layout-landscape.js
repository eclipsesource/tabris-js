var SPACE = Math.max(screen.width, screen.height) > 900 ? 15 : 5;

module.exports = {
  '#red': {
    left: SPACE,
    top: SPACE,
    right: ['#blue', SPACE],
    height: 80
  },
  '#green': {
    left: SPACE,
    top: ['#red', SPACE],
    right: ['#purple', SPACE],
    bottom: SPACE
  },
  '#yellow': {
    top: ['#red', SPACE],
    bottom: SPACE,
    right: ['#blue', SPACE],
    width: 80
  },
  '#purple': {
    top: ['#red', SPACE],
    left: null,
    right: ['#yellow', SPACE],
    bottom: SPACE,
    width: 80,
    height: null
  },
  '#blue': {
    visible: true,
    top: SPACE,
    right: SPACE,
    bottom: SPACE,
    width: 80
  }
};
