import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sensor } from './Sensor.entity';

@Entity('sensor_data')
@Index(['sensor', 'timestamp'])
export class SensorData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  value: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  qualityFlags: Record<string, any>;

  @ManyToOne(() => Sensor, (sensor) => sensor.sensorData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracy: number;
}
