const Discord = require("discord.js");

module.exports = {
  name: "clear",
  description: "Limpar canal",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "quantidade",
      description: "Número de mensagens para apagar",
      type: Discord.ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const channelId = "1377604624436957214";
    const channel = client.channels.cache.get(channelId);
    const numero = interaction.options.getNumber("quantidade");
    const numeroStr = typeof numero === 'number' ? numero.toString() : numero;

    // Verifica se o usuário tem permissão para gerenciar mensagens
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.ManageMessages
      )
    ) {
      return interaction.reply({
        content: "Você não possui permissão para utilizar este comando",
        ephemeral: true,
      });
    }

    if (numero > 101 || numero <= 0) {
      const embed = new Discord.EmbedBuilder()
        .setColor("Random")
        .setDescription("`/clear [1 - 101]`");
      return interaction.reply({ embeds: [embed] });
    }

    try {

      const pinnedMessages = await interaction.channel.messages.fetchPinned();

      const messages = await interaction.channel.messages.fetch({ limit: numero });


      const messagesToDelete = messages.filter(msg => !pinnedMessages.has(msg.id));


      await interaction.channel.bulkDelete(messagesToDelete, true);

      //embed de logs
      const clear_log = new Discord.EmbedBuilder()
        .setDescription(`O chat ${interaction.channel}, teve \`${messagesToDelete.size}\` mensagens apagadas.`)
        .addFields(
          { name: "Staff:", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Quantidade de mensagens:", value: messagesToDelete.size.toString(), inline: true },
        );


      const embed = new Discord.EmbedBuilder()
        .setDescription(
          `O canal de texto ${interaction.channel} teve \`${messagesToDelete.size}\` mensagens deletadas por \`${interaction.user.username}\`.`
        );

      const reply = await interaction.reply({
        embeds: [embed],
        fetchReply: true,
      });

     
      await channel.send({embeds: [clear_log]});


      setTimeout(() => {
        reply.delete().catch(console.error);
      }, 5000);
    } catch (error) {
      console.error("Erro ao deletar mensagens:", error);
      interaction.reply({
        content: "Ocorreu um erro ao tentar deletar as mensagens.",
        ephemeral: true,
      });
    }
  },
};
