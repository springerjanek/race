import { Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceGateway } from './race.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [RaceGateway, RaceService],
})
export class RaceModule {}
