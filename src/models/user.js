const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type:String,
        require:true,
    },
    email: {
        type:String,
        require:true
    },
   password: {
        type:String,
        require:true
    },
    walletPublicKey: {
        type:String,
        require:true
    },
    walletSecretKey: {
        type:String,
        require:true
    },
    payer: {
        type:String,
        require:true,
        default:""
    },
    token: {
        type:Array,
        require:true,
        default:[]
    },
    isAdmin :{
        type:Boolean,
        default:false
    },
    isOrganiser :{
        type:Boolean,
        default:false
    },
    isUser :{
        type:Boolean,
        default:false
    },
    taskDone:{
        type:[],
        default:[]
    }
},{
    timestamp:true
    
})

module.exports = mongoose.model('User',User);