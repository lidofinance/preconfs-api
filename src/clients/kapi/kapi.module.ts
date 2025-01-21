import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  LoggerService,
  Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { FetchError } from 'node-fetch';

import { FetchService, FETCH_GLOBAL_OPTIONS_TOKEN } from '@lido-nestjs/fetch';
import { MiddlewareModule } from '@lido-nestjs/middleware';

import { KAPI_RETRY_ATTEMPTS, KAPI_RETRY_DELAY } from './kapi.constants';
import { KapiService } from './kapi.service';
import { PrometheusService } from '../../common/prometheus/prometheus.service';

@Module({
  imports: [MiddlewareModule],
  providers: [
    {
      provide: FETCH_GLOBAL_OPTIONS_TOKEN,
      async useFactory(
        configService: ConfigService,
        logger: LoggerService,
        prometheus: PrometheusService,
      ) {
        return {
          baseUrls: [configService.get('KEYS_API_HOST')],
          retryPolicy: {
            delay: KAPI_RETRY_DELAY,
            attempts: KAPI_RETRY_ATTEMPTS,
          },
          middlewares: [
            async (next) => {
              try {
                return await next();
              } catch (error) {
                if (error instanceof HttpException) {
                  const status = error.getStatus();

                  if (status === HttpStatus.NOT_FOUND) {
                    logger.log('Got 404 response from Keys API', error);
                  } else {
                    prometheus.kapiError
                      .labels({
                        message: error.message,
                        statusCode: status,
                      })
                      .inc();

                    logger.error(
                      'Could not get successful response from Keys API',
                    );
                    logger.error(error);
                  }

                  throw error;
                }

                if (error instanceof FetchError) {
                  const errorMessage = 'Could not reach Keys API server';

                  prometheus.kapiError
                    .labels({
                      message: errorMessage,
                      statusCode: 'undefined',
                    })
                    .inc();

                  logger.error(errorMessage);
                  logger.error(error);

                  throw new InternalServerErrorException(errorMessage);
                }

                const errorMessage =
                  'Unknown error getting response from Keys API';

                prometheus.kapiError
                  .labels({
                    message: errorMessage,
                    statusCode: 'undefined',
                  })
                  .inc();

                logger.error(errorMessage);
                logger.error(error);

                throw new InternalServerErrorException(errorMessage);
              }
            },
          ],
        };
      },
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER, PrometheusService],
    },
    FetchService,
    KapiService,
  ],
  exports: [KapiService],
})
export class KapiModule {}
