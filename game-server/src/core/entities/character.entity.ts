import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CustomBaseEntity } from './base.entity';

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

  @Index()
  @Column({ type: 'uuid', nullable: false })
  userId: string;

}
