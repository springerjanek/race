import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async login(username: string): Promise<User> {
    let user = await this.repo.findOne({ where: { username } });

    if (!user) {
      user = this.repo.create({ username });
      await this.repo.save(user);
    }

    return user;
  }

  async updateStats(userId: string, wpm: number) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) return;

    const newRaceCount = user.raceCount + 1;

    const newAverage = (user.averageWPM * user.raceCount + wpm) / newRaceCount;

    user.raceCount = newRaceCount;
    user.averageWPM = newAverage;
    user.points += Math.round(wpm);

    await this.repo.save(user);
  }
}
