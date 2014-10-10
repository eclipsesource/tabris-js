/*global questions: false */

tabris.load(function() {

  var currentQuestionIndex = 0;
  shuffleArray(questions);
  createQuizPage(questions[currentQuestionIndex]).open();

  function createQuizPage(question) {

    var nextButton, statusLabel, answerButtons;

    var page = tabris.create("Page", {
      title: "You don't know that?",
      topLevel: true
    });
    var statusComposite = createStatusComposite({
      layoutData: {left: 0, right: 0, top: [80, 0], bottom: 0}
    });
    var answerComposite = createAnswerComposite({
      layoutData: {left: 0, right: 0, top: [50, 0], bottom: [statusComposite, 0]}
    });
    var questionComposite = createQuestionComposite(question, {
      layoutData: {left: 0, right: 0, top: 0, bottom: [answerComposite, 0]}
    });
    return page.append(statusComposite, answerComposite, questionComposite);

    function createStatusComposite(properties) {
      var statusComposite = tabris.create("Composite", properties);
      statusLabel = tabris.create("Label", {
        text: "",
        font: "25px sans-serif",
        layoutData: {left: 13, bottom: 13, width: 200, height: 35} // iOS needs this width/heigth
      });
      nextButton = tabris.create("Button", {
        text: "Next",
        font: "25px sans-serif",
        layoutData: {right: 10, bottom: 10, width: 150, heigth: 25},
        enabled: false
      }).on("selection", function() {
        if (!correctAnswer()) {
          statusLabel.set("text", "Sorry, try again!");
          nextButton.set("enabled", false);
        } else if (!questionsLeft()) {
          statusLabel.set("text", "Congratulations!");
          nextButton.set("text", "Restart");
          currentQuestionIndex = -1;
          shuffleArray(questions);
        } else {
          page.close();
          page = createQuizPage(questions[++currentQuestionIndex]);
          page.open();
        }
      });
      statusComposite.append(statusLabel, nextButton);
      return statusComposite;
    }

    function createQuestionComposite(properties) {
      return tabris.create("Composite", properties).append(tabris.create("Label", {
        layoutData: {left: 10, right: 10, top: 10},
        alignment: "center",
        text: question.text,
        font: "25px sans-serif",
        style: ["WRAP"]
      }));
    }

    function createAnswerComposite(properties) {
      var composite = tabris.create("Composite", properties);
      createAnswerButtons().forEach(function(button) {
        composite.append(button);
      });
      return composite;
    }

    function createAnswerButtons() {
      var type = (isMultipleChoice(question)) ? "CheckBox" : "RadioButton";
      answerButtons = [];
      for (var i = 0; i < question.answers.length; i++) {
        var button = createAnswerButton(type, question.answers[i], answerButtons[i - 1]);
        answerButtons.push(button);
      }
      return answerButtons;
    }

    function createAnswerButton(type, answer, refWidget) {
      return tabris.create(type, {
        font: "25px sans-serif",
        layoutData: {left: [40, 0], right: [10, 0], top: refWidget ? [refWidget, 20] : 0},
        text: answer
      }).on("selection", function() {
        activateNextButton();
        statusLabel.set("text", "");
      });
    }

    function activateNextButton() {
      nextButton.set("enabled", true);
    }

    function correctAnswer() {
      for (var i = 0; i < question.answers.length; i++) {
        if (answerButtons[i].get("selection") !== isInArray(question.correctAnswers, i)) {
          return false;
        }
      }
      return true;
    }

  }

  function questionsLeft() {
    return currentQuestionIndex + 1 < questions.length;
  }

  function isMultipleChoice(question) {
    return question.correctAnswers.length > 1;
  }

  function isInArray(array, search) {
    return array.indexOf(search) >= 0;
  }

  function shuffleArray(array) {
    var remainingElements = array.length, randomIndexInRange, temp;
    while (remainingElements > 0) {
      randomIndexInRange = Math.floor(Math.random() * remainingElements--);
      temp = array[remainingElements];
      array[remainingElements] = array[randomIndexInRange];
      array[randomIndexInRange] = temp;
    }
    return array;
  }

});
