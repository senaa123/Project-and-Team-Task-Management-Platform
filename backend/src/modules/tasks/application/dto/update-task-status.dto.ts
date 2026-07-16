import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'New status for the task',
    example: 'IN_PROGRESS',
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
  })
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  status: string;
}
