var SPACE = Math.max(screen.width, screen.height) > 900 ? 15 : 5;

module.exports = {
  "#red": {
    layoutData: {
      left: SPACE,
      top: SPACE,
      height: 80,
      right: ["#blue", SPACE]
    }
  },
  "#green": {
    layoutData: {
      left: SPACE,
      top: ["#red", SPACE],
      right: ["#purple", SPACE],
      bottom: SPACE
    }
  },
  "#purple": {
    layoutData: {
      top: ["#red", SPACE],
      right: ["#yellow", SPACE],
      bottom: SPACE,
      width: 80
    }
  },
  "#yellow": {
    layoutData: {
      top: ["#red", SPACE],
      bottom: SPACE,
      right: ["#blue", SPACE],
      width: 80
    }
  },
  "#blue": {
    visible: true,
    layoutData: {
      top: SPACE,
      right: SPACE,
      bottom: SPACE,
      width: 80
    }
  }
};
