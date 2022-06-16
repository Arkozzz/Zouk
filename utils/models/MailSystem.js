const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({

    _id: Number,
    discord_id: Number,
    discord_tag: String,
    first_name: String,
    second_name: String,
    promo: Number,
    email: String

});

const myDB = mongoose.connection.useDb('<dbname>');
module.exports = myDB.model('students', guildSchema);