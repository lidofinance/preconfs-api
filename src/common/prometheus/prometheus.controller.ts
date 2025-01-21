import { Controller } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PrometheusController as PrometheusControllerSource } from '@willsoto/nestjs-prometheus';

@Controller()
@ApiExcludeController()
export class PrometheusController extends PrometheusControllerSource {}
