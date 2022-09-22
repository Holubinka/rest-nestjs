import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { CoreModule } from './core/core.module';
import * as Joi from '@hapi/joi';
import { FileModule } from './files/file.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    FileModule,
    PostModule,
    CoreModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        AUTH_SECRET: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
        PORT: Joi.number(),
        MAX_FILE_SIZE: Joi.number().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
