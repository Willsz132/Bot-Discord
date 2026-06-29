const Discord = require("discord.js");
const { addMilliseconds, formatDuration, intervalToDuration } = require("date-fns");

function parseDuration(durationStr) {
  const regex = /^(\d+)([smhd])$/; // Regex para correspondência com s, m, h, d (segundos, minutos, horas, dias)
  const match = durationStr.match(regex);

  if (!match) {
    return NaN;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000; 
    case "m":
      return value * 1000 * 60; 
    case "h":
      return value * 1000 * 60 * 60; 
    case "d":
      return value * 1000 * 60 * 60 * 24; 
    default:
      return NaN;
  }
}

function traduzirTempo(msDuration) {
  const duration = intervalToDuration({ start: 0, end: msDuration });

  const tempoEmIngles = formatDuration(duration, { delimiter: ", " });

  const traducoes = {
    years: "anos",
    year: "ano",
    months: "meses",
    month: "mês",
    weeks: "semanas",
    week: "semana",
    days: "dias",
    day: "dia",
    hours: "horas",
    hour: "hora",
    minutes: "minutos",
    minute: "minuto",
    seconds: "segundos",
    second: "segundo",
  };

  const tempoEmPortugues = tempoEmIngles.replace(
    /\b(?:years?|months?|weeks?|days?|hours?|minutes?|seconds?)\b/g,
    (matched) => {
      return traducoes[matched];
    }
  );

  return tempoEmPortugues;
}

module.exports = {
  name: "timeout",
  description: "Dar castigo ao jogador",
  options: [
    {
      name: "user",
      description: "User que você quer punir",
      type: Discord.ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "duração",
      description: "Tempo de duração (ex: 30s, 1m, 5h, 1d)",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "motivo",
      description: "Motivo da punição",
      type: Discord.ApplicationCommandOptionType.String,
    },
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const userId = interaction.guild.members.cache.get(user.id);
    const mentionable = interaction.options.get("user").value;
    const duration = interaction.options.get("duração").value;
    const reason = interaction.options.get("motivo")?.value || "Sem motivo descrito";
    const channelId = "(Id do canal das logs)"; // Id do canal de logs
    const channel = client.channels.cache.get(channelId);

    try {
      if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.MuteMembers)) {
        return interaction.reply({
          content: "Você não possui permissão para executar este comando.",
          ephemeral: true,
        });
      }

      const targetUser = await interaction.guild.members.fetch(mentionable);
      if (!targetUser) {
        await interaction.reply("Esse jogador não está no servidor");
        return;
      }
      if (targetUser.user.bot) {
        await interaction.reply("Não é permitido aplicar punição em bots");
        return;
      }

      const msDuration = parseDuration(duration);
      if (isNaN(msDuration)) {
        await interaction.reply("Por favor, aplique um valor válido de duração");
        return;
      }

      const targetUserRolePosition = targetUser.roles.highest.position;
      const requestUserRolePosition = interaction.member.roles.highest.position;
      const botRolePosition = interaction.guild.members.me.roles.highest.position;

      // Embeds
      const punish_sucess = new Discord.EmbedBuilder()
        .setColor("#363636")
        .setDescription(`O jogador com ID ${userId} foi punido com sucesso.`);

      const punish_sucess_log = new Discord.EmbedBuilder()
        .setColor("#363636")
        .setDescription(`O jogador com ID ${userId} foi aplicado uma punição de ${traduzirTempo(msDuration)}.\ Motivo: ${reason}`)
        .addFields(
          { name: "Staff:", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Motivo", value: reason, inline: true },
          { name: "Tempo", value: traduzirTempo(msDuration), inline: true }
        );

      const punish_changed = new Discord.EmbedBuilder()
        .setColor("#363636")
        .setDescription(`O jogador com ID ${userId} teve uma punição alterada com sucesso.`);

      const punish_changed_log = new Discord.EmbedBuilder()
        .setColor("#363636")
        .setDescription(`<:drp_logo:1276265250198388859> O jogador com ID ${userId} teve uma punição alterada.`)
        .addFields(
          { name: "Jogador punido:", value: `${userId}`, inline: false },
          { name: "Staff:", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Motivo:", value: reason, inline: true },
          { name: "Tempo", value: traduzirTempo(msDuration), inline: false }
        );

      if (targetUserRolePosition >= requestUserRolePosition) {
        await interaction.reply("Você não pode aplicar punição na pessoa que tem o cargo igual ou maior que o seu");
        return;
      }
      if (targetUserRolePosition >= botRolePosition) {
        await interaction.reply("Não posso aplicar punição em uma pessoa que tem um cargo igual ou maior que o meu");
        return;
      }

      // Aplicação da punição
      if (targetUser.communicationDisabledUntil && targetUser.communicationDisabledUntil > Date.now()) {
        await targetUser.timeout(msDuration, reason);
        await interaction.reply({
          embeds: [punish_changed],
          ephemeral: true,
        });
        channel.send({ embeds: [punish_changed_log] });
      } else {
        await targetUser.timeout(msDuration, reason);
        await interaction.reply({
          embeds: [punish_sucess],
          ephemeral: true,
        });
        channel.send({ embeds: [punish_sucess_log] });
      }

      // Envio da mensagem privada ao usuário punido
      const dmMessage = new Discord.EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Você foi punido")
        .setDescription("Você recebeu um mute")
        .addFields(
          { name: "Motivo", value: reason, inline: false },
          { name: "Duração", value: traduzirTempo(msDuration), inline: false },
          { name: "Staff", value: `<@${interaction.user.id}>`, inline: false }
        );

      try {
        await user.send({ embeds: [dmMessage] });
      } catch (error) {
        console.error(`Não foi possível enviar a DM para o usuário: ${error}`);
        // Opcional: enviar uma mensagem no canal avisando que não foi possível enviar a DM
      }
    } catch (error) {
      console.error(`Ocorreu um erro na aplicação da punição: ${error}`);
      await interaction.reply("Ocorreu um erro ao aplicar a punição.");
    }
  },
};
