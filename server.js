const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const ACTIONS = require('./src/Actions');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};

const getAllConnetedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            userName: userSocketMap[socketId],
        };
    });
};

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    //listen for join event
    socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
        //map socket id with user name
        userSocketMap[socket.id] = userName;
        //join room
        socket.join(roomId);
        //get all connected clients
        const clients = getAllConnetedClients(roomId);

        clients.forEach(({ socketId, }) => {
            //notify all connected clients
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                userName,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    })
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    })

    socket.on('disconnecting', () => {
        //get all rooms
        const rooms = [...socket.rooms];
        //get all connected clients
        rooms.forEach((roomId) => {
            //broad cast all connected clients
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                userName: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    })
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})
