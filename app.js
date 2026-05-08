const forecastBtn = document.getElementById("forecastBtn");

forecastBtn.addEventListener("click", function () {
	const location = document.getElementById("locationInput").value;
	const waterTemp = Number(document.getElementById("waterTempInput").value);
	const clarity = document.getElementById("clarityInput").value;

	if (!location || !waterTemp) {
		alert("Please enter a location and water temperature.");
		return;
	}

	const recommendation = getFishingRecommendation(waterTemp, clarity);

	document.getElementById("weatherOutput").innerHTML = `
		<p><strong>Location:</strong> ${location}</p>
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
});

function getFishingRecommendation(waterTemp, clarity) {
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