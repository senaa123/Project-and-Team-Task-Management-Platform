import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Registered email address',
    example: 'jane.doe@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Account password',
    example: 'secret123',
  })
  @IsString()
  password: string;
}
