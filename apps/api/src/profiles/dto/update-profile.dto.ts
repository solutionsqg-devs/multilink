import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @ApiProperty({
    example: 'My custom CSS',
    description: 'Custom CSS for the profile (PRO only)',
    required: false,
  })
  @IsString()
  @IsOptional()
  customCss?: string;

  @ApiProperty({
    example: 'My Profile | MultiEnlace',
    description: 'Meta title for SEO',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  metaTitle?: string;

  @ApiProperty({
    example: 'Check out my links and social media',
    description: 'Meta description for SEO',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(160)
  metaDescription?: string;

  @ApiProperty({
    example: 'https://example.com/og-image.jpg',
    description: 'Open Graph image URL (PRO only)',
    required: false,
  })
  @IsString()
  @IsOptional()
  ogImage?: string;

  @ApiProperty({
    example: 'myprofile.com',
    description: 'Custom domain (PRO only)',
    required: false,
  })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the profile is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
