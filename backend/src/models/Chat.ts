import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { Building } from './Building';
import { ChatMessage } from './ChatMessage';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => Building)
  building: Building;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => ChatMessage, message => message.chat)
  messages: ChatMessage[];

  @ManyToOne(() => ChatMessage, { nullable: true })
  lastMessage: ChatMessage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 