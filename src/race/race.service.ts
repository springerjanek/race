import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

type Player = {
  socketId: string;
  userId: string;
  username: string;
  progress: number;
  totalWpm: number;
};

type Race = {
  id: string;
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

  // --- CREATE RACE ---
  createRace(host: any) {
    const id = crypto.randomUUID();

    this.races[id] = {
      id,
      hostId: host.id,
      status: 'pending',
      players: {},
      round: 0,
      sentences: [
        'The quick brown fox jumps over the lazy dog',
        'NestJS makes backend development structured and scalable',
      ],
    };

    return this.races[id];
  }

  // --- JOIN ---
  joinRace(raceId: string, socketId: string, user: any) {
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

  listPending() {
    return Object.values(this.races).filter((r) => r.status === 'pending');
  }

  // --- START COUNTDOWN ---
  startCountdown(raceId: string, callback: () => void) {
    const race = this.races[raceId];
    if (!race) return;

    race.status = 'countdown';

    setTimeout(() => {
      this.startRound(raceId, 1, callback);
    }, 5000);
  }

  // --- START ROUND ---
  startRound(raceId: string, roundNumber: number, callback: () => void) {
    const race = this.races[raceId];
    if (!race) return;

    race.status = roundNumber === 1 ? 'round1' : 'round2';
    race.round = roundNumber;

    const startTime = Date.now();

    race.roundTimer = setTimeout(async () => {
      await this.endRound(raceId, startTime, callback);
    }, 20000);
  }

  // --- END ROUND ---
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

  // --- UPDATE PROGRESS ---
  updateProgress(raceId: string, socketId: string, index: number) {
    const race = this.races[raceId];
    if (!race) return;

    const player = race.players[socketId];
    if (!player) return;

    player.progress = index;
  }

  // --- FINISH ---
  async finishRace(raceId: string) {
    const race = this.races[raceId];
    if (!race) return;

    race.status = 'finished';

    for (const player of Object.values(race.players)) {
      const averageWpm = player.totalWpm / 2;
      await this.userService.updateStats(player.userId, averageWpm);
    }
  }

  removePlayer(socketId: string) {
    for (const race of Object.values(this.races)) {
      delete race.players[socketId];
    }
  }
}
