import { CreateFileDto } from '../../files/dto/create-file.dto';

export class CreatePostDto {
  readonly title: string;
  readonly description: string;
  readonly content: string;
  readonly images: CreateFileDto;
}
