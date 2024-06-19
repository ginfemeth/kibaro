import { AuthenticationComponent } from "@loopback/authentication";
import {
  JWTAuthenticationComponent,
  // MyUserService,
  // UserServiceBindings,
} from "@loopback/authentication-jwt";
import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
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
// import { UserServiceBindings } from "./keys";

export { ApplicationConfig };

export class KibaroApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    this.component(AuthenticationComponent)
    this.component(JWTAuthenticationComponent)
    // this.dataSource(KibaroMongoDataSource, 'kibaro_mongo')
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
