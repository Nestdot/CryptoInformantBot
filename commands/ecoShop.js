const {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	WebhookClient,
} = require(`discord.js`);

const eco = require(`../database/ecoDB`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName(`eco-shop`)
		.setDescription(`The economy shop`)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(`add-item`)
				.setDescription(`Adds an item to the shop`)
				.addStringOption((option) =>
					option
						.setName(`item`)
						.setDescription(`The name of the item`)
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName(`price`)
						.setDescription(`The price of the item`)
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName(`message`)
						.setDescription(`The message the user gets when the item is used`)
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName(`description`)
						.setDescription(`The description of the item`)
						.setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName(`amount`)
						.setDescription(`The maximum amount of this item a user can have`)
						.setRequired(false),
				)
				.addRoleOption((option) =>
					option
						.setName(`role`)
						.setDescription(`Adds a role to someone when they buy this item`)
						.setRequired(false),
				),
		)

		.addSubcommand((subcommand) =>
			subcommand
				.setName(`remove-item`)
				.setDescription(`Remove an item from the shop`)
				.addStringOption((option) =>
					option
						.setName(`item`)
						.setDescription(`The name of the item`)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(`buy-item`)
				.setDescription(`Buy an item from the shop`)
				.addStringOption((option) =>
					option
						.setName(`item`)
						.setDescription(`The name of the item`)
						.setRequired(true),
				),
		)

		.addSubcommand((subcommand) =>
			subcommand
				.setName(`list`)
				.setDescription(`Lists all the items the shop`),
		)

		.addSubcommand((subcommand) =>
			subcommand
				.setName(`clear`)
				.setDescription(`Clears the whole shop`),
		)

		.addSubcommand((subcommand) =>
			subcommand
				.setName(`search-item`)
				.setDescription(`Search for an item in the shop`)
				.addStringOption((option) =>
					option
						.setName(`item`)
						.setDescription(`The name of the item`)
						.setRequired(true),
				),
		),
	/**
     *
     * @param {ChatInputCommandInteraction} interaction
      */
	async execute(interaction) {
		const { guild, member } = interaction;
		const embed = new EmbedBuilder;
		const sub = interaction.options.getSubcommand();

		switch (sub) {
		case (`add-item`) : {
			if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
				return interaction.reply({
					embeds: [embed.setName(`Unauthorized Access`).setDescription(`You do not have permission to use this command!`)],
				});
			}

			const item = interaction.options.getString(`item`);
			const price = interaction.options.getNumber(`price`);
			const message = interaction.options.getString(`message`);
			const description = interaction.options.getString(`description`);
			const amount = interaction.options.getNumber(`amount`);
			const role = interaction.options.getRole(`role`);

			eco.shop.addItem(guild.id, {
				name: item,
				price: price,
				message: message,
				description: description,
				maxAmount: amount,
				role: role,
			});

			interaction.reply({
				content: `✅ | Item was successfully added!`,
				ephemeral: true,
			});
		}
			break;
		case (`remove-item`) : {
			if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
				return interaction.reply({
					embeds: [embed.setName(`Unauthorized Access`).setDescription(`You do not have permission to use this command!`)],
				});
			}

			const removeItem1 = interaction.options.getString(`item`);
			if (!removeItem1) return interaction.reply(`Specify an item ID or name`);

			const removeItem2 = eco.shop.getItem(removeItem1, guild.id);
			if (!removeItem2) return interaction.reply(`Could not find item ${removeItem1}`);

			eco.shop.removeItem(removeItem1, guild.id);

			embed
				.setTitle(`Shop info`)
				.setColor(`Green`)
				.setDescription(`Successfully removed this item from the shop`);
			interaction.reply({ embeds: [embed] });
		}
			break;
		case (`buy-item`) : {
			const buyItem1 = interaction.options.getString(`item`);

			const buyBalance = eco.balance.fetch(member.id, guild.id);
			if (!buyItem1) return interaction.reply(`Specify an item ID or name`);

			const buyItem2 = eco.shop.findItem(buyItem1, guild.id);
			if (!buyItem2) return interaction.reply(`Cannot find item ${buyItem1}`);
			if (buyItem2.price > buyBalance) return interaction.reply(`You do not have enough money to buy this item`);

			const purchaseItem = eco.shop.buy(buyItem1, member.id, guild.id);
			if (purchaseItem === `max`) return interaction.reply(`You can not have more than ${buyItem2.maxAmount} of item ${buyItem2.name}`);

			if (member.roles.cache.has(buyItem2.role)) return interaction.reply(`You can not buy this as you already have the role for buying it!`);

			if (buyItem2.role)interaction.guild.members.cache.get(interaction.member.id).roles.add(interaction.guild.roles.cache.get(buyItem2.role));

			interaction.reply(`You have received item ${buyitem2.name} for ${buyitem2.price} coins!`);

		}
			break;
		case (`list`) : {
			const shopList = eco.shop.all(guild.id);

			let listMap = shopList.map(item => `ID: **${item.id}** = **${item.name}** (**${item.price}** coins)\nDescription: ${item.description}\nMax amount per person: ${item.maxAmount || `Infinity`}\nRole: ${item.role || \`No role with this item\`}`);
			if (!shopList.length) return interaction.reply(`There is nothing in this guild's shop`);

			embed
				.setTitle(`Shop`)
				.setTimestamp()
				.setColor(`Random`)
				.setDescription(listMap.join(`\n`));
			interaction.reply({ embeds: [embed] });
		}
			break;
		case (`clear`) : {
			if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
				return interaction.reply({
					embeds: [embed.setName(`Unauthorized Access`).setDescription(`You do not have permission to use this command!`)],
				});
			}

			eco.shop.clear(guild.id);
			interaction.reply(`Cleared the whole shop`);
		}
			break;
		case (`search-item`) : {
			const searchItem = interaction.options.getString(`item`);
			if (!searchItem) return interaction.reply(`Specify an item ID or name`);

			const searchitem1 = eco.shop.findItem(searchItem, guild.id);
			if (!searchitem1) return interaction.reply(`There is no such item in the shop`);

			embed
				.setTitle(`Item info`)
				.setColor(`Random`)
				.setFields(
					{ name: `Item ID & name`, value: `${searchitem1.id} || ${searchitem1.name}` },
					{ name: `Item price`, value: `${searchitem1.price}` },
					{ name: `Item description`, value: `${searchitem1.description}` },
					{ name: `Item max per person`, value: `${searchitem1.maxAmount}` },
					{ name: `Role given on purchase`, value: `${searchitem1.role}` },
				);
			interaction.reply({ embeds: [embed] });
		}
			break;
		}
	},
};