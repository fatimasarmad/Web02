const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    name: String,
    email: String,
    password: String,
    token: { type: String, required: false },
});

module.exports = mongoose.model('Admin', AdminSchema);
