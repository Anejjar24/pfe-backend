import { Repository } from 'typeorm';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';

export class SensorReadHandler {
  constructor(private readonly sensorRepository: Repository<Sensor>) {}

  async execute(node: WorkflowNode) {
    const sensorId = String(node.data?.sensorId || '').trim();

    if (!sensorId) {
      return { error: 'sensorId not configured', value: null };
    }

    const sensor = await this.sensorRepository.findOne({
      where: { id: sensorId },
      relations: ['station'],
    });

    if (!sensor) {
      return { error: `Sensor "${sensorId}" not found`, value: null, status: 'not_found' };
    }

    return {
      sensorId: sensor.id,
      name: sensor.name,
      value: sensor.lastReading,
      unit: sensor.unit,
      timestamp: sensor.lastReadingAt,
      status: sensor.status,
      stationId: sensor.station?.id ?? null,
    };
  }
}
