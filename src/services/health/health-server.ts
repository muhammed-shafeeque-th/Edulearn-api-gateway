import { getEnvs, HealthServer, IHealthCheck } from '@edulearn/core';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di';
import { config } from '@/config';
import { Server } from 'http';

@injectable()
export class AppHealthController {
  private readonly healthServer: HealthServer;

  public constructor(
    @inject(TYPES.HttpServer) server: Server,
    @inject(TYPES.RedisHealthCheck) redisChecker: IHealthCheck
  ) {
    this.healthServer = new HealthServer(server, [
      redisChecker,
    ]);
  }

  public initialize(): void {
    this.healthServer.register();
  }

}
