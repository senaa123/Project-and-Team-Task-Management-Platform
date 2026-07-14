export class ProjectEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public ownerId: string,
    public createdAt: Date,
  ) {}
}