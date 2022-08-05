const app = require("./src/routers/router.js");
const connect = require("./src/config/db.js")
require("dotenv").config()
const port = process.env.PORT || 3000
app.listen(port,async()=>{
    try {
        await connect()
        console.log(`server run on http://localhost:${port}/`)
    } catch (error) {
        console.error(error.message)
    }
})