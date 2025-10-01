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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
}
