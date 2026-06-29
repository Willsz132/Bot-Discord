const Discord = require("discord.js");

const discord_log = "(ID do Servidor)" //Id do servidor


module.exports = {
    name: "setstatus",
    description: "Configure o status do bot.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "descrição",
            description: "Coloque a descrição do bot?",
            required: true,
        }
    ],

    run: async (client, interaction) => {
        const channelId = "(ID do canal)";
        const channel = client.channels.cache.get(channelId);
        let staff_cargo = ["(ID do cargo)",]; // Squad
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
            if (interaction.guild.id !== discord_log) {
                return interaction.reply({ 
                    content: `Utilize este comando no servidor principal!`, 
                    ephemeral: true 
                });
            }
            
        try {
            let desc = interaction.options.getString("descrição");
            let waiting = new Discord.EmbedBuilder()
            .setColor("2db4cc")
            .setTitle("Aguarde enquanto estou fazendo o processamento da alteração do Status")
            .addFields({
                name: `Status a ser alterado:`,
                value: `\`${desc}\`.`,
            })    


            await interaction.reply({ embeds: [waiting], ephemeral: true })


            let embed = new Discord.EmbedBuilder()
            .setColor("4acc2d")
            .setTitle("Status atualizado!")
            .addFields(
                {
                    name: ` O status do bot foi alterado para:`,
                    value: `\`${desc}\`.`,
                    inline: false
                },

            )

            let embed_log = new Discord.EmbedBuilder() // Fazer
            .setColor("2d75cc")
            .setTitle("Meu status foi alterado")
            .addFields(
                {
                    name: ` Descrição alterada para:`,
                    value: `\`${desc}\`.`,
                    inline: false
                },
                {
                    name: ` Quem alterou meu status:`,
                    value: `<@${interaction.user.id}>`,
                    inline: false
                },
            )
            //await interaction.deferReply({ ephemeral: true });
            setTimeout(async () => {
                
            client.user.setPresence({
                activities: [{
                    name: desc
                }],
            });
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                channel.send({ embeds: [embed_log] });
            }, 1000);
        
        } catch (error) {
            return console.log(`Ops ${interaction.user}, algo deu errado ao executar este comando.`);
        }}}