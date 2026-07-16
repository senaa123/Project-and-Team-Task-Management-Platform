import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Jane Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Work email address',
    example: 'jane.doe@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password (minimum 6 characters, at least one uppercase letter and one number)',
    example: 'Secret123',
    minLength: 6,
  })
  @MinLength(6)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  password: string;

  @ApiProperty({
    description: 'Employee ID assigned by the organization',
    example: 'EMP-0042',
  })
  @IsString()
  empId: string;

  @ApiPropertyOptional({
    description:
      'Requested role (left blank; defaults to PENDING until admin approves)',
    example: 'TEAM_MEMBER',
    enum: ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'],
  })
  @IsOptional()
  role?: string;
}
