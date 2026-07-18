import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import buildWhereConditions from 'src/app/helpers/buildWhereConditions';
import paginationHelper, { IOptions } from 'src/app/helpers/pagenation';
import { IFilterParams } from 'src/app/helpers/pick';
import {
  Notification,
  NotificationDocument,
} from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async getAllNotifications(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const searchAbleFields = ['title', 'message', 'type'];

    const whereConditions = buildWhereConditions(params, searchAbleFields);

    const total = await this.notificationModel.countDocuments(whereConditions);
    const result = await this.notificationModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('contact');

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  }

  async getUnreadCount() {
    const total = await this.notificationModel.countDocuments({
      isRead: false,
    });

    return { total };
  }

  async markAsRead(id: string) {
    const result = await this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!result) throw new HttpException('Notification is not found', 404);
    return result;
  }

  async markAllAsRead() {
    await this.notificationModel.updateMany(
      { isRead: false },
      { isRead: true },
    );

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(id: string) {
    const result = await this.notificationModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Notification is not found', 404);
    return result;
  }
}
