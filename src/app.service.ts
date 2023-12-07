import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import sharp from 'sharp';
import axios, { isAxiosError } from 'axios';
import { QueryParamType } from 'types/QueryParamType';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  async compressImage(
    file: Express.Multer.File,
    size?: { width?: string; height?: string },
  ) {
    if (!file) {
      throw new BadRequestException('이미지가 첨부 되지않았습니다');
    }
    try {
      const image = await sharp(file.buffer)
        .resize(
          (size?.width && Number(size.width)) ?? 336,
          (size?.height && Number(size.height)) ?? 142,
          {
            fit: 'cover',
          },
        )
        .withMetadata()
        .toFormat('webp', { quality: 80 })
        .toBuffer();
      return image;
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }

  async forwardToServer(
    { type, pk }: QueryParamType,
    image: Buffer,
    accessToken: string,
  ) {
    const formData = new FormData();
    formData.append('image', new Blob([image.buffer]));
    const BASEURL = this.configService.get('BASE_URL');
    try {
      const { data } = await axios.post(`/${type}/${pk}`, image, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: accessToken,
        },
        baseURL: BASEURL,
        transformRequest: [
          function () {
            return formData;
          },
        ],
      });
      return data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        throw new HttpException(err.response.data, err.response.status);
      } else throw new InternalServerErrorException();
    }
  }
}
