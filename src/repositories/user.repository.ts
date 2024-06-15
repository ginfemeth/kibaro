import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {KibaroMongoDataSource} from '../datasources';
import {UserCredRepository} from './user-cred.repository';
import { MyUser, UserRelations } from '../models/user.model';
import { UserCredentials } from '../models/user-credentials.model';

export type Credentials = {
    email: string;
    password: string;
  };

export class MyUserRepository extends DefaultCrudRepository<
  MyUser,
  typeof MyUser.prototype.id,
  UserRelations
  > {


  public readonly userCredentials: 
  HasOneRepositoryFactory<UserCredentials,typeof MyUser.prototype.id>;

  constructor(
    @inject('datasources.kibaro_mongo') dataSource: KibaroMongoDataSource, @repository.getter('UserCredRepository') protected userCredRepositoryGetter: Getter<UserCredRepository>,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredRepository>,
  ) {
    super(MyUser, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
        'userCredentials',
        userCredentialsRepositoryGetter,
      );
      this.registerInclusionResolver(
        'userCredentials',
        this.userCredentials.inclusionResolver,
      );
  }


  async findCredentials(
    userId: typeof MyUser.prototype.id,
  ): Promise<UserCredentials | undefined> {
    return this.userCredentials(userId)
      .get()
      .catch(err => {
        if (err.code === 'ENTITY_NOT_FOUND') return undefined;
        throw err;
      });
  }
  
}