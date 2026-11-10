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

        if (ambienceEnabled) {
            updateAmbience(current);
        }

        //this is just for checking the info, delete later 
        updateClock(data.timezone);

        document.getElementById("temperature").textContent = "Temperature: " + current.temperature_2m + " °C";

        document.getElementById("daylight").textContent = "Day or night: " + (current.is_day === 1 ? "Day" : "Night");

        document.getElementById("precipitation").textContent = "Precipitation: " + current.precipitation + " mm";

        document.getElementById("rain").textContent = "Rain: " + current.rain + " mm";

        document.getElementById("showers").textContent = "Showers: " + current.showers + " mm";

        document.getElementById("snowfall").textContent = "Snowfall: " + current.snowfall + " cm";

        document.getElementById("cloud-cover").textContent = "Cloud cover: " + current.cloud_cover + "%";

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


// AMBIENCE (SOUNDS) BASED ON WEATHER AND TIME OF DAY 

//check time of day
function getTimeOfDay() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "morning";
    } 

    if (hour >= 12 && hour < 21) {
        return "midday";
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

    return "clear";
}

let ambienceEnabled = false;
let latestWeather = null;
let ambienceAudio = [];


// Ambience button
ambienceButton.addEventListener("click", function() {

    ambienceEnabled = !ambienceEnabled;

    if (ambienceEnabled && latestWeather) {

        const time = getTimeOfDay();
        const weather = getWeatherCondition(latestWeather);


        //Testing sounds 
        // const time = "night";
        // const weather = "rain";


        // TIME SOUNDS
        if (time === "morning") {
            playSound("sounds/birds.mp3", 0.15);
            playSound("sounds/wind.mp3", 0.15);
        }
        else if (time === "midday") {
            playSound("sounds/birds.mp3", 0.25);
            playSound("sounds/wind.mp3", 0.15);
        }
        else if (time === "night") {
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