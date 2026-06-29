const Discord = require("discord.js");

module.exports = {
  name: "ban",
  description: "Banir um usuário",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuario",
      description: "Mencione o usuário a ser banido",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "motivo",
      description: "Insira o motivo",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    const channelId = "1377604624436957214"; // ID do canal para logs
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
      console.error(`Canal com ID ${channelId} não encontrado.`);
      return interaction.reply({
        content: `Canal de logs não encontrado.`,
        ephemeral: true,
      });
    }

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: `Você não possui permissão para executar este comando.`,
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("usuario");
    const motivo = interaction.options.getString("motivo") || "Motivo não definido";

    try {
      // Verificar se o usuário já está banido
      const banInfo = await interaction.guild.bans.fetch(user.id).catch(() => null);
      if (banInfo) {
        // Se o jogador já foi banido, enviar mensagem de erro
        return interaction.reply({
          content: `O jogador já se encontra banido com o motivo: **${banInfo.reason || "Motivo não definido"}**.`,
          ephemeral: true,
        });
      }

      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      // Embeds
      const success = new Discord.EmbedBuilder() // Banido
        .setColor("ad1f1f")
        .setDescription(`A punição foi aplicada corretamente`)
        .addFields(
          { name: "`⚠️ Punido(a):`", value: user.id, inline: true },
          { name: "📋  `Motivo`", value: motivo }
        );

      const erro = new Discord.EmbedBuilder() // Erro ao banir
        .setColor("Red")
        .setDescription(`Não foi possível banir o usuário ${user} do servidor.`);

      const ban_log = new Discord.EmbedBuilder() // Banimento enviado para o canal de logs
        .setColor("#ad1f1f")
        .setDescription("<:drp_ocupado:1276265525348925541> Punição aplicada")
        .addFields(
          { name: "`🔎 Administrador`", value: `<@${interaction.user.id}>`, inline: true },
          { name: "`⚠️ Punido(a):`", value: user.id, inline: true },
          { name: "📋  `Motivo`", value: motivo },
          { name: "Servidor que foi banido", value: interaction.guild.name }
        );

      if (member) {
        await member.ban({ reason: motivo });
      } else {
        await interaction.guild.bans.create(user.id, { reason: motivo });
      }

      await interaction.reply({ embeds: [success], ephemeral: true });
      await channel.send({ embeds: [ban_log] });

    } catch (e) {
      console.error("Erro ao banir o usuário:", e);
      await interaction.reply({ embeds: [erro], ephemeral: true });
    }
  },
};
