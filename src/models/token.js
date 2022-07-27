const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Token = new Schema({
    name:{
        type:String,
        require:true
    },
    tokenId:{
        type:String,
        require:true
    },
    history:{
        type:[],
        default:[]
    }    
})

module.exports = mongoose.model('Token',Token);