import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from './common/config';
import {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
} from './common/config/config.constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_URL } from './apps/http-server/swagger';
import { PrometheusService } from './common/prometheus/prometheus.service';
import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    MainModule,
    new FastifyAdapter({ trustProxy: true }),
    { bufferLogs: true },
  );

  // config
  const configService: ConfigService = app.get(ConfigService);
  const environment = configService.get('NODE_ENV');
  const appPort = configService.get('PORT');
  const corsWhitelist = configService.get('CORS_WHITELIST_REGEXP');
  const sentryDsn = configService.get('SENTRY_DSN');
  const kapiHost = configService.get('KEYS_API_HOST');
  const chainId = configService.get('CHAIN_ID');

  // versions
  app.enableVersioning({ type: VersioningType.URI });

  // logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.enableShutdownHooks();

  // sentry
  const release = `${APP_NAME}@${APP_VERSION}`;
  Sentry.init({ dsn: sentryDsn, release, environment });

  // cors
  if (corsWhitelist !== '') {
    const whitelistRegexp = new RegExp(corsWhitelist);

    app.enableCors({
      origin(origin, callback) {
        if (!origin || whitelistRegexp.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    });
  }

  // swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle(APP_DESCRIPTION)
    .setVersion(APP_VERSION)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_URL, app, swaggerDocument);

  const prometheus: PrometheusService = app.get(PrometheusService);
  const startInfo = {
    env: environment,
    name: APP_NAME,
    version: APP_VERSION,
    network: chainId,
    kapi: kapiHost,
  };
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  prometheus.buildInfo.labels(startInfo).inc();
  logger.log('Init app', startInfo);
  // app
  await app.listen(appPort, '0.0.0.0');
}

bootstrap();
