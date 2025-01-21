import { Module } from '@nestjs/common';
import { EthProviderModule } from '../../clients/eth-provider/eth-provider.module';
import { ValidatorKeysResolver } from './validator-keys-resolver.service';
import { KapiModule } from '../../clients/kapi/kapi.module';
import { ConfigModule } from '../../common/config';

@Module({
  imports: [EthProviderModule, KapiModule, ConfigModule],
  providers: [ValidatorKeysResolver],
  exports: [ValidatorKeysResolver],
})
export class ValidatorKeysResolverModule {}
