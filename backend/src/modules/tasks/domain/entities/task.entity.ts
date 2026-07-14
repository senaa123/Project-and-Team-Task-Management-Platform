export class TaskEntity {
  constructor(
    public readonly id: string,
    public projectId: string,
    public title: string,
    public description: string | null,
    public status: string,
    public priority: string,
    public assigneeId: string | null,
    public dueDate: Date | null,
  ) {}
}