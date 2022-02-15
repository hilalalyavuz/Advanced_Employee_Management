const express = require('express');
const path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const router = express.Router();
const cors = require('cors')


dotenv.config({path : './.env'})
const app = express();
app.use(cors());


const publicDirectory = path.join(__dirname , './public'); //css veya js dosyalarımın konnumunu gösteriyorum
app.use(express.static(publicDirectory)); // dosyamı servera kullanması için veriyorum
// console.log(__dirname);

//parse url-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended : false}));

//parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(cookieParser());

app.use(session({ 
    secret: 'Özel-Anahtar',
    resave: false,
    saveUninitialized: true,
}))

app.set('view engine', 'ejs');
app.use('/', require('./routes/pages'));
app.use('/user' ,require('./routes/user'));

app.listen(3000, () => {
    console.log("server started at port 3000 ");
});