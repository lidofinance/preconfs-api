import { NonEmptyArray } from '@lido-nestjs/execution';
import { plainToClass, Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

import { Chain, Environment, LogFormat, LogLevel } from './interfaces';

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment)
  @Transform(({ value }) => value || Environment.development)
  public NODE_ENV: Environment = Environment.development;

  @IsOptional()
  @IsInt()
  @Min(1025)
  @Max(65535)
  @Transform(toNumber({ defaultValue: 3000 }))
  public PORT = 3000;

  @IsOptional()
  @IsString()
  public CORS_WHITELIST_REGEXP = '';

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform(toNumber({ defaultValue: 5 }))
  public GLOBAL_THROTTLE_TTL = 5;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform(toNumber({ defaultValue: 100 }))
  public GLOBAL_THROTTLE_LIMIT = 100;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform(toNumber({ defaultValue: 1 }))
  public GLOBAL_CACHE_TTL = 1;

  @IsOptional()
  @IsString()
  public SENTRY_DSN?: string;

  @IsOptional()
  @IsEnum(LogLevel)
  @Transform(({ value }) => value || LogLevel.info)
  public LOG_LEVEL: LogLevel = LogLevel.info;

  @IsOptional()
  @IsEnum(LogFormat)
  @Transform(({ value }) => value || LogFormat.json)
  public LOG_FORMAT: LogFormat = LogFormat.json;

  @IsNotEmpty()
  @IsUrl({
    require_protocol: true,
  })
  @Transform(({ value }) => removeTrailingSlash(value))
  public KEYS_API_HOST!: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      each: true,
    },
  )
  @Transform(({ value }) => toArrayOfUrls(value))
  public EL_API_URLS!: NonEmptyArray<string>;

  @IsNotEmpty()
  @IsEnum(Chain)
  @Transform(({ value }) => parseInt(value, 10))
  public CHAIN_ID!: Chain;

  @IsNotEmpty()
  @IsString()
  public CURATOR_ADDRESS!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const validatorOptions = { skipMissingProperties: false };
  const errors = validateSync(validatedConfig, validatorOptions);

  if (errors.length > 0) {
    console.error(errors.toString());
    process.exit(1);
  }

  return validatedConfig;
}

// ====================================================================================================================
// PRIVATE FUNCTIONS
// ====================================================================================================================
function toNumber({ defaultValue }) {
  return function ({ value }) {
    if (value == null || value === '') {
      return defaultValue;
    }
    return Number(value);
  };
}

function toArrayOfUrls(url: string | null): string[] {
  if (url == null || url === '') {
    return [];
  }

  return url.split(',').map(removeTrailingSlash);
}

function removeTrailingSlash(url: string): string {
  return url.trim().replace(/\/$/, '');
}
