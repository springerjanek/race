import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: 0 })
  points: number;

  @Column({ type: 'float', default: 0 })
  averageWPM: number;

  @Column({ default: 0 })
  raceCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
