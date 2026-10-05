const mongoose = require('mongoose');

const ipoSchema = new mongoose.Schema({
    ipoId: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    companyName: String,
    ipoName: String,
    Symbol: String,
    isin: String,
    industry: String,
    issueType: {
        type: String,
        default: 'regular'
    },
    exchange: [String],

    priceband: {
        min: Number,
        max: Number
    },
    lotsize: Number,
    minimumQuantity: Number,
    cutoffPrice: Number,
    faceValue: Number,

    opendate: Date,
    closedate: Date,
    allotmentdate: Date,
    listingdate: Date,
    refunddate: Date,
    mandatedate: Date,

    issuesize: Number,
    totalSubscription: String,

    subscription: {
        qib: Number,
        nii: Number,
        retail: Number,
        total: Number
    },
    gmp: {
        price: Number,
        percentage: Number,
        lastupdated: Date,
        source: String
    },
    registrar: String,
    registrarInfo: {
        name: String,
        email: String,
        contact_name: String,
        contact_number: String,
        website: String,
        registrar: String
    },
    rhpUrl: String,
    status: {
        type: String,
        enum: ['Upcoming', 'Open', 'Closed', 'Allotted', 'Listed'],
        default: 'Open'
    },

    source: {
        type: String,
        enum: ['ipo-guru', 'ipo-notify', 'upstox', 'IndianApi', 'Database'],
        default: 'upstox'
    },
    lastupdated: {
        type: Date,
        default: Date.now
    }
});

ipoSchema.index({ source: 1, opendate: -1 });
ipoSchema.index({ Symbol: 1 });
ipoSchema.index({ status: 1 });

module.exports = mongoose.model('Ipo', ipoSchema);
