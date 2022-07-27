const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Task = new Schema({
    title:{
        type:String,
        require:true
    },
    organiserId:{
        type:String,
        require:true
    },
    maxParticipant:{
        type:Number,
        require:true
    },
    deadline:{
        type:Date,
        require:true
    },
    urlList:{
        type:Array,
        require:true
    },
    response:{
        type:Array,
        require:true,
        default:[]
    },
    choosenPic:{
        type:Array,
        default:[]
    }
})

module.exports = mongoose.model('Task',Task);