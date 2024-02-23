// Importing Packages
const express = require("express")
const jwt = require("jsonwebtoken")
var cors = require('cors')
const bcrypt = require('bcrypt')
const database = require("@supabase/supabase-js")

// Config for enviroment variables
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

// SUPBASE CLIENT
const supabase = database.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Creating Express App
const app = express()

// MiddleWares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Home Route
app.get('/', function (request, response) {
    response.status(200).json({ msg: 'This api has routes', routes: [{ "/getAll": "POST" }, { "/get": "POST" }, { "/signup": "POST" }, { "/edit": "POST" }, { "/delete": "POST" }, { "/signin": "POST" }, { "/verify": "POST" }] })
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Routes -----------------------------------------------------------
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/getAll", async (request, response) => {
    try {
        let { data, error } = await supabase.from('Users').select("*")
        if (error) { response.status(200).json({ error: "Syntax error found." }) } else { response.status(302).json({ success: "Found Users", users: data }) }
    } catch { response.status(200).json({ error: "Syntax error found." }) }
})

app.post("/get", async (request, response) => {
    try {
        // Getting Post Parameters
        const userId = await request.query.id || request.body.id || false
        // Getting user from userId
        if (userId) {
            let { data, error } = await supabase.from('Users').select("*").eq('id', userId)
            if (error) { response.status(200).json({ error: "Syntax error found." }) } else if (data.length === 1) { response.status(302).json({ success: "Found User", user: data[0] }) } else { response.status(200).json({ error: "No such user exists." }) }
        } else { response.status(200).json({ error: "Please provide id of user.", request: { "id": "--USER_ID--" } }) }
    } catch { response.status(200).json({ error: "Syntax error found." }) }
})

app.post("/signup", async (request, response) => {
    try {
        // Getting Post Paramters
        const email = await request.query.email || request.body.email || false
        const password = await request.query.password || request.body.password || false
        const firstName = await request.query.firstName || request.body.firstName || ""
        const lastName = await request.query.lastName || request.body.lastName || ""
        const gender = await request.query.gender || request.body.gender || ""
        const address = await request.query.address || request.body.address || ""
        const pincode = await request.query.pincode || request.body.pincode || ""
        const city = await request.query.city || request.body.city || ""
        const state = await request.query.state || request.body.state || ""
        const country = await request.query.country || request.body.country || ""
        const verified = await request.query.name || request.body.verified || false
        // Checking for errors
        if (email && password) {
            const hashPassword = await bcrypt.hash(password, 3)
            // Sending data to backend supabase
            const { data, error } = await supabase.from('Users').insert([{ email: email, password: hashPassword, firstName, lastName: lastName, gender: gender, address: address, pincode: pincode, city: city, state: state, country: country, verified: verified }]).select()
            // If errors encountered
            if (error) { response.status(200).json({ error: error.message, user: { email: email, password: password, firstName, lastName: lastName, gender: gender, address: address, pincode: pincode, city: city, state: state, country: country, verified: verified } }) } else { response.status(201).json({ success: "User Created SUCCESSSFULLY!", user: data[0] }) }
        } else { response.status(200).json({ error: "You need to pass email and password atleast.", user: { email: email, password: password, firstName, lastName: lastName, gender: gender, address: address, pincode: pincode, city: city, state: state, country: country, verified: verified } }) }
    } catch { response.status(200).json({ error: "Syntax error found." }) }
})

app.post("/edit", async (request, response) => {
    try {
        // Getting Post Parameters
        const userId = await request.query.id || request.body.id || false
        const row = await request.query.row || request.body.row || false
        const value = await request.query.value || request.body.value || false
        // Checking for errors
        if (userId && row && value) {
            const json = {}
            json[row] = await row === "password" ? (await bcrypt.hash(value, 3)).toString() : value
            const { data, error } = await supabase.from('Users').update(json).eq('id', userId).select()
            if (error) { response.status(200).json({ error: error.message }) } else if (data.length === 1) { response.status(204).json({ success: "User changed successfully", user: data[0] }) } else { response.status(200).json({ error: "Invalid user Id" }) }
        } else { response.status(200).json({ error: "Please provide id of user and changes to make.", request: { "id": "--USER_ID--", "row": "--ROW--", "value": "--VALUE--" } }) }
    } catch { response.status(200).json({ error: "Syntax error found." }) }
})

app.post("/delete", async (request, response) => {
    try {
        // Getting Post Parameters
        const userId = await request.query.id || request.body.id || false
        // Getting user from userId
        if (userId) {
            let { error } = await supabase.from('Users').delete().eq('id', userId)
            if (error) { response.status(200).json({ error: "No such user exists." }) } else { response.status(302).json({ success: "Found User and Deleted." }) }
        } else { response.status(200).json({ error: "Please provide id of user.", request: { "id": "--USER_ID--" } }) }
    } catch { response.status(200).json({ error: "Syntax error found." }) }
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// Login Route //////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/signin", async (request, response) => {
    try {
        // Getting Post Paramters
        const email = await request.query.email || request.body.email || false
        const password = await request.query.password || request.body.password || false
        if (email && password) {
            let { data, error } = await supabase.from('Users').select("*").eq("email", email)
            if (error) {
                response.status(200).json({ error: "Invalid email or password." })
            } else if (data.length !== 1) {
                response.status(200).json({ error: "Invalid email or password." })
            } else if (await bcrypt.compare(password, data[0].password)) {
                const token = await jwt.sign(data[0], process.env.JWT_TOKEN_SECRET, { expiresIn: "7d" })
                response.status(201).json({ success: "Login Successfull.", 'token': token })
            } else { response.status(200).json({ error: "Invalid email or password." }) }
        } else { response.status(200).json({ error: "Please provide email and password." }) }
    } catch { response.status(200).json({ error: "Syntax error found." }) }
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////// Verify TOken //////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/verify", async (request, response) => {
    try {
        const token = await request.query.token || request.body.token || false
        if (token) {
            const User = jwt.decode(token)
            if (User) { response.status(201).json({ success: "Token Verified.", "User": User }) } else { response.status(200).json({ error: "Invalid Token.", request: { "token": token } }) }
        } else { response.status(200).json({ error: "Please provide a token.", request: { "token": "--YOUR_TOKEN--" } }) }
    } catch { response.status(200).json({ error: "Syntax error found." }) }
})
////////////////////////////////////////////////////////////////// Listening Backend //////////////////////////////////////////////////////////////////////////////
app.listen(80)
module.exports = app
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
