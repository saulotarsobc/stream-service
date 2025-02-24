import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { Resolution } from 'src/ts/interfaces';

export class CreateVideoDto {}

export class SegmentVideoDto {
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @IsString({ message: 'Session must be a string' })
  @IsNotEmpty({ message: 'Session is required' })
  session: string;

  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Resolution is required' })
  resolution: Resolution;

  @IsString({ message: 'HLS params must be a string' })
  @IsNotEmpty({ message: 'HLS params is required' })
  bitrate: string;

  @IsString({ message: 'HLS params must be a string' })
  @IsNotEmpty({ message: 'HLS params is required' })
  hls_time: string;

  @IsString({ message: 'HLS params must be a string' })
  @IsNotEmpty({ message: 'HLS params is required' })
  hls_list_size: string;
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {}
