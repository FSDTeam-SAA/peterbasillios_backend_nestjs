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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { fileUpload } from '../../helpers/fileUploder';
import pick from '../../helpers/pick';
import AuthGuard from '../../middlewares/auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceService } from './service.service';

@ApiTags('service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'create service' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.serviceService.createService(
      createServiceDto,
      file,
    );

    return {
      message: 'Service created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'get all service' })
  @ApiQuery({ name: 'searchTerm', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @HttpCode(HttpStatus.OK)
  async getAllService(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'name', 'description']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.serviceService.getAllService(filters, options);

    return {
      message: 'Service retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  async getSingleService(@Param('id') id: string) {
    const result = await this.serviceService.getSingleService(id);

    return {
      message: 'Service retrieved successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'update service' })
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('admin'))
  @UseInterceptors(FileInterceptor('image', fileUpload.uploadConfig))
  @HttpCode(HttpStatus.OK)
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.serviceService.updateService(
      id,
      updateServiceDto,
      file,
    );

    return {
      message: 'Service updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete service' })
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async removeService(@Param('id') id: string) {
    const result = await this.serviceService.removeService(id);

    return {
      message: 'Service deleted successfully',
      data: result,
    };
  }
}
