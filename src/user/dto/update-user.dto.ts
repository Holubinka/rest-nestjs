import { IsOptional } from 'class-validator';
import { Express } from 'express';

export class UpdateUserDto {
  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  bio: string;

  @IsOptional()
  file: Express.Multer.File;
}
