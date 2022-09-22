import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { User } from '../shared/decorators/user.decorator';
import { Avatar, ProfileData, UserData } from './user.interface';
import { HasRoles } from '../shared/decorators/role.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Role, User as UserModel } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegistrationStatus } from "../auth/auth.interface";

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('/')
  @HasRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  getAllUsers(): Promise<UserData[]> {
    return this.usersService.getAllUsers();
  }

  @Get('/me')
  getMe(@User('id') id: string): Promise<Partial<UserModel>> {
    return this.usersService.getUserById(id, { id: false });
  }

  @Patch('/')
  update(@User('id') id: string, @Body() body: UpdateUserDto): Promise<UserData> {
    return this.usersService.updateUser(id, body);
  }

  @Post('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  addAvatar(@User('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<Avatar> {
    return this.usersService.addAvatar(id, file);
  }

  @Delete('/avatar')
  deleteAvatar(@User('id') id: string): Promise<RegistrationStatus> {
    return this.usersService.deleteAvatar(id);
  }

  @Delete(':username')
  @HasRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteUser(@Param('username') username: string): Promise<any> {
    return await this.usersService.deleteUser(username);
  }

  @Post(':username/follow')
  async follow(@User('id') userId: string, @Param('username') username: string): Promise<ProfileData> {
    return await this.usersService.toggleFollow(userId, username, true);
  }

  @Delete(':username/follow')
  async unFollow(@User('id') userId: string, @Param('username') username: string): Promise<ProfileData> {
    return await this.usersService.toggleFollow(userId, username, false);
  }
}
