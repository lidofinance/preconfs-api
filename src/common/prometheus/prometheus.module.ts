import { Global, Module } from '@nestjs/common';
import { PrometheusModule as Prometheus } from '@willsoto/nestjs-prometheus';
import { METRICS_URL } from './prometheus.constants';
import { PrometheusController } from './prometheus.controller';
import { PrometheusService } from './prometheus.service';

@Global()
@Module({
  imports: [
    Prometheus.register({
      controller: PrometheusController,
      path: METRICS_URL,
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [PrometheusService],
  exports: [PrometheusService],
})
export class PrometheusModule {}
