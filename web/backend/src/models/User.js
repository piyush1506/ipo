const mongoose = require('mongoose');

const panSchema = new mongoose.Schema({
    panNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please fill a valid PAN number']
    },
    name: {
        type: String,
        trim: true
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        trim: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    picture: String,
    expoPushToken: String,
    pans: [panSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
