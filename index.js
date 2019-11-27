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
const jwt = require("jsonwebtoken");


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
    token: String,
    
    
});
var check = mongoose.model("Test", test);

// Used for view ejs 
app.get('/me',auth,(req,res)=>{
//  const check =  req.header("token");
//  console.log(check);

})
// Post route for register
app.post('/register',(req,res)=>{
    // have the same name when using the postman for data entry 
    let {email, username, password} = req.body;
    
    //generating the Hash for password
    const hashpass = crypto.scryptSync('aes-192-cbc', password,24);
    console.log(hashpass);
    // Find if the email is same or not
    check.findOne({email: email},(err,data)=>{
        if(err) console.log(err);
        if(data){
            res.status(404).json({
                message: "Email already in used"
            })
            console.log('datasaved');
        }
        // If not save the data into database
        else {
            var testing = new check({email: email,username: username, password:hashpass});
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
                //JWT FUNCTION For generating tokens
                // const token = jwt.sign({
                //     email: data.email,
                //     username: data.username
                // },"testing");
                // return res.status(200).json({
                //     message: "Login Successfully",
                //     token: token
                // })

                // Generating random numbers
                let string =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                // Checking and updating the token in the database
                check.updateOne({email: data.email}, {token:string},(err,data)=>{
                    if (err) console.log(err);
                    else{
                       
                        return res.status(200).json({
                            message: "Login Successfully",
                            token: string
                        })

                    }
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

    // middleware for getting the value from the header
    function auth(req,res,next){
        const token1 = req.header('auth-token');
       
        if(!token1){
            return res.status(403).json({
                        message: "access denied"
                    })
        }
        if(token1){
            check.findOne({token: token1}, (err,data)=>{
                if(data){
                    res.status(200).json({
                        email: data.email,
                        username: data.username,
                    })
                }
                else{
                    res.status(401).json({
                        message: 'Invalid Token'
                    })
                }
                
            })
            next();
        }

        
        //JWT token verification using the header's 
        // if (!token){
        //     return res.status(401).json({
        //         message: "access denied"
        //     })
        // }
        // else{
        //     const verfied=jwt.verify(token,"testing");
        //     const bearer = token.split(" ");
        //     const bearer_token=bearer[1];
            
        //     req.token=bearer_token;
            
        //     res.json({
        //         data:bearer,
        //         data1: verfied
        //     })
            
        //}
        
        
    }

// Server for local host
app.listen(8080, ()=>{
    console.log("server started");
})