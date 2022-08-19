import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const CLIENT_PORT = 5173;
const PORT = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
});

// use it before all route definitions
app.use(cors({ origin: `http://localhost:${CLIENT_PORT}` }));

app.get('/', (req: Request, res: Response) => {
	res.json({ ahoj: 'mrkdo' });
});

const players = {};

io.on('connection', function (socket) {
	const playerId = socket.id;
	console.log(`User ${playerId} connected`);

	players[playerId] = {
		rotation: 0,
		x: Math.floor(Math.random() * 700) + 50,
		y: Math.floor(Math.random() * 500) + 50,
		id: socket.id,
	};

	socket.emit('currentPlayers', players);

	socket.broadcast.emit('newPlayer', players[playerId]);

	socket.on('disconnect', function () {
		delete players[playerId];
		console.log(`User ${playerId} disconnected`);
		io.emit('userDisconnect', playerId);
	});
});

httpServer.listen(3000, () => console.log(`Running on: ${PORT}`));
