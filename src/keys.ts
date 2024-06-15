import {BindingKey} from '@loopback/context';
import {TokenService, UserService} from '@loopback/authentication';
import {PasswordHasher} from './services/hash-password.service';
import { UserCredRepository } from './repositories/user-cred.repository';
import { Credentials } from './repositories/user.repository';
import { MyUser } from './models/user.model';
export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'myjwts3cr3t';
  export const TOKEN_EXPIRES_IN_VALUE = '36000';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<MyUser, Credentials>>(
    'services.user.service',
  );
  export const DATASOURCE_NAME = BindingKey.create<UserService<MyUser, Credentials>>(
    'kibaro_mongo',
  );
}
