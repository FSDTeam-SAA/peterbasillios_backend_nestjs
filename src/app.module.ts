import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './app/config';
import { AuthModule } from './app/module/auth/auth.module';
import { ContactModule } from './app/module/contact/contact.module';
import { DashboardModule } from './app/module/dashboard/dashboard.module';
import { NotificationModule } from './app/module/notification/notification.module';
import { ProjectModule } from './app/module/project/project.module';
import { ServiceModule } from './app/module/service/service.module';
// import { SubscribeModule } from './app/module/subscribe/subscribe.module';
import { UserModule } from './app/module/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(config.mongoUri),
    UserModule,
    AuthModule,
    ContactModule,
    DashboardModule,
    // SubscribeModule,
    ServiceModule,
    ProjectModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
