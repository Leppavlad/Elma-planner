export class User {
  constructor(public data: UserType) {}
}

export interface UserType {
  id: number;
  username: string;
  surname: string;
  firstName: string;
  secondName?: string;
}
