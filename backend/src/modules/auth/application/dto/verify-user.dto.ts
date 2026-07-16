import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserDto {
  @ApiProperty({
    description: 'Role to assign to the approved user',
    example: 'TEAM_MEMBER',
    enum: ['PROJECT_MANAGER', 'TEAM_MEMBER'],
  })
  @IsIn(['PROJECT_MANAGER', 'TEAM_MEMBER'])
  role: string;
}
