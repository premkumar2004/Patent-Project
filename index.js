// to fetch from database 

const express = require('express');
const mongoose=require("mongoose");
const app = express();
const Toastify =require('toastify-js')

const PORT = 5001;
const multer = require('multer');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://127.0.0.1/myDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



const conn = mongoose.connection;
const itemSchema = new mongoose.Schema({
  authorName: { type: String },
  publishedDate: { type: Date},
  patentTitle:{type:String},
  patentStatus:{type:String},
  iprApplicationNumber:{type:String},
  data: Buffer,
  contentType: String
 
  
 
});

const loginSchema= new mongoose.Schema({
  email:{type:String},
  password:{type:String},
  adminemail:{type:String}
  
})
app.use(express.static('views'));
const Item = mongoose.model('items', itemSchema,

);
const Login = mongoose.model('login', loginSchema

);
app.set('view engine', 'ejs');


app.get('/admin', async (req, res) => {
  
  try {
    const items = await Item.find();
    console.log(typeof(items));
    await res.render('index', {items});
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});






// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});



app.use(bodyParser.json());


app.post('/', async (req, res) => {


  try {
    
    const email = req.body.email;
    const user = await Login.findOne({email:email});
console.log(user)
    if (user.email==="yuvaraj@velammalit.edu") {
      return res.redirect('/admin');
      // Redirect to a page for valid email
      
    } if(user.email!=="yuvaraj@velammalit.edu" && user){
      return res.redirect('/store')
   
    }
    else{
      return res.send("gsah")
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
  // try {
  //   const email = req.body.email;
  //   const user = await Login.findOne({email:email});

  //   if (user) {
  //     return res.redirect('/');
  //     // Redirect to a page for valid email
      
  //   } else {
  //     return res.redirect('/store')
  //     // Display a message for invalid email
   
  //   }
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send('An error occurred.');
  // }
  
  // try {
  //   const { name } = req.body;
  //   const user = await Login.findOne({name });
  //    console.log(user.name)
  //   if (!user) {
  //     return res.redirect('/login'); // Invalid email, redirect to login page
  //   }

  //   if (user.name === 'abc@gmail.com') {
  //     return res.redirect('/'); // Redirect to admin page for a specific email
  //   } else {
  //     return res.redirect('/store'); // Redirect to user page for other emails
  //   }
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send('An error occurred.');
  // }
  // const name=req.body.name
  // const pass=req.body.password

  //   try {
  //     exist= await Login.findOne({name:name})

  //       if (exist) {
  //           res.json({ exists: true });
  //       } else {
  //           res.json({ exists: false });
  //       }
  //   } catch (error) {
  //       console.error(error);
  //       res.status(500).json({ error: 'An error occurred' });
  //   }
});
  // try{
  //   const newLogin= new Login({
  //     name:name,
  //     password:pass

  //   })
  //   await newLogin.save()
  //   res.send("saved")

  // }
  // catch(err){
  //   console.log(err)
  // }





// to store  the data in items in existing

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/store', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/submit', (req, res) => {
  res.sendFile(__dirname + '/submit.html');
});
app.post('/submit',upload.single('patentFile') ,async (req, res) => {
  if (!req.file) {
                 return res.status(400).send('No file uploaded.');
             }
    const  authorName  = req.body.authorName;
    const  publishedDate  = req.body.publishedDate;
    const  patentTitle  = req.body.patentTitle;
    const  iprApplicationNumber  = req.body.iprApplicationNumber;
   const patentStatus=req.body.patentStatus;

    try {
       //await Items.insertMany({ authorName,publishedDate ,});

        const newFormData = new Item({
            authorName:authorName,
            publishedDate:publishedDate,
            patentTitle:patentTitle,
            patentStatus:patentStatus,
            iprApplicationNumber:iprApplicationNumber,
            data: req.file.buffer,
            contentType: req.file.mimetype
            
        });
        await newFormData.save();
        res.sendFile(__dirname + '/views/submit.html');
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred.');
    }
});



app.get('/view/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  
  try {
      const patent = await Item.findById(fileId);
      
      if (!patent) {
          return res.status(404).send('File not found');
      }
      
      const pdfData = patent.data; // Assuming 'patentFile' is the field name where the PDF data is stored
      const pdfBuffer = Buffer.from(pdfData.buffer, 'base64');
      
      res.set('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred.');
  }
});





//to have aa table


app.get('/table', async (req, res) => {
  try {
    const items = await Item.find();

    await res.render('table', {items});
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }

  
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


