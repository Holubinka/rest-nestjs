import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UploadFile = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  return req.files.map((image) => ({
    key: image.key,
    url: image.location,
  }));
});
