import { IsIn } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  status: string;
}
