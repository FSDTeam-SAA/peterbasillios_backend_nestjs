import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { fileUpload } from '../../helpers/fileUploder';
import pick from '../../helpers/pick';
import AuthGuard from '../../middlewares/auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'create project' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(
    FilesInterceptor('image', undefined, fileUpload.uploadConfig),
  )
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.projectService.createProject(
      createProjectDto,
      files,
    );

    return {
      message: 'Project created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'get all project' })
  @ApiQuery({ name: 'searchTerm', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @HttpCode(HttpStatus.OK)
  async getAllProject(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'name', 'description']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.projectService.getAllProject(filters, options);

    return {
      message: 'Project retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'get single project' })
  @HttpCode(HttpStatus.OK)
  async getSingleProject(@Param('id') id: string) {
    const result = await this.projectService.getSingleProject(id);

    return {
      message: 'Project retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'update project' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(
    FilesInterceptor('image', undefined, fileUpload.uploadConfig),
  )
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.projectService.updateProject(
      id,
      updateProjectDto,
      files,
    );

    return {
      message: 'Project updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete project' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async removeProject(@Param('id') id: string) {
    const result = await this.projectService.removeProject(id);

    return {
      message: 'Project deleted successfully',
      data: result,
    };
  }
  @Patch(':id/add-image')
  @ApiOperation({ summary: 'add project image' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(
    FilesInterceptor('image', undefined, fileUpload.uploadConfig),
  )
  @HttpCode(HttpStatus.OK)
  async addImage(
    @Param('id') id: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.projectService.addImage(id, files);

    return {
      message: 'Project image added successfully',
      data: result,
    };
  }

  @Patch(':id/remove-image')
  @ApiOperation({ summary: 'remove project image' })
  @ApiBearerAuth('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          example: 'https://res.cloudinary.com/example/image/upload/project.jpg',
        },
      },
    },
  })
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async removeImage(@Param('id') id: string, @Body('image') image: string) {
    const result = await this.projectService.removeImage(id, image);

    return {
      message: 'Project image removed successfully',
      data: result,
    };
  }
}
