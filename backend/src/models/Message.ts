import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['text', 'image', 'file'],
    default: 'text'
  })
  type: 'text' | 'image' | 'file';

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
  };

  @Column({
    type: 'enum',
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  })
  status: 'sent' | 'delivered' | 'read';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 