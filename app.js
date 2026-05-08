const forecastBtn = document.getElementById("forecastBtn");

forecastBtn.addEventListener("click", async function () {
	const location = document.getElementById("locationInput").value;
	const waterTemp = Number(document.getElementById("waterTempInput").value);
	const clarity = document.getElementById("clarityInput").value;

	if (!location || !waterTemp) {
		alert("Please enter a location and water temperature.");
		return;
	}

	try {
		const weather = await getWeatherData(location);
		const recommendation = getFishingRecommendation(waterTemp, clarity, weather);

        const now = new Date();

        const formattedDate = now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        const formattedTime = now.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit"
        });

        document.getElementById("weatherOutput").innerHTML = `
            <p><strong>Last Updated:</strong> ${formattedDate} at ${formattedTime}</p>

            <p><strong>Location:</strong> ${weather.name}, ${weather.state || weather.country}</p>

            <p><strong>Air Temp:</strong> ${weather.temperature}°F</p>

            <p><strong>Wind:</strong> ${weather.windSpeed} mph</p>

            <p><strong>Cloud Cover:</strong> ${weather.cloudCover}%</p>

            <p><strong>Rain Chance:</strong> ${weather.precipChance}%</p>

            <p><strong>Pressure:</strong> ${weather.pressure} hPa</p>

            <p><strong>Water Temp:</strong> ${waterTemp}°F</p>

            <p><strong>Water Clarity:</strong> ${clarity}</p>
        `;

		document.getElementById("recommendationOutput").innerHTML = `
			<div class="recommendation-box">
				<h3>Recommendation</h3>
				<p><strong>Activity Level:</strong> ${recommendation.activity}</p>
				<p><strong>Likely Depth:</strong> ${recommendation.depth}</p>
				<p><strong>Best Lures:</strong> ${recommendation.lures}</p>
				<p><strong>Best Colors:</strong> ${recommendation.colors}</p>
			</div>
		`;

		document.getElementById("resultCard").style.display = "block";
	} catch (error) {
		alert("Could not get weather data. Try a more specific location like Tampa, FL.");
		console.error(error);
	}
});

async function getWeatherData(location) {
	const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;

	const geoResponse = await fetch(geoUrl);
	const geoData = await geoResponse.json();

	if (!geoData.results || geoData.results.length === 0) {
		throw new Error("Location not found");
	}

	const place = geoData.results[0];

	const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,surface_pressure,wind_speed_10m,cloud_cover&daily=precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

	const weatherResponse = await fetch(weatherUrl);
	const weatherData = await weatherResponse.json();

	return {
		name: place.name,
		state: place.admin1,
		country: place.country,
		temperature: weatherData.current.temperature_2m,
		pressure: weatherData.current.surface_pressure,
		windSpeed: weatherData.current.wind_speed_10m,
		cloudCover: weatherData.current.cloud_cover,
		precipChance: weatherData.daily.precipitation_probability_max[0]
	};
}

function getFishingRecommendation(waterTemp, clarity, weather) {
	let activity = "";
	let depth = "";
	let lures = "";
	let colors = "";

	if (waterTemp < 50) {
		activity = "Low";
		depth = "Deeper water or slow transition areas";
		lures = "Jerkbait, jig, blade bait";
	} else if (waterTemp < 60) {
		activity = "Medium";
		depth = "Shallow-to-mid depth transition areas";
		lures = "Jerkbait, spinnerbait, crankbait, jig";
	} else if (waterTemp < 75) {
		activity = "High";
		depth = "Shallow cover, grass, docks, and wind-blown banks";
		lures = "Chatterbait, spinnerbait, squarebill, soft plastics, topwater";
	} else {
		activity = "Medium";
		depth = "Shade, deeper grass edges, docks, and early/late shallow areas";
		lures = "Texas rig, frog, topwater, jig, deep crankbait";
	}

	if (weather.cloudCover > 65 || weather.precipChance > 50) {
		lures += ", buzzbait, walking topwater";
	}

	if (weather.windSpeed > 10) {
		lures += ", spinnerbait";
	}

	if (clarity === "clear") {
		colors = "Natural colors: green pumpkin, watermelon, shad, silver";
	} else if (clarity === "stained") {
		colors = "Bold natural colors: white/chartreuse, green pumpkin, black/blue";
	} else {
		colors = "High-contrast colors: black/blue, chartreuse, bright white";
	}

	return {
		activity,
		depth,
		lures,
		colors
	};
}