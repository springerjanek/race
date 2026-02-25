import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Server } from 'socket.io';
import crypto from 'crypto';

type Player = {
  socketId: string;
  userId: string;
  username: string;
  progress: number;
  totalWpm: number;
};

type Race = {
  id: string;
  name: string;
  hostId: string;
  status: 'pending' | 'countdown' | 'round1' | 'round2' | 'finished';
  players: Record<string, Player>;
  round: number;
  sentences: string[];
  roundTimer?: NodeJS.Timeout;
};

@Injectable()
export class RaceService {
  constructor(private userService: UserService) {}

  races: Record<string, Race> = {};
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  createRace(hostId: string, name: string) {
    const id = crypto.randomUUID();
    const race: Race = {
      id,
      name,
      hostId,
      status: 'pending',
      players: {},
      round: 0,
      sentences: [
        'The quick brown fox jumps over the lazy dog',
        'NestJS makes backend development structured and scalable',
      ],
    };
    this.races[id] = race;
    return race;
  }

  joinRace(
    raceId: string,
    socketId: string,
    user: { id: string; username: string },
  ) {
    const race = this.races[raceId];
    if (!race || race.status !== 'pending') return;
    race.players[socketId] = {
      socketId,
      userId: user.id,
      username: user.username,
      progress: 0,
      totalWpm: 0,
    };
  }

  getRace(raceId: string) {
    return this.races[raceId];
  }

  listPending() {
    return Object.values(this.races).filter((r) => r.status === 'pending');
  }

  startCountdown(
    raceId: string,
    countdownCallback: (count: number) => void,
    startCallback: () => void,
  ) {
    const race = this.races[raceId];
    if (!race) return;

    race.status = 'countdown';
    let count = 5;

    const interval = setInterval(() => {
      countdownCallback(count);
      count--;

      if (count < 0) {
        clearInterval(interval);
        this.startRound(raceId, 1, startCallback);
      }
    }, 1000);

    // Emit countdown to all clients in race
    this.server.to(raceId).emit('raceUpdate', {
      id: race.id,
      name: race.name,
      status: race.status,
      round: race.round,
      sentences: race.sentences,
      players: Object.values(race.players),
      hostId: race.hostId,
    });
  }

  startRound(raceId: string, roundNumber: number, callback: () => void) {
    const race = this.races[raceId];
    if (!race) return;

    race.round = roundNumber;
    race.status = roundNumber === 1 ? 'round1' : 'round2';

    // Emit updated race to all clients
    this.server.to(raceId).emit('raceUpdate', {
      id: race.id,
      name: race.name,
      status: race.status,
      round: race.round,
      sentences: race.sentences,
      players: Object.values(race.players),
      hostId: race.hostId,
    });

    const startTime = Date.now();
    race.roundTimer = setTimeout(async () => {
      await this.endRound(raceId, startTime, callback);
    }, 20000); // 20s per round
  }

  async endRound(raceId: string, startTime: number, callback: () => void) {
    const race = this.races[raceId];
    if (!race) return;

    const duration = (Date.now() - startTime) / 1000;

    for (const player of Object.values(race.players)) {
      const words = race.sentences[race.round - 1].split(' ').length;
      const wpm = (words / duration) * 60;
      player.totalWpm += wpm;
      player.progress = 0;
    }

    if (race.round === 1) {
      this.startRound(raceId, 2, callback);
    } else {
      await this.finishRace(raceId);
      callback();
    }
  }

  async finishRace(raceId: string) {
    const race = this.races[raceId];
    if (!race) return;

    race.status = 'finished';

    for (const player of Object.values(race.players)) {
      const averageWpm = player.totalWpm / 2;
      await this.userService.updateStats(player.userId, averageWpm);
    }

    this.server.to(raceId).emit('raceUpdate', {
      id: race.id,
      name: race.name,
      status: race.status,
      round: race.round,
      sentences: race.sentences,
      players: Object.values(race.players),
      hostId: race.hostId,
    });
  }

  updateProgress(raceId: string, socketId: string, index: number) {
    const race = this.races[raceId];
    if (!race) return;

    const player = race.players[socketId];
    if (!player) return;

    player.progress = index;
  }

  removePlayer(socketId: string) {
    for (const race of Object.values(this.races)) {
      delete race.players[socketId];
    }
  }
}
