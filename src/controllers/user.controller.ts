// Uncomment these imports to begin using these cool features!
import {TokenService, authenticate} from '@loopback/authentication';
import {
  Credentials,
  // MyUserService,
  TokenServiceBindings,
  User,
  UserRepository,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject, intercept} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {securityId} from '@loopback/security';
import {
  SchemaObject,
  get,
  getModelSchemaRef,
  post,
  requestBody,
  response,
  param
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {AfterCreateInterceptor} from '../interceptors';
import { enrollAdmin } from '../helper';
import { MyUserService } from '../services/user.service';


@model()
    export class CreateUser extends User {
      @property({
        type: 'string',
        required: true,
      })
      password: string;
    }

    const UserSchema: SchemaObject = {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
        },
        password: {
          type: 'string',
          minLength: 6,
        },
      },
    };

    export const RequestBody = {
      description: 'The input of login function',
      required: true,
      content: {
        'application/json': { schema: UserSchema },
      },
    };

    export class UserController {
      constructor(
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: TokenService,
        @inject(UserServiceBindings.USER_SERVICE)
        public userService: MyUserService,
        @inject(SecurityBindings.USER, { optional: true })
        public user: UserProfile,
        @repository(UserRepository) protected userRepository: UserRepository,
      ) { }
  @intercept(AfterCreateInterceptor.BINDING_KEY)
  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CreateUser, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: CreateUser,
  ): Promise<User> {
    const password = await hash(newUserRequest.password, await genSalt());
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, 'password'),
    );

    await this.userRepository.userCredentials(savedUser.id).create({password});
    return savedUser;
  }

  @post('/signin', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async signIn(
    @requestBody(RequestBody) credentials: Credentials,
  ): Promise<{token: string, user: User}> {
    const user = await this.userService.MyverifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return {token, user};
  }

  @post('/hlf-enrollAdmin')
  @response(200, {
    description: 'Enroll Admin user and generate certifictate in wallet',
  })
  async enrollAdmin(
    @param.path.string('orgName') orgName: string,
    @requestBody({
      content: {
        'application/json': {
          type: 'object',
          schema: {
            properties: {
              result: {type: 'string'},
            },
          },
        },
      },
    }) data: any,
  ): Promise<any> {
    const result = enrollAdmin(orgName);
    return result;
  }

  @post('/gameshits/{id}', {
    responses: {
      '200': {
        description: 'Return the number of correct answers',
      },
    },
  })
  async gamesHits(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          type: 'object',
          schema: {
            properties: {
              success: {type: 'boolean'},
            },
          },
        },
      },
    }) data: any,
  ): Promise<any> {
    const result = enrollAdmin(id);
    return result
  }

  @authenticate('jwt')
  @get('/whoami', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    loggedInUserProfile: UserProfile,
  ): Promise<string> {
    return loggedInUserProfile[securityId];
  }
}
