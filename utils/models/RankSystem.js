const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
    
    ID: String,
    serverID: String,
    XP: Number,
    LEVEL: Number,
    RANK: Number


});

const myDB = mongoose.connection.useDb('zouk');
module.exports = myDB.model('rank_systems', guildSchema);