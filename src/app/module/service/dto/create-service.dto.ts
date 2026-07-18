import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiPropertyOptional({ example: '' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ type: String, format: 'binary' })
  @Allow()
  image?: string;
}
