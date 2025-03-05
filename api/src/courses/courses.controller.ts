import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service';
import {
  CreateClassesDto,
  CreateCourseDto,
  UpdateClassesDto,
  UpdateCourseDto,
} from './dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  createCourse(@Body() data: CreateCourseDto) {
    return this.coursesService.createCourse(data);
  }

  @Patch(':id')
  updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(id, data);
  }

  @Get()
  getCourses() {
    return this.coursesService.getCourses();
  }

  @Get(':id')
  getCourseById(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getCourseById(id);
  }

  @Get(':id/classes')
  getCourseClasses(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getCourseClasses(id);
  }

  @Post(':course_id/classes')
  createClasses(
    @Param('course_id', ParseIntPipe) course_id: number,
    @Body() data: CreateClassesDto,
  ) {
    return this.coursesService.createClasses(course_id, data);
  }

  @Patch(':course_id/classes/:class_id')
  updateClasses(
    @Param('course_id', ParseIntPipe) course_id: number,
    @Param('class_id', ParseIntPipe) class_id: number,
    @Body() data: UpdateClassesDto,
  ) {
    return this.coursesService.updateClasses(course_id, class_id, data);
  }

  @Get(':course_id/classes/:class_id')
  getClassById(
    @Param('course_id', ParseIntPipe) course_id: number,
    @Param('class_id', ParseIntPipe) class_id: number,
  ) {
    return this.coursesService.getClassById(course_id, class_id);
  }

  @Post(':course_id/classes/:class_id/upload')
  @UseInterceptors(FileInterceptor('video'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'video/mp4' })],
      }),
    )
    videoFile: Express.Multer.File,
    @Param('course_id', ParseIntPipe) course_id: number,
    @Param('class_id', ParseIntPipe) class_id: number,
  ) {
    return this.coursesService.uploadVideoFile(videoFile, course_id, class_id);
  }

  @Post('/segment/class/:class_id')
  segmentClass(@Param('class_id', ParseIntPipe) class_id: number) {
    console.log({ class_id });
    return class_id;
  }
}
