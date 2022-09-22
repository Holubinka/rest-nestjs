import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User as UserModel, Prisma } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Avatar, ProfileData, User, UserData } from './user.interface';
import { FileService } from '../files/file.service';
import { RegistrationStatus } from '../auth/auth.interface';
import { exclude } from 'src/utils/excludeFields';

const userSelect = {
  username: true,
  email: true,
  bio: true,
};

const profileSelect = {
  username: true,
  followedByIDs: true,
  bio: true,
  firstName: true,
  lastName: true,
  id: true,
};

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService, private readonly fileService: FileService) {}

  async getAllUsers(): Promise<UserData[]> {
    return await this.prismaService.user.findMany({ select: userSelect });
  }

  async getUserById(id: string, options: Prisma.UserSelect = {}): Promise<Partial<User>> {
    return this.prismaService.user.findUniqueOrThrow({
      where: { id },
      select: { ...profileSelect, ...options },
    });
  }

  async getUserByEmail(email: string): Promise<UserModel> {
    return this.prismaService.user.findUniqueOrThrow({ where: { email } });
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { username } });

    return exclude(user, 'password');
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<UserData> {
    return await this.prismaService.user.update({
      where: { id },
      data: userData,
      select: userSelect,
    });
  }

  async deleteUser(username: string): Promise<any> {
    const user = await this.getUserByUsername(username);

    if (user) {
      await this.prismaService.user.delete({
        where: { username },
      });
      return {
        success: true,
        message: 'User successfully deleted',
      };
    }
  }

  async createUser(userData: CreateUserDto): Promise<UserModel> {
    const userInDb = await this.prismaService.user.findMany({
      where: {
        OR: [
          {
            email: userData.email,
          },
          {
            username: userData.username,
          },
        ],
      },
    });

    if (userInDb.length > 0) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prismaService.user.create({
      data: { ...userData, password: hashedPassword },
    });
  }

  async toggleFollow(userId: string, username: string, toggleFollow: boolean): Promise<ProfileData> {
    if (!username) {
      throw new HttpException('Follower username not provided.', HttpStatus.BAD_REQUEST);
    }

    const followed = await this.prismaService.user.findUniqueOrThrow({
      where: { username },
      select: profileSelect,
    });

    if (followed.id === userId) {
      throw new HttpException('Follower and FollowingId cannot be equal.', HttpStatus.BAD_REQUEST);
    }

    if (followed.followedByIDs.includes(userId) && toggleFollow) {
      throw new HttpException('You are already following for this user', HttpStatus.BAD_REQUEST);
    }

    if (!followed.followedByIDs.includes(userId) && !toggleFollow) {
      throw new HttpException('You are already unFollowing for this user', HttpStatus.BAD_REQUEST);
    }

    await this.prismaService.user.update({
      where: { id: userId },
      select: profileSelect,
      data: {
        following: toggleFollow
          ? {
              ...{
                connect: {
                  id: followed.id,
                },
              },
            }
          : {
              ...{
                disconnect: {
                  id: followed.id,
                },
              },
            },
      },
    });

    return { ...exclude(followed, 'id', 'followedByIDs'), following: toggleFollow };
  }

  async addAvatar(userId: string, file: Express.Multer.File): Promise<Avatar> {
    await this.deleteAvatar(userId);
    return this.fileService.uploadPublicFile(file, userId);
  }

  async deleteAvatar(userId: string): Promise<RegistrationStatus> {
    const user = await this.getUserById(userId, { avatar: true });
    const fileId = user.avatar?.id;
    if (fileId) {
      await this.fileService.deletePublicFile(fileId);
      return {
        success: true,
        message: 'Image deleted',
      };
    }
  }
}
