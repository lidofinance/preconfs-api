import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SWAGGER_URL } from './swagger';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { METRICS_URL } from '../../common/prometheus/prometheus.constants';

import { MetricsMiddleware } from './middlewares/metrics.middleware';
import { PreconfsModule } from '../../http/preconf/preconfs.module';
import { HealthModule } from '../../http/health/health.module';
import { HEALTH_URL } from '../../http/routes';

@Module({
  imports: [HealthModule, PreconfsModule],
})
export class HTTPModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, MetricsMiddleware)
      .exclude(`${SWAGGER_URL}/(.*)`, SWAGGER_URL, METRICS_URL, HEALTH_URL)
      .forRoutes('*');
  }
}
