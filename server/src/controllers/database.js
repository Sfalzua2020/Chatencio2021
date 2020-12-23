const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

const url = process.env.ATLAS_DB
const database = 'chatencio'

const client = new MongoClient(url,
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
)


module.exports = client
