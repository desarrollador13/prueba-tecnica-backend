import { HealthResponse } from "../dtos/health-response";

export class HealthMapper {

  static toResponse(dbStatus: string, uptime: number): HealthResponse {
    return {
      status: 'ok',
      service: 'payment-service',
      uptime: uptime,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }

}