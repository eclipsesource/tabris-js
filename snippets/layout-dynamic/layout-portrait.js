var SPACE = Math.max(screen.width, screen.height) > 900 ? 15 : 5;

module.exports = {
  "#red": {
    layoutData: {
      left: SPACE,
      top: SPACE,
      right: SPACE,
      height: 80
    }
  },
  "#green": {
    layoutData: {
      left: SPACE,
      top: ["#red", SPACE],
      right: ["#yellow", SPACE],
      bottom: ["#purple", SPACE]
    }
  },
  "#yellow": {
    layoutData: {
      top: ["#red", SPACE],
      bottom: ["#purple", SPACE],
      right: SPACE,
      width: 80
    }
  },
  "#purple": {
    layoutData: {
      left: SPACE,
      bottom: SPACE,
      right: ["yellow", SPACE],
      height: 80
    }
  },
  "#blue": {
    visible: false
  }
};
