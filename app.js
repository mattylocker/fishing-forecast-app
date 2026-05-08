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
        const techniqueRatings = getTechniqueRatings(waterTemp, clarity, weather);
        const spawnPattern = getSpawnPattern(waterTemp);

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

            <p><strong>Sunrise:</strong> ${weather.sunrise}</p>

            <p><strong>Sunset:</strong> ${weather.sunset}</p>

            <p><strong>Moon Phase:</strong> ${weather.moonPhase}</p>

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
            <div class="technique-ratings">
                <h3>Technique Ratings</h3>
                ${techniqueRatings.map(item => `
                    <p><strong>${item.name}:</strong> ${item.rating}</p>
                `).join("")}
            </div>
            <div class="recommendation-box">
                <h3>Spawn Pattern</h3>
                <p><strong>Stage:</strong> ${spawnPattern.stage}</p>
                <p><strong>Pattern:</strong> ${spawnPattern.pattern}</p>
                <p><strong>Target Areas:</strong> ${spawnPattern.areas}</p>
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

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,surface_pressure,wind_speed_10m,cloud_cover&daily=precipitation_probability_max,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;	const weatherResponse = await fetch(weatherUrl);
	const weatherData = await weatherResponse.json();

    return {
        name: place.name,
        state: place.admin1,
        country: place.country,
        temperature: weatherData.current.temperature_2m,
        pressure: weatherData.current.surface_pressure,
        windSpeed: weatherData.current.wind_speed_10m,
        cloudCover: weatherData.current.cloud_cover,
        precipChance: weatherData.daily.precipitation_probability_max[0],
        sunrise: formatTime(weatherData.daily.sunrise[0]),
        sunset: formatTime(weatherData.daily.sunset[0]),
        moonPhase: "Coming soon"    };
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

function getTechniqueRatings(waterTemp, clarity, weather) {
	const ratings = [
		{
			name: "Finesse",
			score: 5
		},
		{
			name: "Jigs",
			score: 5
		},
		{
			name: "Moving Baits",
			score: 5
		},
		{
			name: "Swimbaits",
			score: 5
		},
		{
			name: "Topwater",
			score: 5
		},
		{
			name: "Frogs",
			score: 5
		},
		{
			name: "Crankbaits",
			score: 5
		},
		{
			name: "Jerkbaits",
			score: 5
		}
	];

	ratings.forEach(function (item) {
		if (waterTemp < 50) {
			if (item.name === "Finesse" || item.name === "Jerkbaits" || item.name === "Jigs") {
				item.score += 2;
			}

			if (item.name === "Topwater" || item.name === "Frogs") {
				item.score -= 3;
			}
		}

		if (waterTemp >= 50 && waterTemp < 60) {
			if (item.name === "Jerkbaits" || item.name === "Jigs" || item.name === "Crankbaits") {
				item.score += 2;
			}

			if (item.name === "Topwater" || item.name === "Frogs") {
				item.score -= 2;
			}
		}

		if (waterTemp >= 60 && waterTemp < 75) {
			if (item.name === "Moving Baits" || item.name === "Swimbaits" || item.name === "Crankbaits") {
				item.score += 2;
			}

			if (item.name === "Topwater") {
				item.score += 1;
			}
		}

		if (waterTemp >= 75) {
			if (item.name === "Topwater" || item.name === "Frogs" || item.name === "Finesse") {
				item.score += 2;
			}

			if (item.name === "Jerkbaits") {
				item.score -= 2;
			}
		}

		if (weather.windSpeed > 10) {
			if (item.name === "Moving Baits" || item.name === "Swimbaits" || item.name === "Crankbaits") {
				item.score += 2;
			}

			if (item.name === "Finesse") {
				item.score -= 1;
			}
		}

		if (weather.cloudCover > 60) {
			if (item.name === "Topwater" || item.name === "Moving Baits" || item.name === "Swimbaits") {
				item.score += 1;
			}
		}

		if (clarity === "muddy") {
			if (item.name === "Moving Baits" || item.name === "Jigs" || item.name === "Crankbaits") {
				item.score += 1;
			}

			if (item.name === "Finesse" || item.name === "Swimbaits") {
				item.score -= 1;
			}
		}

		if (clarity === "clear") {
			if (item.name === "Finesse" || item.name === "Swimbaits" || item.name === "Jerkbaits") {
				item.score += 1;
			}
		}

		if (item.score >= 8) {
			item.rating = "Excellent";
		} else if (item.score >= 6) {
			item.rating = "Good";
		} else if (item.score >= 4) {
			item.rating = "Fair";
		} else {
			item.rating = "Tough";
		}
	});

	return ratings;
}

function formatTime(dateTimeString) {
	const date = new Date(dateTimeString);

	return date.toLocaleTimeString(undefined, {
		hour: "numeric",
		minute: "2-digit"
	});
}

function getMoonPhaseName(moonPhase) {
	if (moonPhase === 0 || moonPhase === 1) {
		return "New Moon";
	} else if (moonPhase > 0 && moonPhase < 0.25) {
		return "Waxing Crescent";
	} else if (moonPhase === 0.25) {
		return "First Quarter";
	} else if (moonPhase > 0.25 && moonPhase < 0.5) {
		return "Waxing Gibbous";
	} else if (moonPhase === 0.5) {
		return "Full Moon";
	} else if (moonPhase > 0.5 && moonPhase < 0.75) {
		return "Waning Gibbous";
	} else if (moonPhase === 0.75) {
		return "Last Quarter";
	} else {
		return "Waning Crescent";
	}
}

function getSpawnPattern(waterTemp) {
	if (waterTemp < 50) {
		return {
			stage: "Cold Water / Early Pre-Spawn",
			pattern: "Fish are usually slower and may still be holding near deeper wintering areas.",
			areas: "Main lake points, deeper grass edges, steep banks, and slow transition areas"
		};
	}

	if (waterTemp >= 50 && waterTemp < 58) {
		return {
			stage: "Early Pre-Spawn",
			pattern: "Fish may start moving toward spawning areas, but they usually stop on staging spots first.",
			areas: "Secondary points, creek channels, outside grass lines, and deeper docks near spawning flats"
		};
	}

	if (waterTemp >= 58 && waterTemp < 65) {
		return {
			stage: "Late Pre-Spawn",
			pattern: "Fish are likely feeding more and moving shallow. Bigger females may stage just outside spawning areas.",
			areas: "Shallow flats near deeper water, grass edges, docks, laydowns, and protected pockets"
		};
	}

	if (waterTemp >= 65 && waterTemp < 72) {
		return {
			stage: "Spawn",
			pattern: "Fish may be on beds or close to bedding areas. The bite can be more visual and target-based.",
			areas: "Protected shallow pockets, sandy or hard-bottom areas, docks, reeds, and calm banks"
		};
	}

	if (waterTemp >= 72 && waterTemp < 78) {
		return {
			stage: "Post-Spawn",
			pattern: "Fish may be recovering after spawning. Some stay shallow while others move toward summer areas.",
			areas: "Bluegill beds, shade, docks, grass, points, and the first drop outside spawning pockets"
		};
	}

	return {
		stage: "Summer Pattern",
		pattern: "Fish are usually more influenced by shade, oxygen, current, grass, and low-light feeding windows.",
		areas: "Deep grass edges, docks, shade lines, offshore structure, current areas, and early/late shallow cover"
	};
}