import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'New task title',
    example: 'Fix login page bug on Safari',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated task description',
    example: 'Issue reproduces on iOS 17 with Safari 17.1.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated priority level',
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({
    description: 'UUID of the new assignee (must be a member of the project)',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Updated due date in ISO 8601 format',
    example: '2026-01-15',
    format: 'date',
  })
  @IsString()
  @IsOptional()
  dueDate?: string;
}
