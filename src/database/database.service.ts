import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Check if the database connection is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT NOW()');
      this.logger.debug('Database health check passed');
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<Record<string, any>> {
    try {
      const tables = await this.dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);

      const stats: Record<string, any> = {
        tables: [],
        totalRows: 0,
      };

      for (const table of tables) {
        const countResult = await this.dataSource.query(
          `SELECT COUNT(*) as count FROM "${table.table_name}"`,
        );
        const count = parseInt(countResult[0].count, 10);
        stats.tables.push({
          name: table.table_name,
          rows: count,
        });
        stats.totalRows += count;
      }

      return stats;
    } catch (error) {
      this.logger.error('Failed to get database stats', error);
      throw error;
    }
  }

  /**
   * Run raw query
   */
  async query(sql: string, parameters?: any[]): Promise<any[]> {
    try {
      return await this.dataSource.query(sql, parameters);
    } catch (error) {
      this.logger.error(`Query failed: ${sql}`, error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.dataSource.isInitialized;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.logger.log('Database connection closed');
    }
  }
}
