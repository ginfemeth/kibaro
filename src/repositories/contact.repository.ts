import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {KibaroMongoDataSource} from '../datasources';
import {Contact, ContactRelations} from '../models';

export class ContactRepository extends DefaultCrudRepository<
  Contact,
  typeof Contact.prototype.id,
  ContactRelations
> {
  constructor(
    @inject('datasources.kibaro_mongo') dataSource: KibaroMongoDataSource,
  ) {
    super(Contact, dataSource);
  }
}
