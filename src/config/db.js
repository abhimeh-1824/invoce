const  mongoose = require('mongoose');
require("dotenv").config()
// connect mongoDB server
module.exports = ()=> mongoose.connect(process.env.DATABASE_URL)

