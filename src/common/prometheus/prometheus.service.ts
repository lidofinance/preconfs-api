import { Injectable } from '@nestjs/common';
import {
  Metrics,
  getOrCreateMetric as prometheusGetOrCreateMetric,
} from '@willsoto/nestjs-prometheus';
import { Options, Metric } from './prometheus.interface';
import { METRICS_PREFIX } from './prometheus.constants';

@Injectable()
export class PrometheusService {
  public httpRequestDuration = getOrCreateMetric('Histogram', {
    prefix: false,
    name: 'http_requests_duration_seconds',
    help: 'Duration of HTTP requests',
    buckets: [0.01, 0.1, 0.2, 0.5, 1, 1.5, 2, 5],
    labelNames: ['statusCode', 'method', 'pathname'] as const,
  });

  public buildInfo = getOrCreateMetric('Gauge', {
    prefix: false,
    name: 'build_info',
    help: 'Build information',
    labelNames: ['name', 'version', 'env', 'network', 'kapi'] as const,
  });

  public workerInfo = getOrCreateMetric('Counter', {
    prefix: true,
    name: 'worker_info',
    help: 'Info about worker starts',
    labelNames: ['name', 'version', 'env', 'network', 'kapi'] as const,
  });

  public dbError = getOrCreateMetric('Counter', {
    prefix: true,
    name: 'db_error',
    help: 'Database errors',
    labelNames: ['method'] as const,
  });

  public kapiError = getOrCreateMetric('Counter', {
    prefix: true,
    name: 'kapi_error',
    help: 'Keys API errors',
    labelNames: ['message', 'statusCode'] as const,
  });

  public duplicatedKeys = getOrCreateMetric('Gauge', {
    prefix: true,
    name: 'duplicated_keys',
    help: 'Duplicated keys',
  });

  public invalidKeys = getOrCreateMetric('Gauge', {
    prefix: true,
    name: 'invalid_keys',
    help: 'Invalid keys',
  });

  public validateInput = getOrCreateMetric('Gauge', {
    prefix: true,
    name: 'validate_input',
    help: 'Metrics for storing data about validate input payload from `post validate` method',
    labelNames: ['stat_name'] as const,
  });

  public zodError = getOrCreateMetric('Counter', {
    prefix: true,
    name: 'zod_errors',
    help: 'JSON that could not be parsed into object',
    labelNames: ['method'] as const,
  });

  public moduleLastUpdateTimestamp = getOrCreateMetric('Gauge', {
    prefix: true,
    name: 'module_last_update_timestamp',
    help: 'Block timestamp for which the last module update was made.',
    labelNames: ['moduleId'] as const,
  });
}

// ====================================================================================================================
// PRIVATE FUNCTIONS
// ====================================================================================================================
function getOrCreateMetric<T extends Metrics, L extends string>(
  type: T,
  options: Options<L>,
): Metric<T, L> {
  const name = options.prefix ? METRICS_PREFIX + options.name : options.name;

  return prometheusGetOrCreateMetric(type, {
    ...options,
    name,
  }) as Metric<T, L>;
}
