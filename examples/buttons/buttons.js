/*global questions: false */

tabris.load(function() {

  var createQuizPage = function(questionObject) {

    function createAnswerButton(type, answer, refWidget) {
      return answerComposite.append(type, {
        font: "25px sans-serif",
        layoutData: {left: [40, 0], right: [10, 0], top: refWidget ? [refWidget, 20] : 0},
        text: answer
      }).on("selection", function() {
        activateNextButton();
        statusLabel.set("text", "");
      });
    }

    function createAnswerButtons(type, questionObject) {
      var answerButtons = [];
      for (var i = 0; i < questionObject.answers.length; i++) {
        answerButtons.push(createAnswerButton(type, questionObject.answers[i],
                                              answerButtons[i - 1]));
      }
      return answerButtons;
    }

    function activateNextButton() {
      nextButton.set("enabled", true);
    }

    function correctAnswer(questionObject) {
      for (var i = 0; i < questionObject.answers.length; i++) {
        if (answerButtons[i].get("selection") !== isInArray(questionObject.correctAnswers, i)) {
          return false;
        }
      }
      return true;
    }

    function isMultipleChoice(questionObject) {
      return questionObject.correctAnswers.length > 1;
    }

    function isInArray(array, search) {
      return array.indexOf(search) >= 0;
    }

    function questionsLeft() {
      return currentQuestionIndex + 1 < questions.length;
    }

    var page = tabris.createPage({
                                   title: "You don't know that?",
                                   topLevel: true
                                 });

    var statusComposite = page.append("Composite", {
      layoutData: {left: 0, right: 0, top: [80, 0], bottom: 0}
    });

    var answerComposite = page.append("Composite", {
      layoutData: {left: 0, right: 0, top: [50, 0], bottom: [statusComposite, 0]}
    });

    var questionComposite = page.append("Composite", {
      layoutData: {left: 0, right: 0, top: 0, bottom: [answerComposite, 0]}
    });

    questionComposite.append("Label", {
      layoutData: {left: 10, right: 10, top: 10},
      alignment: "center",
      text: questionObject.question,
      font: "25px sans-serif",
      style: ["WRAP"]
    });

    var type = (isMultipleChoice(questionObject)) ? "CheckBox" : "RadioButton";

    var answerButtons = createAnswerButtons(type, questionObject);

    var statusLabel = statusComposite.append("Label", {
      text: "",
      font: "25px sans-serif",
      layoutData: {left: 13, bottom: 13, width: 200, height: 35}  // iOS needs this width/heigth
    });

    var nextButton = statusComposite.append("Button", {
      text: "Next",
      font: "25px sans-serif",
      layoutData: {right: 10, bottom: 10, width: 150, heigth: 25},
      enabled: false
    }).on("selection", function() {
      if (!correctAnswer(questionObject)) {
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
    return page;
  };

  var currentQuestionIndex = 0;
  shuffleArray(questions);
  createQuizPage(questions[currentQuestionIndex]).open();

  function shuffleArray(array) {
    var remainingElements = array.length,
        randomIndexInRange,
        temp;
    while (remainingElements > 0) {
      randomIndexInRange = Math.floor(Math.random() * remainingElements--);
      temp = array[remainingElements];
      array[remainingElements] = array[randomIndexInRange];
      array[randomIndexInRange] = temp;
    }
    return array;
  }

  shuffleArray(questions);
  createQuizPage(questions[currentQuestionIndex]).open();

});
