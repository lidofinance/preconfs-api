import { CacheInterceptor, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { ConfigModule } from './common/config';
import { LoggerModule } from './common/logger';
import { HTTPModule } from './apps/http-server/http.module';
import { CacheModule } from './apps/http-server/cache';
import {
  ThrottlerBehindProxyGuard,
  ThrottlerModule,
} from './apps/http-server/throttler';
import { PrometheusModule } from './common/prometheus/prometheus.module';

@Module({
  imports: [
    CacheModule,
    ConfigModule,
    LoggerModule,
    ThrottlerModule,
    PrometheusModule,
    HTTPModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
  ],
})
export class MainModule {}
