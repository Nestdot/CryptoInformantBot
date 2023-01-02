const Economy = require(`discord-economy-super/mongodb`);
const { mongoDBPassword } = require(`./config.json`);
const { truncate } = require(`fs`);
const eco = new Economy({
	connection: {
		connectionURI: `mongodb+srv://satbot:${mongoDBPassword}@clustersb.jrrexl1.mongodb.net/?retryWrites=true&w=majority`,
		collectionName: `collection`,
		dbName: `db`,
		congoClientOptions: {},
	},
	updateCountdown: 1000,
	checkStorage: true,
	deprecationWarnings: true,
	sellingItemPercent: 75,
	savePurchasesHistory: true,
	dailyAmount: 0.002,
	workAmount: [0.0004, 0.002],
	weeklyAmount: 0.017,
	dailyCooldown: 60000 * 60 * 24,
	workCooldown: 60000 * 60,
	weeklyCooldown: 60000 * 60 * 24 * 7,
	dateLocale: `en`,
	updater: {
		checkUpdates: true,
		upToDateMessage: true,
	},
	errorHandler: {
		handleErrors: true,
		attempts: 5,
		time: 3000,
	},
	optionsChecker: {
		ignoreInvalidOptions: false,
		ignoreInvalidTypes: false,
		ignoreUnspecifiedOptions: true,
		showProblems: true,
		sendLog: true,
		sendSuccessLog: true,
	},
});

eco.on(`ready`, () => {
	console.log(`Economy System is now ready to be used`);
});

module.exports = eco;