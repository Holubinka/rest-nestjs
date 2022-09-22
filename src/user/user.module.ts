import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import { FileModule } from '../files/file.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerConfig } from '../utils/multer.config';
import { FileService } from '../files/file.service';

@Module({
  imports: [
    FileModule,
    MulterModule.registerAsync({
      imports: [ConfigModule, FileModule],
      useFactory: async (config: ConfigService, fileService: FileService) =>
        multerConfig(config, fileService),
      inject: [ConfigService, FileService],
    }),
  ],
  controllers: [UserController],
  providers: [PrismaService, UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.PATCH },
        { path: 'users/me', method: RequestMethod.GET },
        { path: 'users/:username', method: RequestMethod.DELETE },
        { path: 'users/:username/follow', method: RequestMethod.POST },
        { path: 'users/:username/follow', method: RequestMethod.DELETE },
        { path: 'users/avatar', method: RequestMethod.POST },
        { path: 'users/avatar', method: RequestMethod.DELETE },
      );
  }
}
