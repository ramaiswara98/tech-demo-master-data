const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payer = new Schema({
    name:{
        type:String,
        require:true,
    },
    secretKey:{
        type:String,
        require:true,
    },
    publicKey:{
        type:String,
        require:true,
    },
    amount:{
        type:Number,
        require:true,
        default:0
    }
})

module.exports = mongoose.model('Payer',Payer);