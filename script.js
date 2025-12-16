let map;
let score = 0;
let questionIndex = 0;
let timer;
const answerRadius = 50; // radius for acceptable "correct" area

let circles = [];
let answerListener = null;

const cleanMap = [
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] }, // hides icons
    { elementType: "labels.text", stylers: [{ visibility: "off" }] } // hides all text
];

// locations
const quizLocations = [
    { name: "Campus Store Complex", lat: 34.23739407998101, lng: -118.5281702483961},
    { name: "Sierra Hall", lat: 34.23829392881682, lng: -118.53072010584509},
    { name: "Oasis Wellness Center", lat: 34.239634859245534, lng: -118.52585849407336 }, // required location
    { name: "Parking Structure B3", lat: 34.23823074370934, lng: -118.53228589881142},
    { name: "Magnolia Hall", lat: 34.23944208879406, lng: -118.52828396955027},
];

// initial map
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 34.23848796131739, lng: -118.5293193756668},
        zoom: 17,
        gestureHandling: "none", // disable panning/zooming
        zoomControl: false, // removes zoom controls
        streetViewControl: false, // removes street view controls
        mapTypeControl: false, // removes map type controls
        fullscreenControl: false, // removes full screen control
        cameraControl: false, // removes camera controls
        keyboardShortcuts: false, // removes keyboard shortcut icon
        styles: cleanMap
    });
}

function startGame() {
    // resets circles
    circles.forEach(circle => circle.setMap(null));
    circles = [];

    // reset game state
    score = 0;
    questionIndex = 0;
    secondsElapsed = 0;
    document.getElementById("qa").innerHTML = "";
    document.getElementById("score").textContent = "";

    document.getElementById("timerContainer").style.visibility = "visible"; // show timer
    document.getElementById("timer").textContent = "0s";

    // hide button
    const playButton = document.getElementById("playButton");
    playButton.style.display = "none";

    startTimer(); // start timer
    nextQuestion(); // start first question

    answerListener = map.addListener("dblclick", handleAnswer); // double-click on map
}

// start timer
function startTimer() {
    timer = setInterval(() => {
        secondsElapsed++;
        document.getElementById("timer").textContent = `${secondsElapsed}s`;
    }, 1000);
}

// stop timer
function stopTimer() {
    clearInterval(timer);
}

// next question
function nextQuestion() {
    const q = quizLocations[questionIndex];
    document.getElementById("qa").innerHTML += `<p>Where is ${q.name}</p>`;
}

// check answer
function handleAnswer(event) {
    const userLatLng = event.latLng; // user clicked location
    const correctLatLng = new google.maps.LatLng(quizLocations[questionIndex].lat, quizLocations[questionIndex].lng);

    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, correctLatLng); // calculates distance

    // draw circle
    const circle = new google.maps.Circle({
        strokeColor: distance <= answerRadius ? "green" : "red",
        strokeWeight: 2,
        fillColor: distance <= answerRadius ? "lightgreen" : "pink",
        fillOpacity: 0.5,
        center: correctLatLng,
        radius: answerRadius,
        map: map
    });
    circles.push(circle);

    const isCorrect = distance <= answerRadius;

    if (isCorrect)
        score++;

    document.getElementById("qa").innerHTML += `<p><span style="color:${isCorrect ? 'green' : 'red'}">${isCorrect ? 'Correct' : 'Incorrect'}</span></p>`;

    questionIndex++;

    if (questionIndex < quizLocations.length)
        nextQuestion();
    else
        endGame();
}

function endGame() {
    stopTimer();
    document.getElementById("score").textContent = `${score} Correct, (${5 - score} Incorrect)`; // shows results

    // show button again
    const playButton = document.getElementById("playButton");
    playButton.style.display = "inline-block";
    playButton.textContent = "Play Again";

    // resets listener
    if (answerListener) {
        google.maps.event.removeListener(answerListener);
        answerListener = null;
    }
}

document.getElementById("playButton").addEventListener("click", startGame);
window.initMap = initMap;
