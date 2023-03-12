const express = require('express');
const path=require('path');
const app= express();
const bodyParser = require('body-parser');
const validatePhoneNumber = require('validate-phone-number-node-js');
const validator = require("email-validator");
require("dotenv").config();
const nodeMail = require("nodemailer");

async function mainMail(name, email, subject, message) {
   const transporter = await nodeMail.createTransport({
     service: "gmail",
     auth: {
       user: process.env.GMAIL_USER,
       pass: process.env.PASSWORD,
     },
   });
   const mailOption = {
     from: process.env.GMAIL_USER,
     to: email,
     subject: subject,
     html: `You got a message from 
     Email : ${email}
     Name: ${name}
     Message: ${message}`,
   };
   try {
     await transporter.sendMail(mailOption);
     return Promise.resolve("Message Sent Successfully!");
   } catch (error) {
     return Promise.reject(error);
   }
 }
 

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});


app.post('/user-info',function(req,res){
   const { firstName, lastName, Email, DOB, phoneNo } = req.body;
   const errors = [];

   if (!firstName) {
      errors.push("First Name is Empty");
   }

   if(!Email){
      errors.push("Email is Empty")
   }

  if(!phoneNo)
  {
      errors.push("Phone Number is Empty")
  }

  if(!DOB)
  {
      errors.push("DOB is Empty");
  }

   //age
  const dobDate = new Date(DOB);
  const age = Math.floor(
    (Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  if (age < 18) {
    errors.push("Age must be 18 or older");
  }

  //email
   const email= validator.validate(Email);
   if(!email)
   {
      errors.push("Incorrect Email");
   }


   //phone
  const result = validatePhoneNumber.validate(phoneNo);
  if(!result)
  {
   errors.push("Incorrect Phone number");
  }

if (errors.length > 0) {
   res.status(400).send({ errors });
 } else {
   res.send({ message: "Form submitted successfully" });

   try {
      const yourmessage="hello"
      const yoursubject="Form submitted";
       mainMail(firstName, Email, yoursubject, yourmessage);
      res.send("Message Successfully Sent!");
    } catch (error) {
      res.send("Message Could not be Sent");
    }
 }

})

app.listen(3000,()=>{
   console.log("Server started on port 3000"); 
})