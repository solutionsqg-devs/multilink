import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({
    example: 'My Website',
    description: 'Link title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Link URL',
  })
  @IsUrl({}, { message: 'Must be a valid URL' })
  @IsNotEmpty()
  url!: string;

  @ApiProperty({
    example: 'Visit my personal website',
    description: 'Link description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    example: 'globe',
    description: 'Icon name or URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    example: 0,
    description: 'Position in the list (0-based)',
    required: false,
  })
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the link is active',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
