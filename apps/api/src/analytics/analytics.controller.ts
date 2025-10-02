import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview for current user' })
  @ApiResponse({ status: 200, description: 'Returns analytics overview' })
  getOverview(@CurrentUser() user: any) {
    return this.analyticsService.getOverview(user.id);
  }

  @Get('link/:id')
  @ApiOperation({ summary: 'Get analytics for a specific link' })
  @ApiResponse({ status: 200, description: 'Returns link analytics' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  getLinkAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.analyticsService.getLinkAnalytics(id, user.id);
  }
}
