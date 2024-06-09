import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {KibaroMongoDataSource} from '../datasources';
import {Reference, ReferenceRelations} from '../models';

export class ReferenceRepository extends DefaultCrudRepository<
  Reference,
  typeof Reference.prototype.id,
  ReferenceRelations
> {
  constructor(
    @inject('datasources.kibaro_mongo') dataSource: KibaroMongoDataSource,
  ) {
    super(Reference, dataSource);
  }
}
