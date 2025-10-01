import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderLinksDto {
  @ApiProperty({
    example: ['link-id-1', 'link-id-2', 'link-id-3'],
    description: 'Array of link IDs in the new order',
  })
  @IsArray()
  @IsString({ each: true })
  linkIds!: string[];
}
