let type;
module.exports = async (client, member, memberOld) => {
    console.log(member)

    if (member.roles > memberOld.roles && member.id.user === client.user.id) type = "add"
    else if (member.roles < memberOld.roles) type = "remove"
    else return;

    switch (type) {
        case "add":
        let channel = await client.channels.fetch()
            break;
        
        case "remove":
            
            break;
    }
}