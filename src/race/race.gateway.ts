import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RaceService } from './race.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RaceGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private raceService: RaceService) {}

  handleDisconnect(socket: Socket) {
    this.raceService.removePlayer(socket.id);
  }

  // CREATE
  @SubscribeMessage('createRace')
  handleCreate(socket: Socket, user: any) {
    const race = this.raceService.createRace(user);
    this.server.emit('raceList', this.raceService.listPending());
  }

  // JOIN
  @SubscribeMessage('joinRace')
  handleJoin(socket: Socket, data: any) {
    const { raceId, user } = data;

    this.raceService.joinRace(raceId, socket.id, user);

    this.server.to(raceId).emit('playersUpdate');
  }

  // START (HOST ONLY)
  @SubscribeMessage('startRace')
  handleStart(socket: Socket, raceId: string) {
    this.raceService.startCountdown(raceId, () => {
      this.server.to(raceId).emit('raceStateUpdate');
    });

    this.server.emit('raceList', this.raceService.listPending());
  }

  // PROGRESS
  @SubscribeMessage('progress')
  handleProgress(socket: Socket, data: any) {
    const { raceId, index } = data;
    this.raceService.updateProgress(raceId, socket.id, index);
  }
}
