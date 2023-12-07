import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
  Param,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryParamType } from 'types/QueryParamType';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/')
  @UseInterceptors(FileInterceptor('image'))
  async compressImg(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: { query: { width: string; height: string } },
  ) {
    const image = await this.appService.compressImage(file, {
      width: request.query.width,
      height: request.query.height,
    });
    return image;
  }

  @Post(':attachType/:resourceNo')
  @UseInterceptors(FileInterceptor('image'))
  async compressAndSubmit(
    @UploadedFile() file: Express.Multer.File,
    @Headers('Authorization') accessToken: string,
    @Param('attachType') type: QueryParamType['type'],
    @Param('resourceNo') pk: QueryParamType['type'],
    @Req() request: { query: { width: string; height: string } },
  ) {
    const image = await this.appService.compressImage(file, {
      width: request.query.width,
      height: request.query.height,
    });
    return await this.appService.forwardToServer(
      { type, pk },
      image,
      accessToken,
    );
  }
}
