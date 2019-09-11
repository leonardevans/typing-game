const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "gm6tqddphhfa",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "ig3t7ZfDycwfVihJaa47GVFQfVbqEG53fRkCj-5hvbM",
});

const minForm = document.getElementById("selectMin");
const selectedMin = document.getElementById("selectedMin");
const displayMin = document.querySelector("#minutes");
const startBtn = document.querySelector(".start-btn");
const currentWord = document.querySelector("#current-word");
const matchedLetters = document.querySelector("#matched-letters");
const wordInput = document.querySelector("#word-input");
const message = document.querySelector("#message");
const displayTime = document.querySelector(".time");
const displaySpeed = document.querySelector(".speed");
const displayTopSpeed = document.querySelector(".topSpeed");
const resetBtn = document.querySelector("#resetBtn");
const correct = new Audio();
correct.src = "../audio/correct.mp3";

let time = 60;
let selectedtime = 60;
let score = 0;
let isTyping = false;
let topSpeed = 0;
let speed = 0;
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
  setTime() {
    minForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!isTyping) {
        displaySpeed.innerHTML = "";
        message.innerHTML = "";
      } else {
        displayTime.innerHTML = "";
        startBtn.innerText = "Start";

        UI.showWord();
        if (speed > displayTopSpeed.innerHTML) {
          Storage.storeSpeed();
          displayTopSpeed.innerHTML = Storage.getSpeed();
          message.innerHTML = `<p class="text-success">New Top Speed!!!</p>`;
        } else {
          message.innerHTML = "";
        }
        isTyping = false;
      }
      wordInput.value = "";

      score = 0;

      wordInput.style.display = "block";
      selectedtime = selectedMin.value * 60;
      time = selectedMin.value * 60;
      displayMin.innerHTML = selectedMin.value;
      matchedLetters.innerHTML = currentWord.innerHTML;
    });
  }

  matchWords() {
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

        correct.play();
        UI.showWord();
        wordInput.value = "";

        this.matchWords();
      } else {
      }
    });
  }

  countDown() {
    if (isTyping === true && time >= 0.1) {
      time -= 0.1;
      speed = score / ((selectedtime - time) / 60);
      message.innerHTML = `<p class="text-primary">Typing...</p>`;

      displaySpeed.innerHTML = `Speed: ${speed.toFixed(1)} words/min`;
      if (time > 60) {
        let mins = (time / 60).toFixed(0);
        let seconds = time % 60;
        displayTime.innerHTML = `time: ${mins} mins ${seconds.toFixed(
          1
        )} seconds`;
      } else {
        displayTime.innerHTML = `time: ${time.toFixed(1)} seconds`;
      }
    }
    if (time < 0.1) {
      isTyping = false;
      displayTime.innerHTML = "";
      displaySpeed.innerHTML = `Speed: ${speed.toFixed(1)} words/min`;
      wordInput.style.display = "none";
      startBtn.innerText = "Start";
      if (speed > displayTopSpeed.innerHTML) {
        Storage.storeSpeed();
        displayTopSpeed.innerHTML = Storage.getSpeed();
        message.innerHTML = `<p class="text-success">New Top Speed!!!</p>`;
      } else if (speed < displayTopSpeed.innerHTML) {
        message.innerHTML = `<p class="text-danger">Time Up!!!</p>`;
      }
    } else {
      // displaySpeed.innerHTML = "";
    }
  }

  Restart() {
    startBtn.addEventListener("click", () => {
      if (!isTyping) {
        wordInput.style.display = "block";
        wordInput.value = "";
        displaySpeed.innerHTML = "";
        message.innerHTML = "";
        startBtn.innerText = "Next word";

        time = selectedMin.value * 60;
        UI.showWord();
        score = 0;
        speed = 0;
      } else {
        isTyping = false;
        startBtn.innerText = "Next word";
        displayTime.innerHTML = "";
        wordInput.value = "";
        matchedLetters.innerHTML = currentWord.innerHTML;
        time = selectedMin.value * 60;
        if (speed > displayTopSpeed.innerHTML) {
          Storage.storeSpeed();
          displayTopSpeed.innerHTML = Storage.getSpeed();
          message.innerHTML = `<p class="text-success">New Top Speed!!!</p>`;
        } else {
          message.innerHTML = "";
        }

        score = 0;
        speed = 0;
      }
    });
  }
}

class Storage {
  static storeSpeed() {
    localStorage.setItem("topSpeedPerMin", JSON.stringify(speed.toFixed(1)));
  }

  static getSpeed() {
    if (localStorage.getItem("topSpeedPerMin")) {
      topSpeed = JSON.parse(localStorage.getItem("topSpeedPerMin"));
    } else {
      topSpeed = score;
    }
    return topSpeed;
  }

  static resetTopSpeed() {
    resetBtn.addEventListener("click", () => {
      if (!isTyping) {
        score = 0;
        speed = 0;
        displaySpeed.innerHTML = ``;

        message.innerHTML = ` <p class="text-danger">Progress has reset!</p>`;
        localStorage.setItem("topSpeedPerMin", 0);
        displayTopSpeed.innerHTML = this.getSpeed().toFixed(1);
      }
    });
  }

  static saveWords(words) {
    localStorage.setItem("words", JSON.stringify(words));
  }

  static getWords() {
    return JSON.parse(localStorage.getItem("words"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wordInput.value = "";

  const item = new Items();
  item.getItems().then(words => {
    Storage.saveWords(words);
    UI.showWord();
  });
  displayTopSpeed.innerHTML = Storage.getSpeed();
  const app = new APP();
  app.setTime();
  app.matchWords();
  setInterval(app.countDown, 100);
  app.Restart();
  Storage.resetTopSpeed();
});
