import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multerS3 from 'multer-s3';
import { FileService } from '../files/file.service';
import constants from '../constants';

export const multerConfig = (config: ConfigService, fileService: FileService): MulterOptions => ({
  storage: multerS3({
    s3: fileService.getS3(),
    bucket: config.get('AWS_PUBLIC_BUCKET_NAME'),
    key: (req, file, cb) => {
      if (req.url.includes('avatar')) {
        return cb(null, `${req.user.id}/${constants.imagesPrivate}/${fileService.fileRename(file.originalname)}`);
      } else if (req.url.includes('posts')) {
        return cb(null, `${req.user.id}/${constants.imagesFolder}/${fileService.fileRename(file.originalname)}`);
      }
      return cb(null, `${req.user.id}/${fileService.fileRename(file.originalname)}`);
    },
  }),
  fileFilter: (req, file: Express.Multer.File, cb) => {
    if (constants.mimetype.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new BadRequestException('Provide a valid image'), false);
  },
  limits: {
    fileSize: config.get('MAX_FILE_SIZE'),
  },
});
