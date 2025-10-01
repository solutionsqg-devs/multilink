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
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a profile for the current user' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 409, description: 'Profile already exists or username taken' })
  create(@CurrentUser() user: any, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(user.id, createProfileDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all active profiles' })
  @ApiResponse({ status: 200, description: 'Returns all active profiles' })
  findAll() {
    return this.profilesService.findAll();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  getMyProfile(@CurrentUser() user: any) {
    return this.profilesService.findByUserId(user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a profile by ID' })
  @ApiResponse({ status: 200, description: 'Returns the profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Get('username/:username')
  @Public()
  @ApiOperation({ summary: 'Get a profile by username' })
  @ApiResponse({ status: 200, description: 'Returns the profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findByUsername(@Param('username') username: string) {
    return this.profilesService.findByUsername(username);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Username already taken' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.profilesService.update(id, user.id, updateProfileDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (deactivate) current user profile' })
  @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.profilesService.remove(id, user.id);
  }
}
