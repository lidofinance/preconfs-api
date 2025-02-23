import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Reply } from './interfaces';
import { PrometheusService } from '../../../common/prometheus/prometheus.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(protected readonly prometheus: PrometheusService) {}

  use(request: Request, reply: Reply, next: () => void) {
    const { method, originalUrl, headers } = request;
    const { pathname } = new URL(originalUrl || '', `http://${headers.host}`);

    const endTimer = this.prometheus.httpRequestDuration.startTimer({
      method,
      pathname,
    });

    reply.on('finish', () => {
      const { statusCode } = reply;
      endTimer({ statusCode });
    });

    next();
  }
}
