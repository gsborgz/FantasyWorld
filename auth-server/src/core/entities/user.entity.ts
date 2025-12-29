import { Column, Entity, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../entities/utils/base.entity';
import { MainSession } from './session.entity';

@Entity({ name: 'users' })
export class User extends CustomBaseEntity {

  @Column({ type: 'varchar', length: 20, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 60, nullable: false, select: false })
  password: string;

  @OneToMany(() => MainSession, (session) => session.user)
  sessions: MainSession[];

}
