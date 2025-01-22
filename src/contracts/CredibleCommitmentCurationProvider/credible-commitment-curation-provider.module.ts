import { Module } from '@nestjs/common';
import { ContractModule } from '@lido-nestjs/contracts';
import { CredibleCommitmentCurationProvider__factory } from '../generated';
import { CREDIBLE_COMMITMENT_CURATION_PROVIDER_TOKEN } from './credible-commitment-curation-provider.constants';

@Module({})
export class CredibleCommitmentCurationProviderModule extends ContractModule {
  static module = CredibleCommitmentCurationProviderModule;
  static contractFactory = CredibleCommitmentCurationProvider__factory;
  static contractToken = CREDIBLE_COMMITMENT_CURATION_PROVIDER_TOKEN;
}
