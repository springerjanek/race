import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RaceService } from './race.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RaceGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private raceService: RaceService) {}

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
    this.raceService.setServer(this.server);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.raceService.removePlayer(socket.id);
    this.server.emit('raceList', this.raceService.listPending());
  }

  @SubscribeMessage('createRace')
  handleCreate(socket: Socket, data: any) {
    const { userId, username, name } = data;
    const race = this.raceService.createRace(userId, name);
    this.raceService.joinRace(race.id, socket.id, { id: userId, username });
    socket.join(race.id);
    this.server.emit('raceList', this.raceService.listPending());
  }

  @SubscribeMessage('getRaceList')
  handleGetRaceList(socket: Socket) {
    socket.emit('raceList', this.raceService.listPending());
  }

  @SubscribeMessage('joinRace')
  handleJoin(socket: Socket, data: any) {
    const { raceId, user } = data;
    this.raceService.joinRace(raceId, socket.id, user);
    socket.join(raceId);

    const race = this.raceService.getRace(raceId);
    if (race) {
      this.server.to(raceId).emit('playersUpdate', Object.values(race.players));
    }
  }

  @SubscribeMessage('startRace')
  handleStart(socket: Socket, raceId: string) {
    const race = this.raceService.getRace(raceId);

    this.raceService.startCountdown(
      raceId,
      (countdown) => this.server.to(raceId).emit('countdown', countdown),
      () => {
        console.log('Race finished all rounds for', raceId);
      },
    );

    this.server.emit('raceList', this.raceService.listPending());
  }

  @SubscribeMessage('progress')
  handleProgress(socket: Socket, data: any) {
    const { raceId, index } = data;
    this.raceService.updateProgress(raceId, socket.id, index);

    const race = this.raceService.getRace(raceId);
    if (race) {
      const player = race.players[socket.id];
      socket.to(raceId).emit('playerProgress', {
        socketId: socket.id,
        username: player?.username,
        progress: index,
      });
    }
  }

  @SubscribeMessage('getRace')
  handleGetRace(socket: Socket, raceId: string) {
    const race = this.raceService.getRace(raceId);
    if (race) {
      socket.emit('raceUpdate', {
        id: race.id,
        name: race.name,
        status: race.status,
        round: race.round,
        sentences: race.sentences,
        players: Object.values(race.players),
        hostId: race.hostId,
      });
    } else {
      socket.emit('error', { message: 'Race not found' });
    }
  }
}
