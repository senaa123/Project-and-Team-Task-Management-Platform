export class ProjectEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public ownerId: string,
    public createdAt: Date,
    public owner?: { id: string; name: string; email: string; empId: string },
    public members?: {
      user: { id: string; name: string; email: string; empId: string };
    }[],
  ) {}
}
