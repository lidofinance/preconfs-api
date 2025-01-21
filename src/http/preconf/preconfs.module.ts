import { Module } from '@nestjs/common';
import { PreconfsController } from './preconfs.controller';
import { ValidatorKeysResolverModule } from '../../services/preconfs/validator-keys-resolver.module';

@Module({
  controllers: [PreconfsController],
  imports: [ValidatorKeysResolverModule],
})
export class PreconfsModule {}
