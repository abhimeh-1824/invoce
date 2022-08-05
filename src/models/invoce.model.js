const mongoose = require("mongoose");
const invoiceSchema = new mongoose.Schema({
    invoiceNumber:{
        type:Number,
        required:true,
        unique:true
    },invoiceDate:{
        day:{
        type:Number,
        required:true,
        },
        month:{
        type:Number,
        required:true,
        },
        year:{
        type:Number,
        required:true,
        }
    },invoiceAmount:{
        type:Number,
        required:true,
    }
},{
    timestamps:true
})

module.exports = mongoose.model("invoice",invoiceSchema)