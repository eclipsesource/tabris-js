var SPACE = Math.max(screen.width, screen.height) > 900 ? 15 : 5;

module.exports = {
  '#red': {
    left: SPACE,
    top: SPACE,
    right: SPACE,
    height: 80
  },
  '#green': {
    left: SPACE,
    top: ['#red', SPACE],
    right: ['#yellow', SPACE],
    bottom: ['#purple', SPACE]
  },
  '#yellow': {
    top: ['#red', SPACE],
    bottom: ['#purple', SPACE],
    right: SPACE,
    width: 80
  },
  '#purple': {
    top: null,
    left: SPACE,
    right: ['yellow', SPACE],
    bottom: SPACE,
    width: null,
    height: 80
  },
  '#blue': {
    visible: false
  }
};
