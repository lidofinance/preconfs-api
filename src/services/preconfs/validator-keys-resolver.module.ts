import { Module } from '@nestjs/common';
import { EthProviderModule } from '../../clients/eth-provider/eth-provider.module';
import { ValidatorKeysResolver } from './validator-keys-resolver.service';
import { KapiModule } from '../../clients/kapi/kapi.module';
import { ConfigModule, ConfigService } from '../../common/config';
import { CredibleCommitmentCurationProviderModule } from '../../contracts';
import { SimpleFallbackJsonRpcBatchProvider } from '@lido-nestjs/execution';

@Module({
  imports: [
    KapiModule,
    ConfigModule,
    EthProviderModule,
    CredibleCommitmentCurationProviderModule.forRootAsync({
      inject: [ConfigService, SimpleFallbackJsonRpcBatchProvider],
      useFactory: async (
        configService: ConfigService,
        provider: SimpleFallbackJsonRpcBatchProvider,
      ) => {
        return {
          provider,
          address: configService.get('CURATOR_ADDRESS'),
        };
      },
    }),
  ],
  providers: [ValidatorKeysResolver],
  exports: [ValidatorKeysResolver],
})
export class ValidatorKeysResolverModule {}
