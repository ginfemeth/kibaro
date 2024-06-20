import {UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
// import {User} from './models';
import {Credentials} from './repositories';
// import {PasswordHasher} from './services';
import { User } from './models/user.model';
import { PasswordHasher } from './services';

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

// export namespace UserServiceBindings {
//   export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
//     'services.user.service',
//   );
//   export const DATASOURCE_NAME = 'kibaro_mongo';
// }
export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
  export const DATASOURCE_NAME = 'kibaro_mongo';
  export const USER_REPOSITORY = 'repositories.UserRepository';
  export const USER_CREDENTIALS_REPOSITORY =
    'repositories.UserCredentialsRepository';
}