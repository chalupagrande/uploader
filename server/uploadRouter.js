const express = require('express');
const multer = require('multer');
const cors = require('cors')
const uploadRouter = express.Router();
const upload = multer({dest: './uploads'})

uploadRouter.put('/', upload.single('avatar'), (req,res, next)=>{
  console.log(req.file)
  res.send('got it')
})

uploadRouter.get('/')

module.exports = uploadRouter