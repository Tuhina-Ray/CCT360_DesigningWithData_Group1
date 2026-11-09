const apiURL =
  "https://api.open-meteo.com/v1/forecast?latitude=43.5789&longitude=-79.6583&daily=sunrise,sunset,moon_phase&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain,showers,snowfall,cloud_cover&timezone=auto";

  async function getWeather() {
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const current = data.current;

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