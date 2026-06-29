const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildVoiceStates
  ],
});

module.exports = client;

client.slashCommands = new Discord.Collection();

client.on("interactionCreate", (interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    const cmd = client.slashCommands.get(interaction.commandName);

    if (!cmd) return interaction.reply(`Error`);

    interaction["member"] = interaction.guild.members.cache.get(
      interaction.user.id
    );

    cmd.run(client, interaction);
  }
});


client.on("ready", () => {
  console.log(`Bot online!`);
  console.log(`${client.user.tag} ID do BOT: ${client.user.id}`);


  client.user.setPresence({
    activities: [{ name: 'Ajudando a comunidade', type: Discord.ActivityType.Listening }], // Altere o tipo e o nome conforme necessário
    status: 'idle' // Pode ser 'online', 'idle', 'dnd' (Do Not Disturb), ou 'invisible'
    
  });

});
require("./handler")(client);

client.login(config.token);
