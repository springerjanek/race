import { Test, TestingModule } from '@nestjs/testing';
import { RaceGateway } from './race.gateway';
import { RaceService } from './race.service';

describe('RaceGateway', () => {
  let gateway: RaceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaceGateway, RaceService],
    }).compile();

    gateway = module.get<RaceGateway>(RaceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
