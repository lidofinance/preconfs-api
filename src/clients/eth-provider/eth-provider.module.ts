import { Module } from '@nestjs/common';
import { FallbackProviderModule } from '@lido-nestjs/execution';

import { ConfigService } from '../../common/config';

@Module({
  imports: [
    FallbackProviderModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        return {
          urls: configService.get('EL_API_URLS'),
          network: configService.get('CHAIN_ID'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class EthProviderModule {}
