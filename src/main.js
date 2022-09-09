const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const ejs = require('ejs')

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/views'))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());
app.use(express.json())

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))


let userName = ""

//---------Mongoose---------------

mongoose.connect('mongodb+srv://gauravchahar:GC%40mongo2k22@cluster0.myra7ye.mongodb.net/intermediate')
.then( () => {
    console.log("Database Connected")
})
.catch( (err) => {
    console.log("Database Connection Failed" + err)
})

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const userData = new mongoose.model("usercredentials", userSchema)

const saveUserData = async ( data ) => {
    const saveUSer = new userData ({
        name: data.name,
        email: data.email,
        password: data.password
    })
    try{
        const result = await saveUSer.save()
        return result
    }
    catch(err){
        console.log("Database write error : ", err)
    }
}

const checkUserData = async ( userEmail ) => {
    const checkUser = await userData.find({ email: userEmail})
    return checkUser[0]
}

//---------Mongoose---------------


app.route('/')
.get( (req, res) => {
    res.locals.title = "Welcome Page"
    res.render('index')
})

app.route('/login')
.get( (req, res) => {
    if(req.session.isActive == true){
        res.locals.title = "Home Page"
        res.locals.userName = userName
        res.render('home')
    }
    else{
        res.locals.title = "Login Page"
        res.render('login')
        res.end()
    }
})
.post( async (req, res) => {
    let userLoginCreds = JSON.stringify(req.body)
    userLoginCreds = JSON.parse(userLoginCreds)
    console.log(userLoginCreds.email)
    const userCredsVerify = await checkUserData(userLoginCreds.email)

    console.log(userCredsVerify)
    
    if(userLoginCreds.password === userCredsVerify.password){
        req.session.isActive = true;
        userName = userCredsVerify.name
        res.locals.title = "Home Page"
        res.render('home')
        res.end()
    }
})

app.route('/signup')
.get( (req, res) => {
    res.locals.title = "Signup Page"
    res.render('signup')
    res.end()
})
.post( async (req, res) => {
    const userCreds = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        cpassword: req.body.confirmpassword
    }
    if(userCreds.password === userCreds.cpassword){
        const callingSave = await saveUserData(userCreds)
        res.redirect('/login')
        res.end()
    }
    else{
        console.log("Password Mismatch")
        res.redirect('/signup')
        res.end()
    }
})

app.route('/logout')
.get( (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

app.route('*')
.get( (req, res) => {
    res.redirect('/')
})

app.listen(port, () => {
    console.log("Server Listening @ " + port)
})