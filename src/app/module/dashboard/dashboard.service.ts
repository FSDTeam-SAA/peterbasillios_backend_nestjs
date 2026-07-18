import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { Contact, ContactDocument } from '../contact/entities/contact.entity';
import { Project, ProjectDocument } from '../project/entities/project.entity';
import { Service, ServiceDocument } from '../service/entities/service.entity';

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async dashboardOverView() {
    const [totalProjects, totalService, contactInquiries, totalImagesResult] =
      await Promise.all([
      this.projectModel.countDocuments(),
      this.serviceModel.countDocuments(),
      this.contactModel.countDocuments(),
      this.projectModel.aggregate([
        {
          $project: {
            imageCount: {
              $cond: [{ $isArray: '$image' }, { $size: '$image' }, 0],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$imageCount' },
          },
        },
      ]),
    ]);

    return {
      totalProjects,
      totalImages: totalImagesResult[0]?.total || 0,
      totalService,
      contactInquiries,
    };
  }

  async getInquiryChart(year?: number) {
    const targetYear = year ?? new Date().getFullYear();

    const result = await this.contactModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31T23:59:59`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          totalInquiries: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    const chartData = months.map((label, i) => {
      const found = result.find((r) => r._id.month === i + 1);
      return { month: label, totalInquiries: found?.totalInquiries || 0 };
    });

    const totalInquiries = chartData.reduce(
      (sum, item) => sum + item.totalInquiries,
      0,
    );

    return {
      year: targetYear,
      summary: {
        totalInquiries,
      },
      chartData,
    };
  }

  async getProjectGallery(options: IOptions) {
    const { limit, page, skip } = paginationHelper(options);

    const gallery = await this.projectModel.aggregate([
      { $unwind: '$image' },
      {
        $project: {
          _id: 0,
          projectId: '$_id',
          projectName: '$name',
          image: '$image',
          createdAt: '$createdAt',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          meta: [{ $count: 'total' }],
        },
      },
    ]);

    const data = gallery[0]?.data || [];
    const total = gallery[0]?.meta[0]?.total || 0;

    return {
      meta: {
        page,
        limit,
        total,
      },
      data,
    };
  }
}
