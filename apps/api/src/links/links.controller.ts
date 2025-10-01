import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Links')
@ApiBearerAuth()
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new link' })
  @ApiResponse({ status: 201, description: 'Link created successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  create(@CurrentUser() user: any, @Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(user.id, createLinkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all links for current user' })
  @ApiResponse({ status: 200, description: 'Returns all links' })
  findAll(@CurrentUser() user: any) {
    return this.linksService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a link by ID' })
  @ApiResponse({ status: 200, description: 'Returns the link' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.linksService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a link' })
  @ApiResponse({ status: 200, description: 'Link updated successfully' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateLinkDto: UpdateLinkDto) {
    return this.linksService.update(id, user.id, updateLinkDto);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder links' })
  @ApiResponse({ status: 200, description: 'Links reordered successfully' })
  reorder(@CurrentUser() user: any, @Body() reorderDto: ReorderLinksDto) {
    return this.linksService.reorder(user.id, reorderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (deactivate) a link' })
  @ApiResponse({ status: 204, description: 'Link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.linksService.remove(id, user.id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a link' })
  @ApiResponse({ status: 204, description: 'Link permanently deleted' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  hardDelete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.linksService.hardDelete(id, user.id);
  }

  @Get(':id/click')
  @Public()
  @ApiOperation({ summary: 'Track click and redirect' })
  @ApiResponse({ status: 302, description: 'Redirects to link URL' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async trackClick(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const refererHeader = req.headers['referer'] || req.headers['referrer'];
    const referer = Array.isArray(refererHeader) ? refererHeader[0] : refererHeader || '';

    const link = await this.linksService.trackClick(id, {
      ip,
      userAgent,
      referer,
    });

    return res.redirect(302, link.url);
  }
}
