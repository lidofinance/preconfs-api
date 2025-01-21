import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  Version,
} from '@nestjs/common';
import * as E from 'fp-ts/Either';

import {
  GetValidatorBatchResponse,
  GetValidatorsBatchRequest,
} from './dto/response';
import { ValidatorKeysResolver } from '../../services/preconfs/validator-keys-resolver.service';
import { ApiOperation } from '@nestjs/swagger';

@Injectable()
@Controller('/')
export class PreconfsController {
  @Version('1')
  @Post('/preconfs/lido-bolt/validators/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Returns proxy key, RPC url for each pubkey in request',
  })
  public async getValidatorBatch(
    @Body() request: GetValidatorsBatchRequest,
  ): Promise<GetValidatorBatchResponse> {
    const resolvedKeys = await this.proxyKeyResolverService.resolve(
      request.pubKeys,
    );

    if (E.isRight(resolvedKeys)) {
      return {
        status: 'ok',
        data: resolvedKeys.right,
      };
    }

    return {
      status: 'error',
      error: resolvedKeys.left.toString(),
    };
  }

  constructor(
    private readonly proxyKeyResolverService: ValidatorKeysResolver,
  ) {}
}
