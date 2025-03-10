import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Resolution } from 'src/interfaces';

export class CreateVideoDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Duration must be a number' })
  duration: number;

  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author is required' })
  author: string;
}

export class CreateClassesDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}

export class UpdateClassesDto extends PartialType(CreateClassesDto) {}

export class SegmentVideoDto {
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
