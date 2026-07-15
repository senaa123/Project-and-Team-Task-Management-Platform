export class UserEntity {
  constructor(
    public readonly id: string,
    public empId: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public role: string,
    public isVerified: boolean,
  ) {}
}
