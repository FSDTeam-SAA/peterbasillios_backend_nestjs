import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import AuthGuard from 'src/app/middlewares/auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard overview data',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  @HttpCode(HttpStatus.OK)
  async dashboardOverview() {
    const result = await this.dashboardService.dashboardOverView();

    return {
      message: 'Dashboard overview retrieved successfully',
      data: result,
    };
  }

  @Get('inquiry-chart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Contact inquiry chart by month',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2026 })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  async getInquiryChart(@Query('year') year?: string) {
    const data = await this.dashboardService.getInquiryChart(
      year ? Number(year) : undefined,
    );

    return { message: 'Inquiry chart fetched successfully', data };
  }

  @Get('gallery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all project uploaded images',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('admin'))
  async getProjectGallery(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.dashboardService.getProjectGallery({
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });

    return {
      message: 'Project gallery retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }
}
