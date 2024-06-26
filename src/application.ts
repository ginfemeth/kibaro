import { AuthenticationComponent } from "@loopback/authentication";
import {
  JWTAuthenticationComponent
} from "@loopback/authentication-jwt";
import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { DefaultSequence, RestApplication } from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { KibaroMongoDataSource } from './datasources';
import { MySequence } from './sequence';
import { MyUserService } from './services/user.service';
import { UserServiceBindings } from "./keys";
import { AfterSaveDiplomeInterceptor, AfterSaveReferenceInterceptor } from "./interceptors";
import { MailService } from "./services/mail.service";

export { ApplicationConfig };

export class KibaroApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);
    // this.sequence(DefaultSequence);

    this.component(AuthenticationComponent)
    this.component(JWTAuthenticationComponent)
    this.dataSource(KibaroMongoDataSource, UserServiceBindings.DATASOURCE_NAME);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    // Bind user service
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService),
    this.bind('services.MailService').toClass(MailService);
    // this.bind('interceptors.UserProfileInterceptor').toProvider(AfterSaveDiplomeInterceptor);
    // this.bind('interceptors.UserProfileInterceptor').toProvider(AfterSaveReferenceInterceptor);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
