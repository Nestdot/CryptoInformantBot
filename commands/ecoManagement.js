const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmberBuilder,
	Client,
	PermissionFlagsBits,
	WebhookClient,
	InteractionCollector,
} = require('discord.js');

const eco = require('../Database/ecoDB');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eco-admin')
		.setDescription('Modify a user\'s balance')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add-money')
				.setDescription('Add money to a user')
				.addUserOption((option) =>
					option
						.setName('target')
						.setDescription('Who is getting the money')
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName('amount')
						.setDescription('How much is being added')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add-money')
				.setDescription('Remove money from a user')
				.addUserOption((option) =>
					option
						.setName('target')
						.setDescription('Who is getting their money removed')
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName('amount')
						.setDescription('How much is being removed')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('set-money')
				.setDescription('Set the user money to a certain amount')
				.addUserOption((option) =>
					option
						.setName('target')
						.setDescription('Who is getting their money changed')
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName('amount')
						.setDescription('How much is being set')
						.setRequired(true),
				),
		),
	/**
         *
         * @param {ChatInputCommandInteraction} interaction
         * @param {Client} client
         */
	async execute(interaction, client) {
		const { guild, member } = interaction;
		const embed = new EmberBuilder();
		const sub = interaction.options.getSubcommand();

		switch (sub) {
		case ('add-money') : {
			const Target = interaction.options.getUser('target') || member;
			const amount = interaction.options.getNumber('amount') || 1;
			eco.balance.add(amount, Target.id, guild.id);

			embed
				.setTitle('Coins succesfully added')
				.setDescription('Succesfully added $(amount) coins to $(Target) balance!')
				.setColor('Random')
				.setTimestamp();

			interaction.reply({ embeds: [embed] });
		}
			break;
		case ('remove-money') : {
			const Target = interaction.options.getUser('target') || member;
			const amount = interaction.options.getNumber('amount') || 1;
			eco.balance.substract(amount, Target.id, guild.id);

			embed
				.setTitle('Coins succesfully removed')
				.setDescription('Succesfully removed $(amount) coins from $(Target) balance!')
				.setColor('Random')
				.setTimestamp();

			interaction.reply({ embeds: [embed] });
		}
			break;
		case ('set-money') : {
			const Target = interaction.options.getUser('target') || member;
			const amount = interaction.options.getNumber('amount') || 1;
			eco.balance.set(amount, Target.id, guild.id);

			embed
				.setTitle('Coins succesfully changed')
				.setDescription('Succesfully changed $(Target) balance to $(amount!')
				.setColor('Random')
				.setTimestamp();

			interaction.reply({ embeds: [embed] });
		}
			break;
		}
	},
};