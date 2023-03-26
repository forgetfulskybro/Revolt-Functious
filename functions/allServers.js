function allServers(client) {
    let names = [];
    let iterator = client.servers.entries();
    for (let v = iterator.next(); !v.done; v = iterator.next()) {
        names.push(v.value[1]);
    };
    return names.map(e => e);
}

module.exports = allServers;