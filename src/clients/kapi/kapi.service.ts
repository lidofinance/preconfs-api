import {
  HttpException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SafeParseError, SafeParseReturnType, ZodError } from 'zod';
import * as E from 'fp-ts/Either';
import { FetchService } from '@lido-nestjs/fetch';

import {
  KeyFindResponse,
  KeyFindResponseSchema,
} from './entity/key-find.response';
import {
  OperatorsResponse,
  OperatorsResponseSchema,
} from './entity/operator.response';
import { PrometheusService } from '../../common/prometheus/prometheus.service';

@Injectable()
export class KapiService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly prometheus: PrometheusService,
    private readonly fetchService: FetchService,
  ) {}

  public async getKeys(
    pubkeys: string[],
  ): Promise<E.Either<HttpException | ZodError, KeyFindResponse>> {
    try {
      const response = await this.fetchService.fetchJson('/v1/keys/find', {
        method: 'post',
        body: JSON.stringify({
          pubkeys: pubkeys,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const parsedObject = KeyFindResponseSchema.safeParse(response);

      return this.getEitherParsedObject<KeyFindResponse>(
        parsedObject,
        this.getKeys.name,
        'could not parse key find response from Keys API',
      );
    } catch (error) {
      return handleError(error as Error);
    }
  }

  public async getOperators(): Promise<
    E.Either<HttpException | ZodError, OperatorsResponse>
  > {
    try {
      const response = await this.fetchService.fetchJson('/v1/operators');

      const parsedObject = OperatorsResponseSchema.safeParse(response);

      return this.getEitherParsedObject<OperatorsResponse>(
        parsedObject,
        this.getOperators.name,
        'could not parse operators from Keys API',
      );
    } catch (error) {
      return handleError(error as Error);
    }
  }

  private getEitherParsedObject<ResponseType>(
    parsedObject: SafeParseReturnType<ResponseType, ResponseType>,
    callerName: string,
    errorMessage: string,
  ): E.Either<ZodError, ResponseType> {
    if (parsedObject.success) {
      return E.right(parsedObject.data);
    }

    this.prometheus.zodError.inc({
      method: callerName,
    });

    const { error } = parsedObject as SafeParseError<ResponseType>;

    this.logger.error(`${callerName}: ${errorMessage}`);
    this.logger.error(error);

    return E.left(error);
  }
}

// ====================================================================================================================
// PRIVATE FUNCTIONS
// ====================================================================================================================
function handleError(error: Error): E.Either<HttpException, never> {
  if (error instanceof HttpException) {
    return E.left(error);
  }

  throw error;
}
