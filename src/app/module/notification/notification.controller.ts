import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import pick from 'src/app/helpers/pick';
import AuthGuard from 'src/app/middlewares/auth.guard';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('admin'))
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
    example: '',
    description: 'Search by title, message, type',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    example: 'contact',
    description: 'Filter by notification type',
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: Boolean,
    example: false,
    description: 'Filter by read status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number. Default is 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page. Default is 10',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
    description: 'Sort field. Default is createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    description: 'Sort order. Default is desc',
  })
  async getAllNotifications(@Req() req: Request) {
    const filters = pick(req.query, ['searchTerm', 'type', 'isRead']);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await this.notificationService.getAllNotifications(
      filters,
      options,
    );

    return {
      message: 'Notifications retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount() {
    const result = await this.notificationService.getUnreadCount();

    return {
      message: 'Unread notification count retrieved successfully',
      data: result,
    };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead() {
    const result = await this.notificationService.markAllAsRead();

    return {
      message: 'Notifications marked as read successfully',
      data: result,
    };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    const result = await this.notificationService.markAsRead(id);

    return {
      message: 'Notification marked as read successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete notification by id' })
  async deleteNotification(@Param('id') id: string) {
    const result = await this.notificationService.deleteNotification(id);

    return {
      message: 'Notification deleted successfully',
      data: result,
    };
  }
}
