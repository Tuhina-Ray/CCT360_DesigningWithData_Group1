const apiURL =
  "https://api.open-meteo.com/v1/forecast?latitude=43.5789&longitude=-79.6583&daily=sunrise,sunset,moon_phase&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain,showers,snowfall,cloud_cover&timezone=auto";

const radio = document.querySelector(".radio-image");

const tracks = [
    "sounds/LofiTrackOne.mp3",
    "sounds/LofiTrackTwo.mp3",
    "sounds/LofiTrackThree.mp3"
];

const ambienceButton = document.getElementById("ambience-toggle");


//WEATHER API DATA 
  async function getWeather() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const current = data.current;
        latestWeather = current;

        latestCurrent = current;
        latestDaily = data.daily;

        if (ambienceEnabled) {
            updateAmbience(current);
        }

        // update clock
        updateClock(data.timezone);

        // update weather animations
        updateWeatherScene(current, data.daily);

    } catch (error) {
        console.error("Error retrieving weather data:", error);
    }
}


//TIME DATA

function updateClock(timezone) {

    function displayTime() {
        const now = new Date();

        document.getElementById("date").textContent =
            now.toLocaleDateString("en-CA", {
                timeZone: timezone,
                // weekday: "long",
                // year: "numeric",
                month: "long",
                day: "numeric"
            });

        document.getElementById("time").textContent =
            now.toLocaleTimeString("en-US", {
                timeZone: timezone,
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
    }

    displayTime();
    setInterval(displayTime, 1000);
}

getWeather();


//RADIO
let currentTrack = -1;
let audio = null;

radio.addEventListener("click", function() {

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    currentTrack++;

    if (currentTrack >= tracks.length) {
        currentTrack = -1;
        audio = null;
        return;
    }
    audio = new Audio(tracks[currentTrack]);
    audio.loop = true;
    audio.volume = .3;
    audio.play();

});


//get time of the day for weather visuals
function getTimePhase(current, daily) {
    const now = new Date(current.time);

    const sunrise = new Date(daily.sunrise[0]);
    const sunset = new Date(daily.sunset[0]);

    const minsUntilSunrise = (sunrise - now) / 60000;  // positive: event is still coming; 0: happening; negative: event has passed
    const minsUntilSunset = (sunset - now) / 60000;

    // 30 mins before/after sunrise
    if (minsUntilSunrise >= -30 && minsUntilSunrise <= 30) {
        return "sunrise";
    }

    // 30 mins before/after sunset
    if (minsUntilSunset >= -30 && minsUntilSunset <= 30) {
        return "sunset";
    }

    if (current.is_day === 1) {
        return "day";
    }

    return "night";
}

//check weather 
function getWeatherCondition(current) {

    if (current.snowfall > 0) {
        return "snow";
    }

    if (current.rain > 0 || current.showers > 0) {
        return "rain";
    }

    if (current.cloud_cover >= 60) {
        return "cloudy"
    }

    return "clear";
}

// WEATHER VISUALS
function updateWeatherScene(current, daily) {
    const weatherView = document.getElementById("weather-view");

    const weather = getWeatherCondition(current);
    const time = getTimePhase(current, daily);
    // testing
    // const weather = "clear";
    // const time = "sunrise";

    // scene conditions
    weatherView.dataset.weather = weather;  // html attribute: data-weather
    weatherView.dataset.time = time;  // data-time

    // clear any previous animations
    weatherView.innerHTML = "";

    // sun
    if (time !== "night") {
        const sun = document.createElement("div");
        sun.className = "sun";

        weatherView.appendChild(sun);
    }

    // moon and stars
    if (time === "night") {
        const moon = document.createElement("div");
        moon.className = "moon";

        weatherView.appendChild(moon);

        // create stars
        for (let i = 0; i < 30; i++) {
            const star = document.createElement("div");
            star.className = "star";

            star.style.left = Math.random() * 100 + "%";
            star.style.top = Math.random() * 65 + "%";

            star.style.animationDelay =
                Math.random() * 3 + "s";

            weatherView.appendChild(star);
        }
    }

    // clouds
    if (weather === "cloudy" || weather === "rain" || weather === "snow" || current.cloud_cover >= 25) {
        for (let i = 0; i < 2; i++) {
            const cloud = document.createElement("div");
            cloud.className = "cloud " + (i === 0 ? "one" : "two");

            weatherView.appendChild(cloud);
        }
    }

    // rain
    if (weather === "rain") {
        for (let i = 0; i < 65; i++) {
            const drop = document.createElement("div");
            drop.className = "raindrop";

            drop.style.left = Math.random() * 100 + "%";
            drop.style.animationDuration = (0.4 + Math.random() * 0.7) + "s";
            drop.style.animationDelay = Math.random() * 2 + "s";

            weatherView.appendChild(drop);
        }
    }
    
    // snow
    if (weather === "snow") {
        for (let i = 0; i < 35; i++) {
            const snow = document.createElement("div");

            snow.className = "snowflake";
            snow.textContent = "❄";

            snow.style.left = Math.random() * 100 + "%";
            snow.style.setProperty("--fall-distance", weatherView.clientHeight + 30 + "px");
            snow.style.animationDuration = (4 + Math.random() * 6) + "s";
            snow.style.animationDelay = Math.random() * 5 + "s";
            snow.style.fontSize = (7 + Math.random() * 9) + "px";

            weatherView.appendChild(snow);
        }
    }
}

let ambienceEnabled = false;
let latestWeather = null;
let ambienceAudio = [];

let latestCurrent = null;
let latestDaily = null;


// Ambience button
ambienceButton.addEventListener("click", function() {

    ambienceEnabled = !ambienceEnabled;

    if (ambienceEnabled && latestCurrent && latestDaily) {

        const time = getTimePhase(latestCurrent, latestDaily);
        const weather = getWeatherCondition(latestCurrent);


        //Testing sounds 
        // const time = "morning";
        // const weather = "clear";


        // TIME SOUNDS
        if (time === "day" || time === "sunrise") {
            playSound("sounds/birds.mp3", 0.15);
            playSound("sounds/wind.mp3", 0.15);
        }
        else if (time === "night" || time === "sunset") {
            playSound("sounds/crickets.mp3", 0.05);
            playSound("sounds/wind.mp3", 0.15);
        }


        // WEATHER SOUNDS
        if (weather === "rain") {
            playSound("sounds/rain.mp3", 0.4);
            
        }
        else if (weather === "snow") {
            playSound("sounds/snowfall.mp3", 0.3);
        }
    }

    else {
        ambienceAudio.forEach(audio => audio.pause());
        ambienceAudio = [];
    }

    ambienceButton.textContent = ambienceEnabled
        ? "Turn ambience off"
        : "Turn ambience on";
});

function playSound(file, volume) {

    const audio = new Audio(file);

    audio.volume = volume;
    audio.loop = true;
    audio.play();

    ambienceAudio.push(audio);
}



//POMODORO TIMER//
const timerDurations = {
    focus: 25,
    short: 5,
    long: 15
};

let currentMode = "focus";

let remainingSeconds = timerDurations.focus * 60;
let timerInterval = null;
let timerRunning = false;

const timerDisplay = document.getElementById("timer-display");
const timerStatus = document.getElementById("timer-status");
const startPauseBtn = document.getElementById("start-pause");
const resetBtn = document.getElementById("reset-timer");
const progressFill = document.getElementById("timer-progress-fill");

const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("timer-settings");
const closeSettings = document.getElementById("close-settings");

const alarmSound = new Audio("sounds/alarm.mp3");
alarmSound.volume = 0.5;

function updateTimerDisplay() {

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    
    const totalSeconds = timerDurations[currentMode] * 60;

    const progress =
        ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

    progressFill.style.width = progress + "%";
}



function updateTimerStatus() {

    if (timerRunning) {
        timerStatus.textContent = "RUNNING";
    }

    else {
        timerStatus.textContent = "PAUSED";
    }
}


function startTimer() {

    if (timerRunning) return;

    if (remainingSeconds <= 0) return;

    timerRunning = true;

    startPauseBtn.textContent = "PAUSE";
    updateTimerStatus();

    timerInterval = setInterval(function() {

        remainingSeconds--;

        updateTimerDisplay();

        
        if (remainingSeconds <= 0) {

            clearInterval(timerInterval);

            timerRunning = false;

            startPauseBtn.textContent = "START";

            timerStatus.textContent = "COMPLETED";

            alarmSound.currentTime = 0;

            alarmSound.play().catch(error => {
                console.log("Alarm playback was blocked:", error);
            });

        }

    }, 1000);
}


function pauseTimer() {

    clearInterval(timerInterval);

    timerRunning = false;

    startPauseBtn.textContent = "RESUME";

    updateTimerStatus();
}


startPauseBtn.addEventListener("click", function() {

    alarmSound.pause();
    alarmSound.currentTime = 0;

    if (timerRunning) {
        pauseTimer();
    }

    else {
        startTimer();
    }

});


resetBtn.addEventListener("click", function() {


    clearInterval(timerInterval);

    alarmSound.pause();
    alarmSound.currentTime = 0;

    timerRunning = false;

    remainingSeconds = timerDurations[currentMode] * 60;

    startPauseBtn.textContent = "START";

    timerStatus.textContent = "READY";

    updateTimerDisplay();

});

document.querySelectorAll(".mode-btn").forEach(button => {

    button.addEventListener("click", function() {

        alarmSound.pause();
        alarmSound.currentTime = 0;
        clearInterval(timerInterval);

        timerRunning = false;

        currentMode = this.dataset.mode;

        remainingSeconds = timerDurations[currentMode] * 60;

        document.querySelectorAll(".mode-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        startPauseBtn.textContent = "START";

        timerStatus.textContent = "READY";

        updateTimerDisplay();

    });

});

settingsToggle.addEventListener("click", function() {

    alarmSound.pause();
    alarmSound.currentTime = 0;
    settingsPanel.classList.remove("hidden");

});


closeSettings.addEventListener("click", function() {

    settingsPanel.classList.add("hidden");

});

document.querySelectorAll(".duration-btn").forEach(button => {

    button.addEventListener("click", function() {

        const mode = this.dataset.mode;
        const change = Number(this.dataset.change);

        timerDurations[mode] = Math.max(
            1,
            Math.min(120, timerDurations[mode] + change)
        );

        document.getElementById(mode + "-duration").textContent =
            timerDurations[mode];

        
        if (mode === currentMode) {

            clearInterval(timerInterval);

            timerRunning = false;

            remainingSeconds = timerDurations[currentMode] * 60;

            startPauseBtn.textContent = "START";

            timerStatus.textContent = "READY";

            updateTimerDisplay();

        }

    });

});

updateTimerDisplay();



/* DECOR INTERACTIONS*/

const pageSound = new Audio("sounds/page-flip.mp3");
const plantSound = new Audio("sounds/plant-rustle.mp3");
const lampSound = new Audio("sounds/lamp-click.mp3");
const ledSound = new Audio("sounds/lamp-click.mp3");


// QUOTE OF THE DAY

const book = document.getElementById("book");
const quoteOverlay = document.getElementById("quote-overlay");
const quoteText = document.getElementById("daily-quote");
const closeNote = document.getElementById("close-note");

const quotes = [
    "It always seems impossible until it's done.",
    "Small steps every day lead to big changes.",
    "You are allowed to slow down and take a breath.",
    "Believe you can and you're halfway there.",
    "Progress, not perfection.",
    "The secret of getting ahead is getting started.",
    "Rest is productive too.",
    "You don't have to have it all figured out today."
];

// Select a quote based on the date
function getDailyQuote() {
    const today = new Date();
    const dayNumber = Math.floor(
        today.getTime() / (1000 * 60 * 60 * 24)
    );

    return quotes[dayNumber % quotes.length];
}

book.addEventListener("click", function() {

    pageSound.currentTime = 0;
    pageSound.play();

    quoteText.textContent = '"' + getDailyQuote() + '"';

    quoteOverlay.classList.remove("hidden");
});

closeNote.addEventListener("click", function() {
    quoteOverlay.classList.add("hidden");
});


// PLANT - SWAY 

const plant = document.getElementById("plant");

plant.addEventListener("click", function() {

    plantSound.currentTime = 0;
    plantSound.play();

    plant.classList.remove("sway");

    void plant.offsetWidth;

    plant.classList.add("sway");
});


// LAMP - ON/OFF GLOW

const lamp = document.getElementById("lamp");
const lampGlow = document.getElementById("lamp-glow");

let lampOn = false;

lamp.addEventListener("click", function() {

    lampOn = !lampOn;

    lampSound.currentTime = 0;
    lampSound.play();

    lampGlow.classList.toggle("active", lampOn);

    
    document.querySelector(".scene").classList.toggle(
        "lamp-on",
        lampOn
    );
});


// LED - DISCO LIGHT

const led = document.getElementById("led");
const roomLighting = document.getElementById("room-lighting");

let ledOn = false;

led.addEventListener("click", function() {

    ledOn = !ledOn;

    ledSound.currentTime = 0;
    ledSound.play();

    roomLighting.classList.toggle("active", ledOn);

    led.src = ledOn
        ? "images/led-on.png"
        : "images/led-off.png";
});
