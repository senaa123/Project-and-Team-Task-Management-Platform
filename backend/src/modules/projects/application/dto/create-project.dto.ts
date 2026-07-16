import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name (minimum 3 characters)',
    example: 'E-commerce Redesign',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    description: 'Short description of the project goals',
    example: 'Redesign the checkout flow and product listing pages.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional list of user UUIDs to add as members on creation',
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  memberIds?: string[];
}
