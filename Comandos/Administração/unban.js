const Discord = require("discord.js");

module.exports = {
  name: "unban", 
  description: "Desbanir um usuário",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "ID do usuário a ser desbanido",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "motivo",
      description: "Motivo da punição",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    const channelId = "(ID do canal de logs)"; // Id do canal de logs
    const channel = client.channels.cache.get(channelId); //Pegar o cache dos canais

    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.BanMembers
      )
    ) {
      return interaction.reply({
        content: `Você não possui permissão para executar este comando.`,
        ephemeral: true,
      });
    }


    const userId = interaction.options.getString("user");
    const motivo = interaction.options.getString("motivo") || "Não definido.";

    // Cria embeds para sucesso e erro + logs
    const success = new Discord.EmbedBuilder()
      .setColor("Green")
      .setDescription(`Você retirou uma punição:`)
      .addFields(
        { name: "`⚠️ Jogador(a):`", value: userId },
        { name: "📋  `Motivo`", value: motivo, inline: true },
      );

    const success_log = new Discord.EmbedBuilder()
      .setColor("Green")
      .setDescription(
        `Houve uma remoção de banimento por membro da equipe administrativa.`)
      .addFields(
        { name: "`🔎 Administrador`", value: `<@${interaction.user.id}>`, inline: true },
        { name: "`⚠️ Jogador(a):`", value: userId, inline: true },
        { name: "📋  `Motivo`", value: motivo },
        { name: "Servidor que foi desbanido", value: interaction.guild.name, inline: true},
      );

    const erro = new Discord.EmbedBuilder()
      .setColor("Red")
      .setDescription(
        `Não foi possível desbanir o usuário com ID \`${userId}\` do servidor.`
      );

    const error_log = new Discord.EmbedBuilder()
      .setColor("Red")
      .setDescription(
        `Não foi possível desbanir o usuário com ID \`${userId}\` do servidor.`
      )
      .addFields({
        name: "Staff:",
        value: interaction.user.username,
        inline: true,
      });

    try {
      await interaction.guild.members.unban(userId, motivo);
      return interaction.reply(
        { embeds: [success], ephemeral: true },
        channel.send({ embeds: [success_log] })
      );
    } catch (e) {
      console.error("Erro ao desbanir o usuário:");
      return (
        interaction.reply({ embeds: [erro], ephemeral: true }),
        channel.send({ embeds: [error_log] })
      );
    }
  },
};
