import { Role } from '@prisma/client';

export interface UserData {
  username: string;
  email: string;
  bio: string;
  avatar?: Avatar;
}

export interface ProfileData {
  username: string;
  firstName?: string;
  lastName?: string;
  bio: string;
  following?: boolean;
  avatar?: Avatar;
}

export interface User extends UserData {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface Avatar {
  id: string;
  url: string;
  key: string;
}
