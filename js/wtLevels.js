const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "gm6tqddphhfa",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "ig3t7ZfDycwfVihJaa47GVFQfVbqEG53fRkCj-5hvbM",
});

// Dom elements
const wordInput = document.querySelector("#word-input");
const currentWord = document.querySelector("#current-word");
const matchedLetters = document.querySelector("#matched-letters");
const scoreDisplay = document.querySelector(".score");
const displayTime = document.querySelector(".time");
const message = document.querySelector("#message");
const seconds = document.querySelector("#seconds");
const correct = new Audio();
correct.src = "../audio/correct.mp3";
const displayScore = document.querySelector(".score");
const displayHighScore = document.querySelector(".highScore");
const startBtn = document.querySelector(".start-btn");
const selectLevel = document.getElementById("selectLevel");
const selectedLevel = document.getElementById("selectedLevel");
let time = seconds.innerHTML;
let score = 0;
let isTyping = false;
let highScore = 0;
let level = seconds.innerHTML;
let words = [];

class Items {
  async getItems() {
    try {
      let contentful = await client.getEntries({
        content_type: "typingGame",
      });

      words = contentful.items[0].fields.wordsAndTexts.words;

      return words;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  static showWord() {
    let words = Storage.getWords();
    // generate random index
    const randIndex = Math.floor(Math.random() * words.length);

    // output a random word
    currentWord.innerHTML = words[randIndex];
    matchedLetters.innerHTML = words[randIndex];
  }
}

class APP {
  setLevel() {
    selectLevel.addEventListener("submit", e => {
      e.preventDefault();
      if (!isTyping) {
        message.innerHTML = "";
        displayScore.innerHTML = "";
      } else {
        if (score > displayHighScore.innerHTML) {
          Storage.saveHighScore();
          displayHighScore.innerHTML = Storage.getHighScore();
          message.innerHTML = `<p class="text-success">New High Score!!!</p>`;
        } else {
          message.innerHTML = "";
        }
        if (displayHighScore.innerHTML > Storage.getBestScore()) {
          Storage.saveBestScore();
        }

        displayTime.innerHTML = "";

        UI.showWord();
        isTyping = false;
      }
      matchedLetters.innerHTML = currentWord.innerHTML;

      wordInput.style.display = "block";
      wordInput.value = "";

      score = 0;
      seconds.innerHTML = selectedLevel.value;
      time = seconds.innerHTML;
      level = seconds.innerHTML;
      displayHighScore.innerHTML = Storage.getHighScore();
    });
  }

  matchWords() {
    wordInput.value = "";
    wordInput.addEventListener("input", () => {
      isTyping = true;
      startBtn.innerText = "Restart";
      if (
        wordInput.value ===
        currentWord.innerHTML.slice(0, wordInput.value.length)
      ) {
        let matched = currentWord.innerHTML.slice(0, wordInput.value.length);
        let currentWordMatch = currentWord.innerHTML;
        matchedLetters.innerHTML = currentWordMatch.replace(
          matched,
          `<span class="text-success">${matched}</span>`
        );
      }
      if (wordInput.value === currentWord.innerHTML) {
        score++;
        this.matchWords();
        correct.play();
        UI.showWord();
        wordInput.value = "";
        time = seconds.innerHTML;
      }
    });
  }

  countDown() {
    if (isTyping === true && time >= 0.1) {
      time -= 0.1;
      displayTime.innerHTML = `time: ${time.toFixed(1)} seconds`;
      displayScore.innerHTML = `Score: ${score}`;
      message.innerHTML = `<p class="text-primary">Typing...</p>`;
    } else if (time < 0.1) {
      isTyping = false;
      displayTime.innerHTML = "";
      displayScore.innerHTML = `Score: ${score}`;
      wordInput.style.display = "none";
      startBtn.innerText = "Start";
      if (score > displayHighScore.innerHTML) {
        Storage.saveHighScore();
        displayHighScore.innerHTML = Storage.getHighScore();
        message.innerHTML = `<p class="text-success">New High Score!!</p>`;
      } else if (score < displayHighScore.innerHTML) {
        message.innerHTML = `<p class="text-danger">Time Up!!!</p>`;
      }
    }

    if (displayHighScore.innerHTML > Storage.getBestScore()) {
      Storage.saveBestScore();
    }
  }

  Restart() {
    wordInput.style.display = "block";
    wordInput.value = "";
    startBtn.innerText = "Next word";

    if (isTyping) {
      displayScore.innerHTML = `Score: ${score}`;
      matchedLetters.innerHTML = currentWord.innerHTML;
    } else {
      UI.showWord();
      displayScore.innerHTML = ``;
    }
    isTyping = false;
    if (score > displayHighScore.innerHTML && !isTyping) {
      Storage.saveHighScore();
      displayHighScore.innerHTML = Storage.getHighScore();
      message.innerHTML = `<p class="text-success">New High Score!!!</p>`;
    } else {
      message.innerHTML = "";
    }
    if (displayHighScore.innerHTML > Storage.getBestScore()) {
      Storage.saveBestScore();
    }
    displayTime.innerHTML = "";
    time = seconds.innerHTML;
    score = 0;
  }
}

class Storage {
  static saveHighScore() {
    localStorage.setItem("typingHighScore" + level, JSON.stringify(score));
  }

  static saveBestScore() {
    localStorage.setItem("typingHighScore", JSON.stringify(score));
  }

  static getBestScore() {
    if (localStorage.getItem("typingHighScore")) {
      highScore = JSON.parse(localStorage.getItem("typingHighScore"));
      return highScore;
    } else {
      localStorage.setItem("typingHighScore", JSON.stringify(0));
      highScore = JSON.parse(localStorage.getItem("typingHighScore"));

      return highScore;
    }
  }

  static getHighScore() {
    if (localStorage.getItem("typingHighScore" + level)) {
      highScore = JSON.parse(localStorage.getItem("typingHighScore" + level));
      return highScore;
    } else {
      highScore = score;
      return highScore;
    }
  }

  static resetHighScore() {
    resetBtn.addEventListener("click", () => {
      if (!isTyping) {
        score = 0;
        displayScore.innerHTML = ``;

        message.innerHTML = ` <p class="text-danger">Progress has reset!</p>`;
        localStorage.setItem("typingHighScore" + level, 0);
        displayHighScore.innerHTML = this.getHighScore();
      }
    });
  }

  static saveWords(words) {
    localStorage.setItem("words", JSON.stringify(words));
  }

  static getWords() {
    if (JSON.parse(localStorage.getItem("words"))) {
      return JSON.parse(localStorage.getItem("words"));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const item = new Items();
  item.getItems().then(words => {
    Storage.saveWords(words);
    UI.showWord();
  });
  displayHighScore.innerHTML = Storage.getHighScore();

  const app = new APP();
  app.setLevel();
  app.matchWords();
  setInterval(app.countDown, 100);
  Storage.resetHighScore();
  startBtn.addEventListener("click", () => {
    app.Restart();
  });
});
