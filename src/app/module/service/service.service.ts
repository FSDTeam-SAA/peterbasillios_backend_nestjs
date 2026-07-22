import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import buildWhereConditions from '../../helpers/buildWhereConditions';
import { fileUpload } from '../../helpers/fileUploder';
import paginationHelper, { IOptions } from '../../helpers/pagenation';
import { IFilterParams } from '../../helpers/pick';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async createService(
    createServiceDto: CreateServiceDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadedFile = await fileUpload.uploadToCloudinary(file);
      createServiceDto.image = uploadedFile.url;
    }
    const service = await this.serviceModel.create(createServiceDto);
    return service;
  }

  async getAllService(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'name',
      'description',
    ]);
    const total = await this.serviceModel.countDocuments(whereConditions);
    const services = await this.serviceModel
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: services,
    };
  }

  async getSingleService(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new HttpException('Service is not found', 404);
    return service;
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
    file?: Express.Multer.File,
  ) {
    const isExist = await this.serviceModel.findById(id);
    if (!isExist) throw new HttpException('Service not found', 404);
    if (file) {
      const uploadedFile = await fileUpload.uploadToCloudinary(file);
      updateServiceDto.image = uploadedFile.url;
    }
    const result = await this.serviceModel.findByIdAndUpdate(
      id,
      updateServiceDto,
      {
        new: true,
      },
    );
    return result;
  }

  async removeService(id: string) {
    const result = await this.serviceModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Service not found', 404);
    return result;
  }

  async addImage(id: string, file?: Express.Multer.File) {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new HttpException('Service not found', 404);

    if (!file) {
      throw new HttpException('Image file is required', 400);
    }

    const uploadedFile = await fileUpload.uploadToCloudinary(file);

    const result = await this.serviceModel.findByIdAndUpdate(
      id,
      { image: uploadedFile.url },
      { new: true },
    );

    return result;
  }

  async removeImage(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new HttpException('Service not found', 404);

    const result = await this.serviceModel.findByIdAndUpdate(
      id,
      { $unset: { image: '' } },
      { new: true },
    );

    return result;
  }
}
