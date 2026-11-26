document.addEventListener("DOMContentLoaded", function () {
    //  Grabing elements
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const currentDate = document.getElementById('currentDate');
    const currentTime = document.getElementById('currentTime');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const tempEl = document.getElementById('temperatureNumber');
    const cityName = document.getElementById("cityName");
    const weatherCondition = document.getElementById("weatherCondition");
    const humidity = document.getElementById("humidity");
    const windSpeed = document.getElementById("windSpeed");
    const sunrise = document.getElementById("sunrise");
    const sunset = document.getElementById("sunset");
    const visibilityEl = document.getElementById("visibility");
    const pressure = document.getElementById("pressure");
    const precipEl = document.getElementById("precipitation");
    const cloudCoverEl = document.getElementById("cloudCover");
    const mapContainer = document.getElementById("mapContainer");
    const layerTempBtn = document.getElementById("layerTemp");
    const layerCloudsBtn = document.getElementById("layerClouds");
    const layerWindBtn = document.getElementById("layerWind");
    const layerPrecipBtn = document.getElementById("layerPrecip");
    const assistantConversation = document.getElementById("assistantConversation");
    const assistantInput = document.getElementById("assistantInput");
    const assistantSend = document.getElementById("assistantSend");
    const permission = document.getElementById("permissionSection");
    const permissionBtn = document.getElementById("permissionBtn");
    const manualBtn = document.getElementById("manualBtn");
    const forecastContainer = document.getElementById("forecastContainer");
    const feelsLikeText = document.getElementById("feelsLikeText");
    const alertText = document.getElementById("alertText");
    const clothingSuggestion = document.getElementById("clothingSuggestion");
    const aqiValue = document.getElementById("aqiValue");
    const aqiStatus = document.getElementById("aqiStatus");
    const tempChartCanvas = document.getElementById("tempChart");
    const compareCity1 = document.getElementById("compareCity1");
    const compareCity2 = document.getElementById("compareCity2");
    const compareBtn = document.getElementById("compareBtn");
    const compareResult1 = document.getElementById("compareResult1");
    const compareResult2 = document.getElementById("compareResult2");
    const historyList = document.getElementById("historyList");
    const languageSelect = document.getElementById("languageSelect");
    const joggingTime = document.getElementById("joggingTime");
    const cyclingTime = document.getElementById("cyclingTime");
    const picnicTime = document.getElementById("picnicTime");
    const predictiveText = document.getElementById("predictiveText");
    const alertsText = document.getElementById("alertsText");
    const moodSuggestion = document.getElementById("moodSuggestion");

    const api_key = "08236e34a4ac5a0696a67209e661143a"; // api key here
    let currentCoords = null;
    let lastWeather = null;
    let weatherMap = null;
    let baseMapLayer = null;
    let currentOverlayLayer = null;
    let tempChart = null;
    let lastForecast = null;
    let locationMarker = null;
    let currentLang = "en";
    let currentLocale = "en-IN";
    let mapClickHandlerBound = false;

    // theme switcher
    let currentTheme = 'dark';
    body.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', currentTheme);
    });

    // language switcher
    if (languageSelect) {
        languageSelect.value = currentLang;
        languageSelect.addEventListener("change", () => {
            currentLang = languageSelect.value || "en";
            if (currentLang === "hi") currentLocale = "hi-IN";
            else if (currentLang === "kn") currentLocale = "kn-IN";
            else currentLocale = "en-IN";

            // refresh current weather/forecast if we have coordinates
            if (currentCoords && typeof currentCoords.lat === "number" && typeof currentCoords.lon === "number") {
                fetchWeatherByCoords(currentCoords.lat, currentCoords.lon)
                    .then(showWeatherDetails)
                    .catch(() => { });
            }
        });
    }

    // update clock every second
    function updateDateTime() {
        const now = new Date();
        const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString(currentLocale, dateOpts);
        const timeStr = now.toLocaleTimeString(currentLocale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        currentDate.textContent = dateStr;
        currentTime.textContent = timeStr;
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // get user location
    permissionBtn.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            saveCodes(latitude, longitude);
            try {
                let weatherData = await fetchWeatherByCoords(latitude, longitude);
                console.log(weatherData);
                showWeatherDetails(weatherData);
                currentCoords = { lat: latitude, lon: longitude };
                updateMap(latitude, longitude);
                fetchMoonTimes(latitude, longitude);
                permission.style.display = 'none';
            } catch (error) {
                console.log("Unable to fetch weather data for your location.");
            }
        }, (error) => {
            throw new error("Location access denied. Please use manual city search.");
        }
        );
    });

    // fetch weather by using codinates
    async function fetchWeatherByCoords(lat, lon) {
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${currentLang}&appid=${api_key}`;
        let request = await fetch(url);
        if (!request.ok) {
            throw new Error("Unable to fetch weather data for your location.");
        }
        let data = await request.json()
        return data;
    }

    // manual city add
    manualBtn.addEventListener('click', () => {
        permission.style.display = 'none';
    });

    // search functionality - Api fetching
    async function handleSearch() {
        const query = searchInput.value.trim();
        if (query === "") return
        try {
            let weatherData = await fechweatherdeta(query);
            console.log(weatherData);
            showWeatherDetails(weatherData);
            if (weatherData.coord && typeof weatherData.coord.lat === "number" && typeof weatherData.coord.lon === "number") {
                currentCoords = { lat: weatherData.coord.lat, lon: weatherData.coord.lon };
                updateMap(currentCoords.lat, currentCoords.lon);
                fetchMoonTimes(currentCoords.lat, currentCoords.lon);
            }

        } catch (error) {
            throw new Error("city con'n found");
        }
        async function fechweatherdeta(city) {
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=${currentLang}&appid=${api_key}`;
            let request = await fetch(url);

            if (!request.ok) {
                throw new Error("city con'n found");
            };
            let deta = await request.json()
            return deta;
        }
        searchInput.value = "";
    }
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });


    // Showing weather details
    function showWeatherDetails(data) {
        let { main, weather, name, wind, visibility, sys, rain, snow, clouds, coord } = data;
        lastWeather = data;

        animateTemp(tempEl, main.temp, 2000);
        if (feelsLikeText && typeof main.feels_like === "number") {
            feelsLikeText.textContent = `Feels like ${Math.round(main.feels_like)}°C`;
        }
        cityName.textContent = name;
        weatherCondition.textContent = weather[0].description;
        humidity.textContent = main.humidity;
        windSpeed.textContent = wind.speed;
        sunrise.textContent = sundetails(sys.sunrise);
        sunset.textContent = sundetails(sys.sunset);
        pressure.textContent = main.pressure;
        visibilityEl.textContent = `${visibility / 1000} km`; // convert to km

        // precipitation (mm)
        let precipMm = 0;
        if (rain && typeof rain["1h"] === "number") precipMm += rain["1h"];
        else if (rain && typeof rain["3h"] === "number") precipMm += rain["3h"];
        if (snow && typeof snow["1h"] === "number") precipMm += snow["1h"];
        else if (snow && typeof snow["3h"] === "number") precipMm += snow["3h"];
        if (precipEl) {
            precipEl.textContent = `${precipMm.toFixed(1)} mm`;
        }

        // cloud cover
        if (cloudCoverEl) {
            const cover = clouds && typeof clouds.all === "number" ? clouds.all : 0;
            cloudCoverEl.textContent = `${cover}%`;
        }

        // alerts and clothing suggestions
        updateAlertsAndClothing(main, wind, precipMm);

        // save to simple history
        saveHistoryEntry(name, main.temp);

        // mood suggestion
        updateMoodSuggestion(data);

        // coords for map / additional data
        if (coord && typeof coord.lat === "number" && typeof coord.lon === "number") {
            currentCoords = { lat: coord.lat, lon: coord.lon };
            updateMap(coord.lat, coord.lon);
            fetchFiveDayForecast(coord.lat, coord.lon);
            fetchAQI(coord.lat, coord.lon);
        } else if (currentCoords) {
            updateMap(currentCoords.lat, currentCoords.lon);
            fetchFiveDayForecast(currentCoords.lat, currentCoords.lon);
            fetchAQI(currentCoords.lat, currentCoords.lon);
        }
    }

    // animate temp number on load - looks cool
    function animateTemp(target, endValue, duration) {
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const progress = currentTime - startTime;
            const value = Math.min(Math.floor((progress / duration) * endValue), endValue);
            target.textContent = value;
            if (value < endValue) {
                requestAnimationFrame(animation);
            }
        }
        requestAnimationFrame(animation);
    }


    // sunries and sunset time 
    function sundetails(ries) {
        // Validate inputs
        if (typeof ries !== 'number') return 'N/A';

        // sys.sunrise/sys.sunset are UTC unix seconds; timezone is offset in seconds.
        const utcMillis = ries * 1000;
        const localTime = new Date(utcMillis);

        return localTime.toLocaleTimeString(currentLocale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    // saving the code for future use
    function saveCodes(lat, lon) {
        localStorage.setItem('latitude', JSON.stringify(lat));
        localStorage.setItem('longitude', JSON.stringify(lon));
    }

    // using saved codes for showing weather 
    async function loadSavedLocation() {
        const savedLat = JSON.parse(localStorage.getItem('latitude'));
        const savedLon = JSON.parse(localStorage.getItem('longitude'));
        if (savedLat && savedLon) {
            try {
                let weatherData = await fetchWeatherByCoords(savedLat, savedLon);
                console.log(weatherData);
                showWeatherDetails(weatherData);
                currentCoords = { lat: savedLat, lon: savedLon };
                updateMap(savedLat, savedLon);
                fetchAQI(savedLat, savedLon);
                permission.style.display = 'none';
            } catch (error) {
                console.log("Unable to fetch weather data for your location.");
            }
        }
    }
    loadSavedLocation();

    // layer buttons click handlers
    function setupLayerButtons() {
        if (layerTempBtn) {
            layerTempBtn.dataset.layer = "temp";
            layerTempBtn.addEventListener("click", () => {
                ensureMap(currentCoords?.lat, currentCoords?.lon);
                setWeatherLayer("temp");
            });
        }
        if (layerCloudsBtn) {
            layerCloudsBtn.dataset.layer = "clouds";
            layerCloudsBtn.addEventListener("click", () => {
                ensureMap(currentCoords?.lat, currentCoords?.lon);
                setWeatherLayer("clouds");
            });
        }
        if (layerWindBtn) {
            layerWindBtn.dataset.layer = "wind";
            layerWindBtn.addEventListener("click", () => {
                ensureMap(currentCoords?.lat, currentCoords?.lon);
                setWeatherLayer("wind");
            });
        }
        if (layerPrecipBtn) {
            layerPrecipBtn.dataset.layer = "precip";
            layerPrecipBtn.addEventListener("click", () => {
                ensureMap(currentCoords?.lat, currentCoords?.lon);
                setWeatherLayer("precip");
            });
        }
    }
    setupLayerButtons();

    // map + weather layers (Leaflet + OpenWeather tiles)
    function ensureMap(lat, lon) {
        if (!mapContainer || !window.L) return;
        const centerLat = typeof lat === "number" ? lat : 20;
        const centerLon = typeof lon === "number" ? lon : 0;

        if (!weatherMap) {
            weatherMap = L.map(mapContainer).setView([centerLat, centerLon], 5);
            baseMapLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap"
            });
            baseMapLayer.addTo(weatherMap);

            if (!mapClickHandlerBound) {
                mapClickHandlerBound = true;
                weatherMap.on("click", async (e) => {
                    const { lat, lng } = e.latlng;
                    try {
                        const clickWeather = await fetchWeatherByCoords(lat, lng);
                        showWeatherDetails(clickWeather);
                        if (window.L) {
                            const temp = Math.round(clickWeather.main?.temp ?? 0);
                            const desc = clickWeather.weather?.[0]?.description || "";
                            L.popup()
                                .setLatLng([lat, lng])
                                .setContent(`Temp: ${temp}°C<br>${desc}`)
                                .openOn(weatherMap);
                        }
                    } catch (err) {
                        console.log("Unable to load weather for clicked point.", err);
                    }
                });
            }
        } else if (typeof lat === "number" && typeof lon === "number") {
            weatherMap.setView([lat, lon], 7);
        }
    }

    function setWeatherLayer(layerKey) {
        if (!weatherMap || !api_key) return;

        const layerNames = {
            temp: "temp_new",
            clouds: "clouds_new",
            wind: "wind_new",
            precip: "precipitation_new"
        };

        const tileName = layerNames[layerKey];
        if (!tileName) return;

        if (currentOverlayLayer) {
            weatherMap.removeLayer(currentOverlayLayer);
            currentOverlayLayer = null;
        }

        const url = `https://tile.openweathermap.org/map/${tileName}/{z}/{x}/{y}.png?appid=${api_key}`;
        currentOverlayLayer = L.tileLayer(url, {
            opacity: 0.6
        });
        currentOverlayLayer.addTo(weatherMap);

        // update button active state
        const allButtons = [layerTempBtn, layerCloudsBtn, layerWindBtn, layerPrecipBtn];
        allButtons.forEach(btn => {
            if (!btn) return;
            btn.classList.toggle("active", btn.dataset.layer === layerKey);
        });
    }

    function setLocationMarker(lat, lon) {
        if (!weatherMap || typeof lat !== "number" || typeof lon !== "number") return;
        const pos = [lat, lon];
        if (locationMarker) {
            locationMarker.setLatLng(pos);
        } else if (window.L) {
            locationMarker = L.marker(pos).addTo(weatherMap);
        }
    }

    // map helper – use Leaflet map instead of iframe
    function updateMap(lat, lon) {
        if (typeof lat !== "number" || typeof lon !== "number") return;
        ensureMap(lat, lon);
        setLocationMarker(lat, lon);
    }

    // 5-day forecast using OpenWeather "forecast" API (3-hourly -> daily overview)
    async function fetchFiveDayForecast(lat, lon) {
        if (!forecastContainer || typeof lat !== "number" || typeof lon !== "number") return;
        try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=${currentLang}&appid=${api_key}`;
            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();
            lastForecast = data;
            buildForecastOverview(data);
            updateTempChart(data);
            updateActivityPlanner(data);
        } catch (e) {
            console.log("Unable to load 5 day forecast.", e);
        }
    }

    function getWeatherEmoji(main) {
        if (!main) return "⛅";
        switch (main.toLowerCase()) {
            case "thunderstorm": return "⛈️";
            case "drizzle": return "🌦️";
            case "rain": return "🌧️";
            case "snow": return "❄️";
            case "clear": return "☀️";
            case "clouds": return "☁️";
            case "mist":
            case "smoke":
            case "haze":
            case "dust":
            case "fog":
            case "sand":
            case "ash": return "🌫️";
            case "tornado": return "🌪️";
            default: return "⛅";
        }
    }

    function buildForecastOverview(forecastData) {
        if (!forecastContainer || !forecastData || !Array.isArray(forecastData.list)) return;
        forecastContainer.innerHTML = "";

        const daily = {};
        forecastData.list.forEach(entry => {
            if (!entry.dt_txt || !entry.main) return;
            const datePart = entry.dt_txt.split(" ")[0]; // "YYYY-MM-DD"
            if (!daily[datePart]) {
                daily[datePart] = {
                    temps: [],
                    sample: entry
                };
            }
            daily[datePart].temps.push(entry.main.temp);
        });

        const allDates = Object.keys(daily).sort();
        // skip "today" and take next 5 days
        const futureDates = allDates.slice(1, 6);

        futureDates.forEach(dateStr => {
            const info = daily[dateStr];
            if (!info || !info.temps.length) return;
            const minTemp = Math.round(Math.min(...info.temps));
            const maxTemp = Math.round(Math.max(...info.temps));

            const sample = info.sample;
            const mainWeather = sample.weather && sample.weather[0] ? sample.weather[0] : null;
            const emoji = getWeatherEmoji(mainWeather ? mainWeather.main : "");
            const description = mainWeather ? mainWeather.description : "Weather details";

            const dateObj = new Date(dateStr);
            const weekday = dateObj.toLocaleDateString(currentLocale, { weekday: 'short' });
            const dayNumber = dateObj.getDate();

            const card = document.createElement("div");
            card.className = "forecast-card";
            card.innerHTML = `
                <div class="forecast-day">${weekday} ${dayNumber}</div>
                <div class="forecast-icon">${emoji}</div>
                <div class="forecast-temp-range">${minTemp}° / ${maxTemp}°C</div>
                <div class="forecast-description">${description}</div>
            `;
            forecastContainer.appendChild(card);
        });
    }

    // AQI via OpenWeather
    async function fetchAQI(lat, lon) {
        if (!aqiValue || !aqiStatus || typeof lat !== "number" || typeof lon !== "number") return;
        try {
            aqiStatus.textContent = "Loading...";
            const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
            const res = await fetch(url);
            if (!res.ok) {
                aqiValue.textContent = "--";
                aqiStatus.textContent = "Unavailable";
                return;
            }
            const data = await res.json();
            if (!data.list || !data.list[0] || !data.list[0].main) {
                aqiValue.textContent = "--";
                aqiStatus.textContent = "Unavailable";
                return;
            }
            const idx = data.list[0].main.aqi;
            aqiValue.textContent = idx;
            const labels = {
                1: "Good – Air quality is considered satisfactory.",
                2: "Fair – Air quality is acceptable.",
                3: "Moderate – Sensitive groups should limit long outdoor exertion.",
                4: "Poor – People with health issues should avoid outdoor exertion.",
                5: "Very Poor – Everyone should reduce outdoor exertion."
            };
            aqiStatus.textContent = labels[idx] || "Unknown";
        } catch (e) {
            console.log("Unable to load AQI.", e);
            aqiValue.textContent = "--";
            aqiStatus.textContent = "Error";
        }
    }

    function updateAlertsAndClothing(main, wind, precipMm) {
        if (!alertText || !clothingSuggestion || !main) return;
        const t = main.temp;
        const feels = main.feels_like ?? main.temp;
        const w = wind && typeof wind.speed === "number" ? wind.speed : 0;
        const precip = typeof precipMm === "number" ? precipMm : 0;

        const alerts = [];
        if (t >= 35 || feels >= 37) alerts.push("Heatwave conditions – stay hydrated and avoid direct sun mid‑day.");
        if (t <= 5) alerts.push("Very cold – risk of frost; dress warmly.");
        if (precip >= 10) alerts.push("Heavy rain expected – possible waterlogging and poor visibility.");
        else if (precip >= 2) alerts.push("Moderate rain – roads may be slippery.");
        if (w >= 12) alerts.push("Strong winds – secure loose outdoor items.");

        alertText.textContent = alerts.length ? alerts.join(" ") : "No major alerts based on current conditions.";

        // clothing suggestion
        if (feels >= 32) {
            clothingSuggestion.textContent = "Wear light, breathable clothes; use sunscreen and carry water.";
        } else if (feels <= 15) {
            clothingSuggestion.textContent = "Wear a jacket or sweater; consider layers if you stay out for long.";
        } else {
            clothingSuggestion.textContent = "Comfortable casual clothing is fine.";
        }
        if (precip >= 1) {
            clothingSuggestion.textContent += " Carry an umbrella or raincoat.";
        }
        if (w >= 12) {
            clothingSuggestion.textContent += " Avoid loose hats or umbrellas in strong winds.";
        }
    }

    // simple activity planner using next 24h–36h forecast
    function updateActivityPlanner(forecastData) {
        if (!forecastData || !Array.isArray(forecastData.list)) return;

        const slots = forecastData.list.slice(0, 12).map(item => {
            const d = new Date(item.dt * 1000);
            const hour = d.getHours();
            const temp = item.main?.temp ?? 0;
            const wind = item.wind?.speed ?? 0;
            const hasRain = (item.weather?.[0]?.main || "").toLowerCase().includes("rain");
            return { d, hour, temp, wind, hasRain };
        });

        function formatSlot(slot) {
            if (!slot) return "No ideal time in the next day.";
            const label = slot.d.toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit" });
            return `${label} (around ${Math.round(slot.temp)}°C, wind ${slot.wind.toFixed(1)} m/s${slot.hasRain ? ", possible rain" : ""})`;
        }

        // jogging: cooler, low rain, any time 5–9 or 17–20
        const jogSlot = slots
            .filter(s => (s.hour >= 5 && s.hour <= 9) || (s.hour >= 17 && s.hour <= 20))
            .filter(s => s.temp >= 18 && s.temp <= 30 && !s.hasRain)
            .sort((a, b) => a.temp - b.temp)[0] || null;
        if (joggingTime) {
            joggingTime.textContent = formatSlot(jogSlot);
        }

        // cycling: similar but prioritize lower wind
        const cycleSlot = slots
            .filter(s => (s.hour >= 6 && s.hour <= 10) || (s.hour >= 16 && s.hour <= 19))
            .filter(s => s.temp >= 18 && s.temp <= 32 && !s.hasRain)
            .sort((a, b) => a.wind - b.wind)[0] || null;
        if (cyclingTime) {
            cyclingTime.textContent = formatSlot(cycleSlot);
        }

        // picnic: mid‑day, dry, comfortable temps
        const picnicSlot = slots
            .filter(s => s.hour >= 10 && s.hour <= 16)
            .filter(s => s.temp >= 20 && s.temp <= 32 && !s.hasRain)
            .sort((a, b) => a.temp - b.temp)[0] || null;
        if (picnicTime) {
            picnicTime.textContent = formatSlot(picnicSlot);
        }

        // predictive trend: very simple rain trend summary for mornings vs evenings
        if (predictiveText) {
            const morningRain = forecastData.list.filter(item => {
                const h = new Date(item.dt * 1000).getHours();
                const isMorning = h >= 6 && h <= 11;
                const wMain = (item.weather?.[0]?.main || "").toLowerCase();
                return isMorning && (wMain.includes("rain") || wMain.includes("storm"));
            }).length;
            const eveningRain = forecastData.list.filter(item => {
                const h = new Date(item.dt * 1000).getHours();
                const isEvening = h >= 17 && h <= 22;
                const wMain = (item.weather?.[0]?.main || "").toLowerCase();
                return isEvening && (wMain.includes("rain") || wMain.includes("storm"));
            }).length;

            if (morningRain === 0 && eveningRain === 0) {
                predictiveText.textContent = "Next few days look mostly dry in mornings and evenings based on short‑term forecast.";
            } else if (morningRain > eveningRain) {
                predictiveText.textContent = "Rain is more likely in the mornings over the next few days; evenings look relatively drier.";
            } else if (eveningRain > morningRain) {
                predictiveText.textContent = "Evenings show higher chance of rain compared to mornings in the next few days.";
            } else {
                predictiveText.textContent = "Morning and evening rain chances look similar in the next few days.";
            }
        }

        // personalized alerts example: rain between 6–8 AM in next 24h
        if (alertsText) {
            const rainSlot = forecastData.list.slice(0, 8).find(item => {
                const h = new Date(item.dt * 1000).getHours();
                const wMain = (item.weather?.[0]?.main || "").toLowerCase();
                return h >= 6 && h <= 8 && (wMain.includes("rain") || wMain.includes("storm"));
            });
            if (rainSlot) {
                const when = new Date(rainSlot.dt * 1000).toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit" });
                alertsText.textContent = `Heads up: rain is likely around ${when} (between 6–8 AM) in the next day.`;
            } else {
                alertsText.textContent = "No rain expected between 6–8 AM in the next 24 hours based on current forecast.";
            }
        }
    }

    function updateMoodSuggestion(weatherData) {
        if (!moodSuggestion || !weatherData) return;
        const main = (weatherData.weather?.[0]?.main || "").toLowerCase();
        const desc = weatherData.weather?.[0]?.description || "";
        const t = weatherData.main?.temp ?? 0;

        let text;
        if (main.includes("rain") || main.includes("drizzle") || main.includes("storm")) {
            text = "Rainy mood – try a cozy lo‑fi or acoustic playlist and a warm movie.";
        } else if (main.includes("snow")) {
            text = "Snowy feel – perfect for calm instrumentals and a winter‑themed film.";
        } else if (main.includes("clear") && t >= 26) {
            text = "Bright and warm – upbeat pop or dance music fits well with this weather.";
        } else if (main.includes("clear")) {
            text = "Clear and pleasant – soft pop or indie tracks with a relaxing show would be great.";
        } else if (main.includes("cloud")) {
            text = "Cloudy skies – a chill playlist and a light drama or series would match the vibe.";
        } else {
            text = "Mixed weather – pick your favorite playlist and a comfort movie that suits any mood.";
        }
        moodSuggestion.textContent = `${desc ? desc + ". " : ""}${text}`;
    }

    function saveHistoryEntry(city, temp) {
        if (!historyList || !city || typeof temp !== "number") return;
        const entry = {
            city,
            temp: Math.round(temp),
            time: new Date().toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit" })
        };
        let arr = [];
        try {
            const raw = localStorage.getItem("weatherHistory");
            if (raw) arr = JSON.parse(raw) || [];
        } catch { }
        arr.unshift(entry);
        if (arr.length > 10) arr = arr.slice(0, 10);
        localStorage.setItem("weatherHistory", JSON.stringify(arr));
        renderHistory(arr);
    }

    function renderHistory(arr) {
        if (!historyList || !Array.isArray(arr)) return;
        historyList.innerHTML = "";
        arr.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.time} – ${item.city}: ${item.temp}°C`;
            historyList.appendChild(li);
        });
    }

    // load history on start
    (function initHistory() {
        if (!historyList) return;
        try {
            const raw = localStorage.getItem("weatherHistory");
            if (!raw) return;
            const arr = JSON.parse(raw) || [];
            renderHistory(arr);
        } catch { }
    })();

    // temperature trend chart (next ~24h)
    function updateTempChart(forecastData) {
        if (!tempChartCanvas || !window.Chart || !forecastData || !Array.isArray(forecastData.list)) return;
        const points = forecastData.list.slice(0, 8); // roughly next 24h
        const labels = points.map(p => {
            const d = new Date(p.dt * 1000);
            return d.toLocaleTimeString(currentLocale, { hour: "2-digit", minute: "2-digit" });
        });
        const temps = points.map(p => p.main.temp);

        const ctx = tempChartCanvas.getContext("2d");
        if (tempChart) {
            tempChart.data.labels = labels;
            tempChart.data.datasets[0].data = temps;
            tempChart.update();
            return;
        }
        tempChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Temp (°C)",
                    data: temps,
                    borderColor: "#3fb9ff",
                    backgroundColor: "rgba(63,185,255,0.2)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { maxRotation: 0, minRotation: 0 } },
                    y: { beginAtZero: false }
                }
            }
        });
    }

    // simple two-city comparison
    async function fetchWeatherByCity(city) {
        const q = city && city.trim();
        if (!q) return null;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=metric&lang=${currentLang}&appid=${api_key}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("City not found");
        return await res.json();
    }

    async function handleCompare() {
        if (!compareCity1 || !compareCity2 || !compareResult1 || !compareResult2) return;
        const c1 = compareCity1.value.trim();
        const c2 = compareCity2.value.trim();
        if (!c1 || !c2) return;
        compareResult1.textContent = "Loading...";
        compareResult2.textContent = "Loading...";
        try {
            const [w1, w2] = await Promise.all([
                fetchWeatherByCity(c1),
                fetchWeatherByCity(c2)
            ]);
            compareResult1.textContent = `${w1.name}: ${Math.round(w1.main.temp)}°C, ${w1.weather?.[0]?.description || ""}`;
            compareResult2.textContent = `${w2.name}: ${Math.round(w2.main.temp)}°C, ${w2.weather?.[0]?.description || ""}`;
        } catch (e) {
            compareResult1.textContent = "Unable to load data.";
            compareResult2.textContent = "";
        }
    }

    if (compareBtn) {
        compareBtn.addEventListener("click", handleCompare);
    }

    // AI assistant
    function addAssistantMessage(role, text) {
        if (!assistantConversation || !text) return;
        const div = document.createElement("div");
        div.classList.add("assistant-message");
        if (role === "user") div.classList.add("user");
        div.textContent = text;
        assistantConversation.appendChild(div);
        assistantConversation.scrollTop = assistantConversation.scrollHeight;
    }

    function buildAssistantReply(prompt) {
        if (!lastWeather) {
            return "Fetch the latest weather first, then ask me again.";
        }
        const lower = prompt.toLowerCase();
        const w = lastWeather;
        const t = Math.round(w.main.temp);
        const feels = Math.round(w.main.feels_like ?? w.main.temp);
        const hum = w.main.humidity;
        const clouds = w.clouds?.all ?? 0;
        const wind = w.wind?.speed ?? 0;
        let precipText = precipEl ? precipEl.textContent : "0 mm";

        const parts = [];

        // core summary
        parts.push(`Right now in ${w.name} it is ${t}°C (feels like ${feels}°C) with ${w.weather?.[0]?.description || "clear sky"}.`);
        parts.push(`Humidity is ${hum}% with ${clouds}% cloud cover and wind ${wind} m/s.`);
        parts.push(`Recent precipitation: ${precipText}.`);

        if (lower.includes("umbrella") || lower.includes("rain")) {
            parts.push(parseFloat(precipText) > 0 ? "Yes, carrying an umbrella is a good idea." : "No significant rain is expected right now.");
        }
        if (lower.includes("hot") || lower.includes("cold") || lower.includes("wear")) {
            if (t >= 32) parts.push("It feels quite hot; light cotton clothes and hydration are recommended.");
            else if (t <= 15) parts.push("It is cool; a light jacket or sweater would be comfortable.");
            else parts.push("Weather is mild; normal casual wear should be fine.");
        }
        if (lower.includes("wind")) {
            if (wind > 10) parts.push("Winds are a bit strong, secure loose items if you're outdoors.");
            else parts.push("Winds are light to moderate.");
        }

        return parts.join(" ");
    }

    if (assistantSend && assistantInput) {
        assistantSend.addEventListener("click", () => {
            const text = assistantInput.value.trim();
            if (!text) return;
            addAssistantMessage("user", text);
            assistantInput.value = "";
            addAssistantMessage("ai", buildAssistantReply(text));
        });
        assistantInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                assistantSend.click();
            }
        });
        // initial greeting
        addAssistantMessage("ai", "Hi! I'm your weather assistant. Ask me about rain, heat, wind, or what to wear.");
    }
})
