import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional, MaxLength } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username (alphanumeric and underscore only)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  username!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Display name for the profile',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @ApiProperty({
    example: 'Designer & Developer | Creating amazing things',
    description: 'Profile bio',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    example: 'default',
    description: 'Theme name',
    required: false,
  })
  @IsString()
  @IsOptional()
  theme?: string;
}
