import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'UUID of the project this task belongs to',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'Task title (minimum 3 characters)',
    example: 'Fix login page bug',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    example: 'The login button does not respond on mobile Safari.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task priority level',
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: 'UUID of the project member to assign this task to',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Due date in ISO 8601 format',
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
