const {createCanvas, loadImage} = require('canvas')
const {MessageAttachment} = require("discord.js");
const rankSystem = require('../../utils/models/RankSystem.js');
//const colors = require('./drawing/data/color.json')


let CanvasImage = function(element, image) {
    this.image = image;
    this.element = element;
    this.context = this.element.getContext("2d");
    this.context.drawImage(this.image, 0, 0);
};
CanvasImage.prototype = {
    /**
     * Runs a blur filter over the image.
     * Class CanvasImage by https://gist.github.com/6174
     * @param {int} strength Strength of the blur.
     */
    blur: function (strength) {
        this.context.globalAlpha = 0.3 ; // Higher alpha made it more smooth
        // Add blur layers by strength to x and y
        // 2 made it a bit faster without noticeable quality loss
        for (let y = -strength; y <= strength; y += 2) {
            for (let x = -strength; x <= strength; x += 2) {
                // Apply layers
                this.context.drawImage(this.element, x, y);
                // Add an extra layer, prevents it from rendering lines
                // on top of the images (does makes it slower though)
                if (x>=0 && y>=0) {
                    this.context.drawImage(this.element, -(x-1), -(y-1));
                }
            }
        }
    }
};

const frame = async (x, y, w, h, radius, color, opacity, context) =>
{
    let r = x + w;
    let b = y + h;
    context.globalAlpha = opacity
    context.beginPath();
    context.strokeStyle = color ;
    context.lineWidth="3";
    context.moveTo(x+radius, y);
    context.lineTo(r-radius, y);
    context.quadraticCurveTo(r, y, r, y+radius);
    context.lineTo(r, y+h-radius);
    context.quadraticCurveTo(r, b, r-radius, b);
    context.lineTo(x+radius, b);
    context.quadraticCurveTo(x, b, x, b-radius);
    context.lineTo(x, y+radius);
    context.quadraticCurveTo(x, y, x+radius, y);
    context.stroke();
    context.closePath();
};

const pictureFillFrame = async (x, y, w, h, radius, path, context, canvas) =>
{
    let r = x + w;
    let b = y + h;
    context.beginPath();
    context.moveTo(x+radius, y);
    context.lineTo(r-radius, y);
    context.quadraticCurveTo(r, y, r, y+radius);
    context.lineTo(r, y+h-radius);
    context.quadraticCurveTo(r, b, r-radius, b);
    context.lineTo(x+radius, b);
    context.quadraticCurveTo(x, b, x, b-radius);
    context.lineTo(x, y+radius);
    context.quadraticCurveTo(x, y, x+radius, y);
    context.closePath();
    context.clip();
    context.globalAlpha = 0.1;
    let loadedBg = await loadImage(path)
    loadedBg.onload = () => {
        let x = new CanvasImage(canvas, loadedBg)
        x.blur(2)
    }
    loadedBg.src = path
    //context.drawImage(loadedBg, 0, 0, 825, 825);
    //context.fillRect(0, 0, 825,825);
    context.closePath();
};

const coloredFillFrame = async (x, y, w, h, radius, color, opacity, context, i=0) =>
{
    let r = x + w;
    let b = y + h;
    context.fillStyle = color
    context.globalAlpha = opacity

    // we only draw the right part if the xp is above 220 to avoid stylish problem :)
    if (w < 20) {
        // we wanna draw only the left arc and the right part need to be a vertical line
        // for stylish purpose :)
        context.beginPath();
        context.moveTo(x + radius + w, y);
        context.lineTo(x + radius, y);
        context.quadraticCurveTo(x, y, x, y + radius);
        context.lineTo(x, b - radius);
        context.quadraticCurveTo(x, b, x + radius, b);
        context.lineTo(x + radius + w, b);
        context.lineTo(x + radius + w, y);
    }
    else {
        // we wanna draw 2 arcs one at the right and one at the left
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(r - radius ,y);
        context.quadraticCurveTo(r, y, r, y + radius);
        context.lineTo(r, b - radius);
        context.quadraticCurveTo(r, b, r - radius, b);

        context.lineTo(x + radius, b);
        context.quadraticCurveTo(x, b, x, b - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);

    }

    context.fill();

    context.closePath();

    context.clip();

};

const applyText = (canvas, text, size) => {
    const ctx = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = size+10;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `bold ${fontSize -= 10}px Bahnschrift SemiBold`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > canvas.width - 300);

    // Return the result to use in the actual canvas
    return ctx.font;
};

const getLevel = async (interaction) => {
    return new Promise((resolve, reject) => {
        rankSystem.findOne({

                ID: interaction.user.id + "-" + interaction.guild.id

            },
            async (err, data) => {
                if (err) reject("Error occured with the DB");
                if (!data) {
                    console.log(interaction.user.id + "-" + interaction.guild.id)
                    interaction.reply("pas de level!")
                    const newD = new rankSystem({
                        ID: interaction.user.id + "-" + interaction.guild.id,
                        serverID: interaction.guild.id,
                        XP: 0,
                        LEVEL: 1,
                        RANK: 0
                    });
                    newD.save();
                }
                resolve(data.LEVEL)
            })
    })

};

