import {
  HttpException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { KapiService } from '../../clients/kapi/kapi.service';
import * as E from 'fp-ts/Either';
import { SimpleFallbackJsonRpcBatchProvider } from '@lido-nestjs/execution';
import { ConfigService } from '../../common/config';
import { Curator, Curator__factory } from './contracts';
import { ResolvedKey } from './validator-keys-resolver.interfaces';
import { ZodError } from 'zod';
import { Operator } from '../../clients/kapi/entity/common';

@Injectable()
export class ValidatorKeysResolver {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly provider: SimpleFallbackJsonRpcBatchProvider,
    private readonly kapiService: KapiService,
    private readonly configService: ConfigService,
  ) {}

  public async resolve(
    pubkeys: string[],
  ): Promise<E.Either<HttpException | ZodError | Error, ResolvedKey[]>> {
    const [keysResponse, operatorsResponse] = await Promise.all([
      this.kapiService.getKeys(pubkeys),
      this.kapiService.getOperators(),
    ]);

    if (E.isLeft(keysResponse)) {
      const error = keysResponse.left;
      this.logger.error('Error while fetching keys from KAPI', { error });
      return keysResponse;
    }

    if (E.isLeft(operatorsResponse)) {
      const error = operatorsResponse.left;
      this.logger.error('Error while fetching operators from KAPI', { error });
      return operatorsResponse;
    }

    const keys = keysResponse.right.data;
    const operatorByModuleAndIndex = new Map<string, Operator>();
    for (const x of operatorsResponse.right.data) {
      for (const operator of x.operators) {
        operatorByModuleAndIndex.set(
          `${x.module.stakingModuleAddress}|${operator.index}`,
          operator,
        );
      }
    }

    try {
      const contract = this.getContract();

      const data = await Promise.all(
        keys.map(async (key) => {
          const operator = operatorByModuleAndIndex.get(
            `${key.moduleAddress}|${key.operatorIndex}`,
          );
          if (!operator) {
            return;
          }
          const contractResponse = await contract.getOperator(
            operator.rewardAddress,
          );
          if (!contractResponse) {
            return;
          }
          if (
            contractResponse.keysRangeStart.lte(key.index) &&
            contractResponse.keysRangeEnd.gte(key.index)
          ) {
            return {
              pubKey: key.key,
              proxyKey: contractResponse.optInAddress,
              rpcUrl: contractResponse.rpcURL,
            };
          }
        }),
      );
      const filtered = data.filter((x) => x);
      return E.right(filtered as ResolvedKey[]);
    } catch (error) {
      return E.left(error as Error);
    }
  }

  private getContract(): Curator {
    const address = this.configService.get('CURATOR_ADDRESS');
    return Curator__factory.connect(address, this.provider);
  }
}
