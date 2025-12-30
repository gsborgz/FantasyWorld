import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CustomBaseEntity } from './base.entity';
import { Direction } from '../../shared/dtos';

@Entity({ name: 'characters' })
export class Character extends CustomBaseEntity {

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true, length: 20, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  instancePath: string;

  @Column({ type: 'double precision', nullable: false })
  x: number;

  @Column({ type: 'double precision', nullable: false })
  y: number;

  @Column({ type: 'enum', enum: Direction, nullable: false, default: Direction.DOWN })
  direction: Direction;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  userId: string;

}
