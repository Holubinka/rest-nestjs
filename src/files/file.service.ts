import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { S3 } from 'aws-sdk';
import { Avatar } from '../user/user.interface';
import { exclude } from 'src/utils/excludeFields';

@Injectable()
export class FileService {
  private readonly _s3: S3;

  constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService) {
    this._s3 = new S3();
  }

  fileRename(filename: string): string {
    const queHoraEs = Date.now();
    const regex = /[\s_-]/gi;
    const fileTemp = filename.replace(regex, '.');
    const arrTemp = [fileTemp.split('.')];
    return `${arrTemp[0].slice(0, arrTemp[0].length - 1).join('_')}${queHoraEs}.${arrTemp[0].pop()}`;
  }

  async uploadPublicFile(uploadResult, userId: string): Promise<Avatar> {
    const file = await this.prismaService.file.create({
      data: {
        key: uploadResult.key,
        url: uploadResult.location,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return exclude(file, 'userId');
  }

  async deletePublicFile(fileId: string): Promise<void> {
    const file = await this.prismaService.file.findUniqueOrThrow({
      where: { id: fileId },
    });
    await this.getS3()
      .deleteObject({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      })
      .promise();
    await this.prismaService.file.delete({ where: { id: fileId } });
  }

  getS3(): S3 {
    return this._s3;
  }
}
