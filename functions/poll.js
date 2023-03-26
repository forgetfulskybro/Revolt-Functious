const PollDB = require("../models/polls");
const Embed = require("./embed");
const Canvas = require('canvas');
const format = `${(new Date().getMonth() + 1) < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()} ${new Date().getHours()}:${(new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes()}`;
class Polls {
    constructor({ time, client, name, options, users, avatars, votes, owner }) {
        this.client = client;
        this.time = time;
        if (votes) this.votes = votes;
        else this.votes = options.name.length === 2 ? [0, 0] : options.name.length === 3 ? [0, 0, 0] : options.name.length === 4 ? [0, 0, 0, 0] : [0, 0, 0, 0, 0];
        this.users = users || [];
        this.avatars = avatars || [];
        this.options = { name: name.name, description: name.description };
        this.voteOptions = options;
        this.owner = owner;
        this.size = { canvas: options.name.length === 2 ? 200 : options.name.length === 3 ? 250 : options.name.length === 4 ? 300 : 350, bar: options.name.length === 2 ? 150 : options.name.length === 3 ? 200 : options.name.length === 4 ? 250 : 300 };
    }

    async start(message, poll) {
        this.client.polls.set(message._id, { poll, messageId: message._id, users: this.users, owner: this.owner })
        setTimeout(async () => {
            if (!this.client.polls.get(message._id)) return;
            await this.update();
            message.edit({ embeds: [new Embed().setMedia(await this.client.Uploader.upload(poll.canvas.toBuffer(), `Poll.png`)).setColor(`#F24646`)], content: "This poll has ended and these are the results:" }).catch(() => { })
            this.client.polls.delete(message._id);
            await PollDB.findOneAndDelete({ messageId: message._id });
        }, this.time);

        if (this.time < 0) return;
        await (new PollDB({
            owner: this.owner,
            channelId: message.channel._id,
            messageId: message._id,
            avatars: this.avatars,
            users: this.users,
            votes: this.votes,
            desc: this.options.description,
            options: this.voteOptions,
            time: this.time,
            now: Date.now(),
        }).save());
    }

    textHeight(text, ctx, m) {
        let metrics = m || ctx.measureText(text);
        return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }

    roundRect(ctx, x, y, width, height, radius, fill, stroke) { // Credit to https://stackoverflow.com/users/227299/juan-mendes
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    }

    async update() {
        let roundRect = this.roundRect;
        let textHeight = this.textHeight;

        var width = 600, height = this.size.canvas, padding = 10;
        const canvas = Canvas.createCanvas(width, height);
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        this.ctx = ctx;

        let name = this.options.name.length > 83 ? this.options.name.substring(0, 80) + "..." : this.options.name;
        var nameHeight = textHeight(name, ctx);

        let description = this.options.description.length > 83 ? this.options.description.substring(0, 80) + "..." : this.options.description;
        var descHeight = textHeight(description, ctx);

        ctx.fillStyle = "#23272A";
        roundRect(ctx, 0, 0, width, height, 5, true, false); // background

        ctx.fillStyle = "#4E535A";
        ctx.font = `normal 12px Sans-Serif`;
        ctx.fillText(name, padding, padding + 2 + nameHeight / 2); // name

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `normal 17px Sans-Serif`;
        ctx.fillText(description, padding, padding + 15 + nameHeight + descHeight / 2); // description

        var headerHeight = padding + descHeight + nameHeight + 15;
        var dataWidth = width - padding * 2;
        var barHeight = 40;
        var votes = this.votes;
        var names = this.voteOptions.name;

        this.drawVoteBars(ctx, dataWidth - 20, barHeight, votes, { pad: padding, hHeight: headerHeight }, names);
        await this.drawFooter(ctx, padding, padding + headerHeight + barHeight * 2 + 20, width, height, padding, this.avatars);
    }

    async addVote(option, user, avatar, id) {
        if (this.avatars.length == 6) this.avatars.shift();
        this.avatars.push(avatar);
        this.votes[option]++;
        await PollDB.findOneAndUpdate({ messageId: id }, { $push: { users: user, avatars: avatar }, $inc: { [`votes.${option}`]: 1 } });
        await this.update();
        return this.canvas;
    }

