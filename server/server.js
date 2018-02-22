'use strict'

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const mainRouter = express.Router()
const uploadRouter = require('./uploadRouter')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = process.env.PORT || 3000

mainRouter.use(express.static('client'))
app.use('/', mainRouter)
app.use('/upload', uploadRouter)


app.listen(port)
console.log(`listening on ${port}`)
