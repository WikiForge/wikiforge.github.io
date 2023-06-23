document.addEventListener( 'DOMContentLoaded', function () {
	fetchPlans();
} );

/* Default to monthly pricing */
let selectedTab = 'monthly';

async function fetchPlans() {
	try {
		const response = await fetch('plans.json');
		const plans = await response.json();
		generatePricingTable(plans);

		/* Initially toggle the tab based on selectedTab variable */
		toggleTab();

		/* Add event listeners to the tabs */
		addTabEventListeners(plans);
	} catch (error) {
		console.error('Error fetching plans:', error);
	}
}

function generatePricingTable(plans) {
	const pricingTable = document.getElementById('pricingTable');

	/* Clear existing pricing table */
	pricingTable.innerHTML = '';

	plans.forEach( plan => {
		const pricingCard = document.createElement('div');
		pricingCard.className = 'pricingCard mb-lg';

		const title = document.createElement('div');
		title.className = 'title';
		title.textContent = plan.name;

		const price = document.createElement('div');
		price.className = 'price';
		price.textContent = getPriceText(plan.price);

		let duration = '';
		if (typeof plan.price === 'object') {
			duration = document.createElement('div');
			duration.className = 'duration';
			duration.textContent = selectedTab === 'monthly' ? 'per month' : 'per year';
			pricingCard.appendChild(duration);
		}

		const featuresList = document.createElement('ul');
		featuresList.className = 'features';
		plan.features.forEach( feature => {
			const featureItem = document.createElement('li');
			const featureText = document.createElement('span');
			featureText.textContent = feature;
			featureItem.appendChild(featureText);

			if (plan.extraCosts && feature in plan.extraCosts) {
				const extraCost = document.createElement('span');
				const extraCostValue = plan.extraCosts[feature];
				extraCost.textContent = getExtraCostText(extraCostValue);
				extraCost.className = 'extraCost';
				featureItem.appendChild(extraCost);
			}

			featuresList.appendChild(featureItem);
		} );

		const infoText = document.createElement('div');
		infoText.className = 'infoText';
		infoText.textContent = plan.info;

		pricingCard.appendChild(title);
		pricingCard.appendChild(price);

		if (duration) {
			pricingCard.appendChild(duration);
		}

		pricingCard.appendChild(featuresList);
		pricingCard.appendChild(infoText);

		pricingTable.appendChild(pricingCard);
	} );
}

function toggleTab() {
	const monthlyTab = document.getElementById('monthlyTab');
	const yearlyTab = document.getElementById('yearlyTab');

	if (selectedTab === 'monthly') {
		monthlyTab.classList.add('active');
		yearlyTab.classList.remove('active');
	} else {
		monthlyTab.classList.remove('active');
		yearlyTab.classList.add('active');
	}
}

function addTabEventListeners(plans) {
	const monthlyTab = document.getElementById('monthlyTab');
	const yearlyTab = document.getElementById('yearlyTab');

	monthlyTab.addEventListener( 'click', function () {
		selectedTab = 'monthly';
		toggleTab();
		updatePrices(plans);
	} );

	yearlyTab.addEventListener( 'click', function () {
		selectedTab = 'yearly';
		toggleTab();
		updatePrices(plans);
	} );
}

function updatePrices(plans) {
	const pricingCards = document.querySelectorAll('.pricingCard');
	pricingCards.forEach( (card, index) => {
		const priceElement = card.querySelector('.price');
		const durationElement = card.querySelector('.duration');
		const featureElements = card.querySelectorAll('.features li');
		const planIndex = index;

		if (planIndex >= 0) {
			const plan = plans[planIndex];
			priceElement.textContent = getPriceText(plan.price);

			if (typeof plan.price === 'object' && durationElement) {
				durationElement.textContent = selectedTab === 'monthly' ? 'per month' : 'per year';
			}

			featureElements.forEach( (featureElement, featureIndex) => {
				const featureTextElement = featureElement.querySelector('span');
				const feature = plan.features[featureIndex];
				const extraCostElement = featureElement.querySelector('.extraCost');
				const extraCostValue = plan.extraCosts && feature in plan.extraCosts ? plan.extraCosts[feature][selectedTab] : null;

				featureTextElement.textContent = feature;

				if (extraCostElement) {
					extraCostElement.textContent = getExtraCostText(extraCostValue);
				}
			} );
		}
	} );
}

function getPriceText(price) {
	if (typeof price === 'object') {
		return selectedTab === 'monthly' ? `Starting at $${price.monthly}` : `Starting at $${price.yearly}`;
	} else {
		return price;
	}
}

function getExtraCostText(extraCost) {
	if (typeof extraCost === 'object') {
		return selectedTab === 'monthly' ? extraCost.monthly : extraCost.yearly;
	} else {
		return extraCost;
	}
}
