// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { UserService } from '@loopback/authentication';
import { UserRelations } from '@loopback/authentication-jwt';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import { compare } from 'bcryptjs';
import { getRegisteredUser } from '../helper';
import { User, CustomCredentials } from '../models';
import { UserRepository } from '../repositories/user.repository';

/**
 * A pre-defined type for user credentials. It assumes a user logs in
 * using the username and password. You can modify it if your app has different credential fields
 */

export class MyUserService implements UserService<User, CustomCredentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) { }

  async verifyCredentials(credentials: CustomCredentials): Promise<User> {
    const invalidCredentialsError = 'Invalid username or password.';
    const unregisteredError = 'Vous n\'avez pas encore de compte.';

    const foundUser = await this.userRepository.findOne({
      where: { username: credentials.username },
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    let user = await getRegisteredUser(credentials.username, credentials.organization);

    if (user == null) {
      throw new HttpErrors.NetworkAuthenticationRequire(unregisteredError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id.toString(),
      name: user.username,
      id: user.id,
      email: user.email,
      organization: user.organization,
    };
  }

  //function to find user by id
  async findUserById(id: string): Promise<User & UserRelations> {
    const userNotfound = 'invalid User';
    const foundUser = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(userNotfound);
    }
    return foundUser;
  }
}
