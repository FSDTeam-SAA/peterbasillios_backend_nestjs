import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import buildWhereConditions from '../../helpers/buildWhereConditions';
import { fileUpload } from '../../helpers/fileUploder';
import paginationHelper, { IOptions } from '../../helpers/pagenation';
import { IFilterParams } from '../../helpers/pick';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}
  async createProject(
    createProjectDto: CreateProjectDto,
    files?: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const imageupload = await Promise.all(
        files.map((file) => fileUpload.uploadToCloudinary(file)),
      );
      createProjectDto.image = imageupload.map((file) => file.url);
    }

    const project = await this.projectModel.create(createProjectDto);
    return project;
  }

  async getAllProject(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereConditions = buildWhereConditions(params, [
      'name',
      'description',
    ]);
    const total = await this.projectModel.countDocuments(whereConditions);
    const projects = await this.projectModel
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
      data: projects,
    };
  }

  async getSingleProject(id: string) {
    const project = await this.projectModel.findById(id);
    if (!project) throw new HttpException('Project not found', 404);
    return project;
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
    files?: Express.Multer.File[],
  ) {
    const isExist = await this.projectModel.findById(id);
    if (!isExist) throw new HttpException('Project not found', 404);

    if (files && files.length > 0) {
      const imageupload = await Promise.all(
        files.map((file) => fileUpload.uploadToCloudinary(file)),
      );
      updateProjectDto.image = imageupload.map((file) => file.url);
    }

    const result = await this.projectModel.findByIdAndUpdate(
      id,
      updateProjectDto,
      {
        new: true,
      },
    );
    return result;
  }

  async removeProject(id: string) {
    const result = await this.projectModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Project not found', 404);
    return result;
  }
}
