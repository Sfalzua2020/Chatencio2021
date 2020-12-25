const express = require('express')
const app = express()
const path = require('path')
const client = require('./controllers/database')

app.use(require('cors')())
app.use(express.json())

client.connect().then(conn => {
    if (conn) console.log(`Connected successfully to 'chatencio' database in Atlas MongoDB`)
})

//app.use(express.static(`${__dirname}/chat-app/dist/chat-app`))
app.use('/images', express.static(path.resolve(__dirname, 'images')))
app.use('/', require('./routes/index.routes'))

const port = process.env.PORT || 3000


const server = require('http').createServer(app)

const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
})

server.listen(port, () => {
    console.log(`Server started on port: ${port}`)
    
    io.on('connection', (socket) => {
    
        console.log("Socket on", socket.id)
        // join room
        socket.on('join', (content) => {
            console.log('someone joined')
            console.log(content)
            const collection = client.db('chatencio').collection("messages")
            collection.insertOne(content)
            let room = content.groupName + content.channelName
            socket.join(room)
            // socket.broadcast.in(room).emit(content)
            io.sockets.in(room).emit('message', content)
        })
        
        socket.on('leave', (content) => {
            console.log('Someone left')
            console.log(content)
            const collection = client.db('chatencio').collection("messages")
            collection.insertOne(content)
            let room = content.groupName + content.channelName
            socket.leave(room)
            // socket.broadcast.in(room).emit(content)
            io.sockets.in(room).emit('message', content)
        })
        
        socket.on('new-message', (content) => {
            console.log('NEW MESSAGE:')
            console.log(content)
            const collection = client.db('chatencio').collection("messages")
            collection.insertOne(content)
            let room = content.groupName + content.channelName
            // io.emit('message', content)
            io.sockets.in(room).emit('message', content)
        })  
    })
})
