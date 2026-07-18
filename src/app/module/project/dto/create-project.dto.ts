import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiPropertyOptional({ example: 'Project 1' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Project Description' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @Allow()
  image?: string[];
}
