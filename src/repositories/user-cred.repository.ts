import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
// import {UserCredentials, UserCredentialsRelations} from '../models';
import {KibaroMongoDataSource} from '../datasources';
import { UserCredentials, UserCredentialsRelations } from '../models/user-credentials.model';

export class UserCredRepository extends DefaultCrudRepository<
UserCredentials,
typeof UserCredentials.prototype.id,
UserCredentialsRelations> {
  constructor(
    @inject('datasources.kibaro_mongo') dataSource: KibaroMongoDataSource,
  ) {
    super(UserCredentials, dataSource);
  }
}