    drawVoteBars(ctx, width, height, votes, vars, names, vote) {
        let roundRect = this.roundRect;
        let textHeight = this.textHeight;
        let padding = vars.pad;
        let headerHeight = vars.hHeight;
        let sum = votes.reduce((prev, curr) => prev + curr);
        let percentages = votes.map((v) => Math.floor(v / (sum / 100) * 10) / 10);
        ctx.save();
        ctx.translate(padding, padding + headerHeight);

        var barPadding = 5;
        percentages.forEach((percentage, i) => {
            if (!percentage) percentage = 0;
            let paddingLeft = (vote != undefined) ? 30 : 0;

            ctx.fillStyle = "#2C2F33";
            let y = (height + 10) * i;
            roundRect(ctx, 20, y, width, height, 5, true, false); // full bar

            if (vote == i || percentage) { ctx.fillStyle = "#A52F05"; }
            else { ctx.fillStyle = "#24282B"; } // percentage display
            roundRect(ctx, 20, y, width * (votes[i] / (sum / 100) / 100), height, 5, true, false);

            ctx.fillStyle = "#4E535A";
            let h = textHeight(i + 1, ctx);
            ctx.fillText(i + 1, 0, y + height / 2 + h / 2);

            ctx.fillStyle = "#FFFFFF"; // Option names
            h = textHeight(names[i], ctx);
            ctx.fillText(names[i].length > 46 ? names[i].substring(0, 46) + "..." : names[i], 30 + paddingLeft, y + 13 + h);

            if (vote != undefined) {
                ctx.strokeStyle = "#FFFFFF"; // selection circle
                ctx.fillStyle = "#717cf4";
                ctx.beginPath();
                ctx.arc(35, y + 10 + h * 0.75, 6, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();
                if (vote == i) {
                    ctx.beginPath();
                    ctx.arc(35, y + 10 + h * 0.75, 3, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            ctx.fillStyle = "#2C2F33"; // percentage and vote count background
            let metrics = ctx.measureText(percentage + "% (" + votes[i] + ")");
            let w = metrics.width;
            h = textHeight(percentage + "% (" + votes[i] + ")", ctx, metrics);
            y = y + (height - h - barPadding * 2) + barPadding * 2.6;
            if (vote == i || vote == undefined) roundRect(ctx, width - barPadding - w - 3, y - h - 4, w + 5, h + 12, 5, true, false);

            ctx.fillStyle = "#A52F05"; // percentage and vote count
            ctx.fillText(percentage + "% (" + votes[i] + ")", width - barPadding - w, y);
        });
        ctx.restore();
    }

    async drawFooter(ctx, x, y, width, height, padding, users) {
        ctx.save();
        ctx.translate(10, this.size.bar);

        var rad = 18;
        ctx.fillStyle = "#4E535A";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#4E535A";
        ctx.beginPath();
        ctx.moveTo(0 - padding, 0);
        ctx.lineTo(width, 0);
        ctx.stroke();

        let votes = (this.votes.reduce((p, c) => p + c) == 1) ? `${this.votes.reduce((p, c) => p + c)} vote` : `${this.votes.reduce((p, c) => p + c)} votes`;
        let metrics = ctx.measureText(votes);
        let h = this.textHeight(votes, ctx, metrics);
        ctx.fillText(votes, 5, rad + h);

        // Avatars
        var pos = rad * users.length + 10 + metrics.width;
        var yPos = 6;
        users.reverse();
        for (let i = 0; i < users.length; i++) {
            ctx.beginPath();
            let user = users[i];

            const a = Canvas.createCanvas(rad * 2, rad * 2);
            const context = a.getContext("2d");

            context.beginPath();
            context.arc(rad, rad, rad, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            const avatar = await Canvas.loadImage(user);
            context.drawImage(avatar, 0, 0, rad * 2, rad * 2);
            ctx.drawImage(a, pos, yPos);

            ctx.closePath();
            pos -= rad;
        }

        // Date
        let date = format;
        metrics = ctx.measureText(date);
        h = this.textHeight(date, ctx, metrics);
        ctx.fillText(date, width - 15 - metrics.width, rad + h);
        ctx.restore();
    }
}

module.exports = Polls;