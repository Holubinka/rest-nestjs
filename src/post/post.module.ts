import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileModule } from '../files/file.module';
import { FileService } from '../files/file.service';
import { multerConfig } from '../utils/multer.config';

@Module({
  imports: [
    UserModule,
    MulterModule.registerAsync({
      imports: [ConfigModule, FileModule],
      useFactory: async (config: ConfigService, fileService: FileService) =>
        multerConfig(config, fileService),
      inject: [ConfigService, FileService],
    }),
  ],
  providers: [PostService, PrismaService],
  controllers: [PostController],
})
export class PostModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'posts/feed', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.POST },
        { path: 'posts/my', method: RequestMethod.GET },
        { path: 'posts/:id', method: RequestMethod.DELETE },
        { path: 'posts/:id', method: RequestMethod.PUT },
        { path: 'posts/:id', method: RequestMethod.GET },
        { path: 'posts/:id/comments', method: RequestMethod.POST },
        { path: 'posts/:id/comments', method: RequestMethod.GET },
        { path: 'posts/:postId/comments/:id', method: RequestMethod.DELETE },
        { path: 'posts/:id/favorite', method: RequestMethod.POST },
        { path: 'posts/:id/favorite', method: RequestMethod.DELETE },
        { path: 'posts/:id/views', method: RequestMethod.PUT },
        { path: 'posts/:id/publish', method: RequestMethod.PUT },
        { path: 'posts/:id/drafts', method: RequestMethod.GET },
      );
  }
}
