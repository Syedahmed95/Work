const mongoose= require("mongoose");
const exp=require("express");
const body= require("body-parser");
const app=exp();
var cors= require('cors');
app.use(body.urlencoded({ extended: false }));
app.use(body.json());
app.use(cors());
const crypto = require('crypto');
var path = require("path");

//Database Connection
const dbcon='mongodb+srv://Auction:model@auction-ujxcw.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(dbcon, { useUnifiedTopology: true, useNewUrlParser: true });

let db=mongoose.connection;
db.once('open', ()=>console.log("connected"));

//Set views folder
//app.set('views',path.join(__dirname, 'Public/views'));

//Schema of Database
var test = new mongoose.Schema({

    email: {type: String, required: true ,unique: true},
    username: {type: String, required: true},
    password:{type: String, required: true},
    
    
});
var check = mongoose.model("Test", test);

// Used for view ejs 
app.get('/test',(req,res)=>{

//res.render('first.ejs')
})
// Post route for register
app.post('/test',(req,res)=>{
    // have the same name when using the postman for data entry 
    let {first, second, third} = req.body;
    //Hash for password
    const hashpass = crypto.scryptSync('aes-192-cbc', third,24);
    console.log(hashpass);
    // Find if the email is same or not
    check.findOne({email: first},(err,data)=>{
        if(err) console.log(err);
        if(data){
            res.status(404).json({
                message: "Email already in used"
            })
            console.log('datasaved');
        }
        // If not save the data into database
        else {
            var testing = new check({email: first,username: second, password:hashpass});
            testing.save(function(err,data){
                if (err) console.log(err);
                else{
                    res.status(200).json({
                        message: "Account created"
                    })
                    console.log('data new saved', data)}
               
            })
        }
    })
       
    })
    // Second route for checking login status
    app.post('/login', (req,res)=>{
        // have the same name as these variables in POSTMAN
        let {emailtemp,pass}=req.body;
        //Encrpyting the password
        const hashpass = crypto.scryptSync('aes-192-cbc', pass,24);
        //Validating the data with database
        check.findOne({email: emailtemp, password: hashpass}, (err,data)=>{
            if(err) console.log(err);
            if (data){
                return res.status(200).json({
                    message: "Login Successfully"
                })
                console.log('Login successfully', data);

            }
            else{
                return res.status(404).json({
                    message: "incorrect email or password"
                })
            }
        })
    })

// Server for local host
app.listen(8080, ()=>{
    console.log("server started");
})