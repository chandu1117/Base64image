const express = require('express');
const cors = require('cors');
const app = express();
const fileUpload = require('express-fileupload');
let alert = require('alert'); 


const port = 8080;
const bodyParser = require('body-parser');
const fs = require('fs');


const mysql = require("mysql");
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(cors());
app.use(
    fileUpload({
        limits: {
            fileSize: 10000000, // Around 10MB
        },
        abortOnLimit: true,
    })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// parse application/json
app.use(bodyParser.json());




let connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"password",
    port:3306,
    database:"RestAPI"

})
connection.connect((err)=>{
    if(err){
        console.log("Unable To Connect Database");
    }else{
        console.log("Sucessfully Connected Databse");
    }

})



const uploadImage = async (req, res, next) => {
        console.log('*** Upload Image ***')
    try {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // to declare some path to store your converted image
        const path = './images/'+Date.now()+'.png'
        
        const imgdata = req.body.base64image;
        const validataType = imgdata.search(/^data:image\/(png|pdf|jpeg|jpg)(?:;charset=utf-8)?;base64,/);
        
        console.log("******************* Type: ", validataType);

        if(validataType == -1){
            console.log('Invalid file type');
            alert('Invalid file type');
            return res.send( 'Invalid file type. Only jpg, png, image files are allowed.' );
        }else{
            // to convert base64 format into random filename
            const base64Data = imgdata.replace(/^data:image\/(?:pdf|png|jpeg|)([A-Za-z-+/]+)(?:;charset=utf-8)?;base64,/, '');
            
            fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
            let imgInfo = fs.statSync(path)
            let fileSize = imgInfo.size
            let fileSizeMB = imgInfo.size / (1024 * 1024)
            console.log('File size in kb:' + fileSize)
            console.log('File size in mb:' + fileSizeMB)
            if(imgInfo.size / (1024 * 1024) > 2){
                console.log("File size is to large");
                res.send("image size too largg")
            }else{
            const mysql = `insert into Fileupload(image) values('${path}')`
            connection.query(mysql,(err,result,fields)=>{
                if(err){
                    console.log('In SQL Error');
                    res.json(err);
                }else{
                    console.log('In SQL Success');
                }
            })
            }

            return res.send({'test':path});
            }

    } catch (e) {
        next(e);
    }
}

app.post('/upload/image', uploadImage)



app.listen(port, () => console.log(`Example app listening on port ${port}!`))