const { connect } = require("mongoose").set('strictQuery', true);
const color = require("../functions/colorCodes")

module.exports = class DatabaseHandler {
    constructor(connectionString) {
        this.cache = new Map();
        this.guildModel = require('../models/guilds');
        this.connectionString = connectionString;
    }

    cacheSweeper(client) {
        setInterval(() => {
            const guilds = this.cache.values();
            for (const g of guilds) {
                if (!client?.servers?.has(g?.id)) {
                    this.cache.delete(g?.id);
                }
            }
        }, 60 * 60 * 1000);
    }

    guildSweeper(client) {
        setInterval(async () => {
            const guilds = await this.getAll();
            let i = 0;
            for (const g of guilds) {
                setTimeout(async () => {
                    i++;
                    if (!client?.servers?.has(g?.id)) {
                        this.cache.delete(g?.id)
                        this.deleteGuild(g?.id);
                    }
                }, i * 600)
            }
        }, 180 * 180 * 1000);
    }

    async connectToDatabase() {
        await connect(this.connectionString, {
            useNewUrlParser: true,
        }).catch((err) => {
            console.log(color("%", `%4[Mongoose]%7 :: ${err}`));
        }).then(() => console.log(
            color("%", "%6[Mongoose]%7 :: Connected to MongoDB"),
        ));
    }

    async fetchGuild(guildId, createIfNotFound = false) {
        const fetched = await this.guildModel.findOne({ id: guildId });

        if (fetched) return fetched;
        if (!fetched && createIfNotFound) {
            await this.guildModel.create({
                id: guildId,
                language: 'en_EN',
                botJoined: Date.now() / 1000 | 0,
            });

            return this.guildModel.findOne({ id: guildId });
        } return null;
    }

    async getGuild(guildId, createIfNotFound = true, force = false) {
        if (force) return this.fetchGuild(guildId, createIfNotFound);

        if (this.cache.has(guildId)) {
            return this.cache.get(guildId);
        }

        const fetched = await this.fetchGuild(guildId, createIfNotFound);
        if (fetched) {
            this.cache.set(guildId, fetched?.toObject() ?? fetched);

            return this.cache.get(guildId);
        } return null;
    }

    async deleteGuild(guildId, onlyCache = false) {
        if (this.cache.has(guildId)) this.cache.delete(guildId);

        return !onlyCache ? this.guildModel.deleteMany({ id: guildId }) : true;
    }

    async updateGuild(guildId, data = {}, createIfNotFound = false) {
        let oldData = await this.getGuild(guildId, createIfNotFound);

        if (oldData) {
            if (oldData?._doc) oldData = oldData?._doc;

            data = { ...oldData, ...data };

            this.cache.set(guildId, data);

            return this.guildModel.updateOne({
                id: guildId,
            }, data);
        } return null;
    }

    async getAll() {
        return this.guildModel.find();
    }
};