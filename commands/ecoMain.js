const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	Client,
	WebhookClient,
} = require('discord.js');

const eco = require('../Database/ecoDB');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eco')
		.setDescription('The economy system')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('main')
				.setDescription('The main eco commands')
				.addStringOption((option) =>
					option
						.setName('types')
						.setDescription('Select the command type')
						.setRequired(true)
						.setChoices(
							{ name: 'Balance', value: 'Balance' },
							{ name: 'Daily', value: 'Daily' },
							{ name: 'Weekly', value: 'Weekly' },
							{ name: 'Coins Leaderboard', value: 'Coins Leaderboard' },
							{ name: 'Bank Leaderboard', value: 'Bank Leaderboard' },
							{ name: 'Inventory', value: 'Inventory' },
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('money')
				.setDescription('Money types')
				.addStringOption((option) =>
					option
						.setName('types')
						.setDescription('Select the command type')
						.setRequired(true)
						.setChoices(
							{ name: 'Deposit', value: 'Deposit' },
							{ name: 'Withdraw', value: 'Withdraw' },
						),
				)
				.addNumberOption((option) =>
					option
						.setName('amount')
						.setDescription('How much?')
						.setRequired(true),
				),
		),
	/**
         *
         * @param {ChatInputCommandInteraction} interaction
         * @param {Client} client
         */
	async execute(interaction, client) {
		const sub = interaction.options.getSubcommand();
		const embed = new EmbedBuilder();
		const { guild, member } = interaction;

		switch (sub) {
		case ('main') : {
			const Type = interaction.options.getString('types');

			switch (Type) {
			case ('Balance') : {
				let balance = eco.balance.fetch(member.id, guild.id);
				let bank = eco.bank.fetch (member.id, guild.id);

				if (!balance) balance = 0;
				if (!bank) bank = 0;

				embed
					.setTitle('**$(interaction.member.user.username)**\'s balance')
					.setDescription('Information of this user\'s balance')
					.addFields(
						{
							name: 'Coins',
							value: '$(balance)',
							inline: true,
						},
						{
							name: 'Bank',
							value: '$(bank)',
							inline: true,
						},
					)
					.setTimestamp()
					.setColor('Green');

				interaction.reply({ embeds: [embed] });
			}
				break;
			case ('Daily') : {
				let daily = eco.rewards.getDaily(member.id, guild.id);
				if (!daily.status) {
					embed
						.setDescription('You have already claimed your daily reward')
						.setColor('Red');
					return interaction.reply({ embeds: [embed] });
				}
				embed
					.setTitle('Daily Rewards')
					.setDescription('You have received **$(daily.reward)** daily coins!')
					.setColor('Green');
				interaction.reply({ embeds: [embed] });
			}
				break;
			case ('Weekly') : {
				let weekly = eco.rewards.getWeekly(member.id, guild.id);
				if (!weekly.status) {
					embed
						.setDescription('You have already claimed your weekly reward')
						.setColor('Red');
					return interaction.reply({ embeds: [embed] });
				}
				embed
					.setTitle('Weekly Rewards')
					.setDescription('You have received **$(weekly.reward)** weekly coins!')
					.setColor('Green');
				interaction.reply({ embeds: [embed] });
			}
				break;
			case ('Coins Leaderboard') : {
				let lb = eco.balance.leaderboard(guild.id);
				if (!lb.length) {
					return interaction.reply(
						{
							content: 'No one has over 0$, there is no leaderboard to display',
						},
					);
				}

				let leaderboard = await lb.map ((value, index) => {
					return `\`${index + 1}\`<@${value.userID}>'s Coins: **${value.money}**`;
				});

				embed
					.setColor('Random')
					.setTitle('Coins leaderboard')
					.setDescription(leaderboard.join('\n'));

				interaction.reply({ embeds: [embed] });
			}
				break;
			case ('Bank Leaderboard') : {
				let lb = eco.bank.leaderboard(guild.id);
				if (!lb.length) {
					return interaction.reply(
						{
							content: 'No one has over 0$ in their bank, there is no leaderboard to display',
						},
					);
				}

				let leaderboard = await lb.map ((value, index) => {
					return `\`${index + 1}\`<@${value.userID}>'s Coins: **${value.money}**`;
				});

				embed
					.setColor('Random')
					.setTitle('Bank leaderboard')
					.setDescription(leaderboard.join('\n'));

				interaction.reply({ embeds: [embed] });
			}
				break;
			case ('Inventory') : {
				const inv = eco.inventory.fetch(member.id, guild.id);
				if (!inv.length) {
					return interaction.reply(
						{
							content: 'There is nothing in your inventory',
							ephemeral: true,
						},
					);
				}

				let invMap = inv.map((x, i) => 'ID: $(i + 1): $(x.name)');

				embed
					.setTitle('Inventory')
					.setDescription(invMap.join('\n'))
					.setColor('Aqua');
				interaction.reply({ embeds : [embed] });
			}
				break;
			}
		}
			break;
		case ('money') : {
			const Type = interaction.options.getString('types');
			let amount = interaction.options.getNumber('amount');

			switch (Type) {
			case ('Deposit') : {
				let balance = eco.balance.fetch(member.id, guild.id);

				if (amount > balance) {
					return interaction.reply(
						{
							content: 'You do not have enough money in your balance to deposit **$(amount)** coins!',
							ephemeral: true,
						},
					);
				}

				eco.balance.subtract(amount, member.id, guild.id);
				eco.bank.add(amount, member.id, guild.id);

				embed
					.setTitle('Deposit || Money to Bank ||')
					.setDescription('Successfully deposited $(amount) coins to your bank!')
					.setColor('Green');
				interaction.reply({ embeds: [embed] });
			}
				break;
			case ('Withdraw') : {
				let balance = eco.bank.fetch(member.id, guild.id);
				let bank = eco.bank.fetch(member.id, guild.id);

				if (amount > bank) {
					return interaction.reply(
						{
							content: 'You do not have enough money in your bank to withdraw **$(amount)** coins!',
							ephemeral: true,
						},
					);
				}

				eco.balance.add(amount, member.id, guild.id);
				eco.bank.substract(amount, member.id, guild.id);

				embed
					.setTitle('Withdraw || Bank to Money ||')
					.setDescription('Successfully withdrawn $(amount) coins from your bank!')
					.setColor('Green');
				interaction.reply({ embeds: [embed] });
			}
				break;
			}
		}
			break;
		}
	},
};