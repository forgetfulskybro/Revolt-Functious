class Paginator {
    constructor({ user, client, timeout }) {
        this.pages = [];
        this.client = client;
        this.user = user;
        this.page = 0;
        this.timeout = timeout;
    }

    add(page) {
        if (page.length) {
            page.forEach((x) => { this.pages.push(x) });
            return this;
        }
        this.pages.push(page);
        return this;
    }
 
    async start(channel) {
        if (!this.pages.length) return;
        const reactions = ["⏪", "⬅️", "➡️", "⏩"];
        this.pages.forEach((e, i=0) => { e.description = `${e.description}\n\nPage ${i+1} / ${this.pages.length}` })
        const message1 = await channel.sendMessage({ embeds: [this.pages[0]], interactions: { reactions } });
        this.client.paginate.set(this.user, { pages: this.pages, page: this.page, message: message1._id });
        setTimeout(() => { this.client.paginate.delete(this.user) }, this.timeout);
    }
}

module.exports = Paginator;