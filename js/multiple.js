const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "gm6tqddphhfa",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "ig3t7ZfDycwfVihJaa47GVFQfVbqEG53fRkCj-5hvbM",
});
window.addEventListener("load", init);

const startBtn = document.querySelector(".start-btn");
const currentText = document.querySelector(".text");
const matchedText = document.querySelector(".matched-text");
const textInput = document.querySelector("#text-input");
const message = document.querySelector("#message");
const displayTime = document.querySelector(".time");
const displayRating = document.querySelector(".rating");
const displayTopRating = document.querySelector(".top-rating");
const nextTextBtn = document.querySelector(".next-text-btn");
const correct = new Audio();
correct.src = "../audio/correct.mp3";

let isTyping;
let time = 0;
let rating = 0;
let topRating = 0;
let matched;
let randIndex;

let texts = [];

class Items {
  async getItems() {
    try {
      let contentful = await client.getEntries({
        content_type: "typingGame",
      });

      texts = contentful.items[0].fields.wordsAndTexts.texts;

      return texts;
    } catch (error) {
      console.log(error);
    }
  }
}

function checkStatus() {
  if (isTyping === true) {
    nextTextBtn.innerText = "Restart";
    message.innerHTML = `<p class="text-primary">Typing...</p>`;
  } else {
    nextTextBtn.innerText = "Next Text";
  }
}

function matchText() {
  isTyping = true;

  if (
    textInput.value === currentText.innerHTML.slice(0, textInput.value.length)
  ) {
    matched = currentText.innerHTML.slice(0, textInput.value.length);
    let currentTextMatched = currentText.innerHTML;
    matchedText.innerHTML = currentTextMatched.replace(
      matched,
      `<span class="text-success">${matched}</span>`
    );
  }

  if (textInput.value === currentText.innerHTML) {
    message.innerHTML = `<p class="text-success">Correct!!</p>`;
    correct.play();
    showText();
    textInput.value = "";
    displayTime.innerHTML = ``;

    return (isTyping = false);
  }
}

function showText() {
  let texts = Storage.getTexts();
  // generate random index
  randIndex = Math.floor(Math.random() * texts.length);

  // output a random text
  currentText.innerHTML = texts[randIndex].trim();
  matchedText.innerHTML = texts[randIndex].trim();
}

function countTime() {
  if (isTyping) {
    time += 0.1;
    if (matched) {
      rating = (matched.length / time).toFixed(1);
    }
    message.innerHTML = "";
    displayRating.innerHTML = `Speed: <span>${rating}</span> characters/s`;
    if (time > 60) {
      let mins = (time / 60).toFixed(0);
      let seconds = time % 60;
      displayTime.innerHTML = `time: ${mins} mins ${seconds.toFixed(
        1
      )} seconds`;
    } else {
      displayTime.innerHTML = `time: ${time.toFixed(1)} seconds`;
    }
  } else {
    saveRating(rating);
    score = 0;
    speed = 0;
    time = 0;
  }
}

function saveRating(rating) {
  if (!localStorage.getItem("topRating")) {
    topRating = rating;
    localStorage.setItem("topRating", JSON.stringify(topRating));
  } else {
    topRating = JSON.parse(localStorage.getItem("topRating"));
    if (rating > topRating) {
      topRating = rating;
      localStorage.setItem("topRating", JSON.stringify(topRating));
      message.innerHTML = `<p class="text-success">New Top Speed!!</p>`;
    } else {
      message.innerHTML = ``;
    }
  }
  displayTopRating.innerHTML = `Top Speed: <span>${topRating}</span> characters/s.`;
}

function resetTopRating() {
  if (!isTyping) {
    rating = 0;
    localStorage.setItem("topRating", 0);
    displayTime.innerHTML = "";
    displayRating.innerHTML = "";
    message.innerHTML = `<p class="text-danger">Progress has reset!</p>`;
    topRating = JSON.parse(localStorage.getItem("topRating"));
    displayTopRating.innerHTML = `Top Speed: <span>${topRating}</span> characters/s.`;
  }
}

function Restart() {
  nextTextBtn.addEventListener("click", () => {
    if (!isTyping) {
      showText();
      message.innerHTML = "";
      displayRating.innerHTML = "";
    } else {
      displayRating.innerHTML = `Speed: <span>${rating}</span> characters/s`;

      saveRating(rating);
      score = 0;
      speed = 0;
      time = 0;

      isTyping = false;
    }
    matchedText.innerHTML = currentText.innerHTML;
    textInput.value = "";
    displayTime.innerHTML = "";

    rating = 0;
  });
}

class Storage {
  static saveTexts(texts) {
    localStorage.setItem("texts", JSON.stringify(texts));
  }

  static getTexts() {
    return JSON.parse(localStorage.getItem("texts"));
  }
}

function init() {
  const item = new Items();
  item.getItems().then(texts => {
    Storage.saveTexts(texts);
    showText();
  });
  textInput.addEventListener("input", matchText);
  setInterval(countTime, 100);
  Restart();
  setInterval(checkStatus, 100);
}
