import { Module } from '@nestjs/common';
import { InstanceService } from './instance.service';

@Module({
  providers: [InstanceService],
  exports: [InstanceService],
})
export class InstanceModule {}