const getRank = async (interaction) => {
    return new Promise((resolve, reject) => {
        rankSystem.findOne({

                ID: interaction.user.id + "-" + interaction.guild.id

            },
            async (err, data) => {
                if (err) reject("Error occured with the DB");
                if (!data) {
                    console.log(interaction.user.id + "-" + interaction.guild.id)
                    interaction.reply("pas de rang!")
                    const newD = new rankSystem({
                        ID: interaction.user.id + "-" + interaction.guild.id,
                        serverID: interaction.guild.id,
                        XP: 0,
                        LEVEL: 1,
                        RANK: 0
                    });
                    newD.save();
                }
                resolve(data.RANK)
            })
    })
};
const getCurrentXP = async (interaction) => {
    return new Promise((resolve, reject) => {
        rankSystem.findOne({

                ID: interaction.user.id + "-" + interaction.guild.id

            },
            async (err, data) => {
                if (err) reject("Error occured with the DB");
                if (!data) {
                    console.log(interaction.user.id + "-" + interaction.guild.id)
                    interaction.reply("pas d'xp!")
                    const newD = new rankSystem({
                        ID: interaction.user.id + "-" + interaction.guild.id,
                        serverID: interaction.guild.id,
                        XP: 0,
                        LEVEL: 1,
                        RANK: 0
                    });
                    newD.save();
                }
                resolve(data.XP)
            })
    })
};

module.exports = {
    name: "profile",
    run: async (client, interaction) => {

        const canvas = createCanvas(825, 825);
        const context = canvas.getContext('2d');
        const level = await getLevel(interaction)
            .catch((err) => console.log(err));
        const rank = await getRank(interaction)
            .catch((err) => console.log(err));
        let maxXp = 25 * (level ** 2) + 169 * level + 845;
        const curXp = await getCurrentXP(interaction)
        let pixelLevel = (curXp/maxXp) * 450;
        console.log(pixelLevel);
        // general forms
        context.save() // to reset when restored
        await frame(10, 10, 800, 800, 50, '#124fd4', 1, context);
        await pictureFillFrame(10, 10, 800, 800, 50, "./SlashCommands/global/drawing/pictures/background.jpg",  context, canvas);
        context.restore();
        // writting
        context.font = applyText(canvas, `${interaction.user.username}`, 50);
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'left';
        context.fillText(`${interaction.user.username}`, 75, 150); // limit to 14 characters
        context.font = applyText(canvas, `${interaction.user.tag}`,35);
        context.fillStyle = '#c4c4c4';
        context.fillText(`@${interaction.user.tag}`, 75, 190); // limit to 14 characters
        context.restore();
        //profil circle
        context.beginPath();
        context.fillStyle = '#ffffff';
        context.arc(650, 175, 110, 0, 2 * Math.PI);
        context.save()
        context.clip();
        context.fill();
        let profilImage = await loadImage(interaction.user.displayAvatarURL({format:"png"}));
        context.drawImage(profilImage, 540, 65, 220, 220);
        context.closePath();
        context.restore()

        /* aura profile
        let auraImage = await loadImage("./SlashCommands/global/drawing/pictures/aura.png");
        context.drawImage(auraImage, 510, 0, 310, 310);*/

        // black transparent rect
        await coloredFillFrame(25, 350, 769, 442, 40, "#252525", 0.5, context);
        context.restore();
        //xp bar design
        context.save();
        await coloredFillFrame(50, 450, pixelLevel, 25, 12.5, "#30a419", 1,  context);
        context.restore();
        await frame(47, 446.7, 456, 32, 14.5, "#FFFFFF",0.7, context);
        context.globalAlpha = 1;
        // text xp bar
        context.font = '23px Bahnschrift SemiBold'
        context.fillStyle = '#FFFFFF';
        context.fillText('xp', 65, 469);
        context.font = '19px Bahnschrift SemiBold'
        context.textAlign = "center";
        context.fillText(`${curXp}/${maxXp}`, 280, 469); // limit to 14 characters
        context.restore();
        context.font = '35px Bahnschrift SemiBold';
        context.textAlign = 'left'; //a partir du moment ou j'ai commence à utiliser align alors tout align
        context.fillText(`Level : ${level}         Rank : #${rank}/100`, 47, 410);
        //white line
        context.beginPath();
        context.fillStyle = '#FFFFFF';
        context.lineWidth = 1;
        context.moveTo(550,450);
        context.lineTo(550, 770);
        context.stroke()        ;
        // Social + Text
        let discordImage = await loadImage("./SlashCommands/global/drawing/pictures/discord_white.png");
        context.drawImage(discordImage, 575, 465, 40, 40);
        context.font = '21px Bahnschrift'
        context.align = 'left'
        context.fillStyle = '#bdbdbd';
        context.fillText('username', 630, 490);
        let instaImage = await loadImage("./SlashCommands/global/drawing/pictures/insta_white.png");
        context.drawImage(instaImage, 575, 545, 40, 40);
        context.font = '21px Bahnschrift'
        context.align = 'left'
        context.fillStyle = '#bdbdbd';
        context.fillText('username', 630, 570);
        let twitterImage = await loadImage("./SlashCommands/global/drawing/pictures/twitter_white.png");
        context.drawImage(twitterImage, 575, 625, 40, 40);
        context.font = '21px Bahnschrift'
        context.align = 'right'
        context.fillStyle = '#bdbdbd';
        context.fillText('username', 630, 650);
        let githubImage = await loadImage("./SlashCommands/global/drawing/pictures/github_white.png");
        context.drawImage(githubImage, 575, 705, 40, 40);
        context.font = '21px Bahnschrift'
        context.align = 'right'
        context.fillStyle = '#bdbdbd';
        context.fillText('username', 630, 730);
        context.save();

        const buffer = new MessageAttachment(canvas.toBuffer(), 'profilecard.png');
        await interaction.reply({files:[buffer]});
    }
};