const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Request = new Schema({
    organiserName:{
        type:String,
        require:true
    },
    organiserWallet:{
        type:String,
        require:true
    },
    token:{
        type:{},
        require:true
    },
    amount:{
        type:Number,
        require:true
    },
    existing:{
        type:Boolean,
        default:false
    },
    signature:{
        type:String,
        default:""
    },
    status:{
        type:String,
        require:true,
        default:"pending"
    }
})

module.exports = mongoose.model('Request',Request);