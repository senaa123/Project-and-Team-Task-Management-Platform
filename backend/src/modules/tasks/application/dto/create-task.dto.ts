import { IsString, IsOptional, IsUUID, IsDateString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  projectId: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}