const Discord = require("discord.js");

module.exports = {
  name: "suporte",
  description:
    "Mostra uma lista de comandos disponíveis ou detalhes sobre um comando específico.",
  type: Discord.ApplicationCommandType.ChatInput,

  options: [
    {
      name: "comando",
      description: "Especifique o comando para obter mais informações.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {name: "Teste ", value: "Teste"},
      ],
    },
  ],

  run: async (client, interaction) => {

    const commands = [
      {
        name: "Teste",
        title: "📑 Teste",
        description:
         "Teste para funcionamento",
        color: "#363636",
      },

    ];

    const commandName = interaction.options.getString("comando")?.toLowerCase();


    let staff_cargo = ["(ID do cargo)"]; // Cargo Staff

    if (
      !interaction.member.roles.cache.some((role) =>
        staff_cargo.includes(role.id)
      )
    ) {
      return interaction.reply({
        content: `Você não possui permissão para executar este comando.`,
        ephemeral: true,
      });
    }

    if (commandName) {

      const command = commands.find(
        (cmd) => cmd.name.toLowerCase() === commandName
      );

      if (command) {

        const commandEmbed = new Discord.EmbedBuilder()
          .setTitle(command.title)
          .setDescription(command.description)
          .setColor(command.color);

        await interaction.reply({ embeds: [commandEmbed] });
      } else {

        await interaction.reply({
          content:
            "Comando não encontrado. Use `/help` para ver a lista de comandos disponíveis.",
          ephemeral: true,
        });
      }
    } else {
      let counter = 1;  
      const helpEmbed = new Discord.EmbedBuilder()
        .setDescription("Aqui está uma lista de comandos que você pode usar:")
        .setColor("Random");



        commands.forEach((cmd) => {
          helpEmbed.addFields({ name: '\u200B', value: `${counter}. ${cmd.name}` });
          counter++;
        });
        

      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }
  },
};

