import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from '../contact/entities/contact.entity';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import { Service, ServiceSchema } from '../service/entities/service.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
