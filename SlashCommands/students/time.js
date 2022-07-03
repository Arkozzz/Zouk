module.exports = {
    name: "time",
    run: async (client, interaction) => {

        const now = new Date();
        const jour = now.getDate();
        const mois = (now.getMonth()+ 1).toISOString();
        const heure = now.getHours();
        const minute = now.getMinutes();

        await interaction.reply(`> ${jour}/${mois}, ${heure}h${minute}`)
    }
};