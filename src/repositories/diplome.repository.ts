import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {KibaroMongoDataSource} from '../datasources';
import {Diplome, DiplomeRelations} from '../models';

export class DiplomeRepository extends DefaultCrudRepository<
  Diplome,
  typeof Diplome.prototype.id,
  DiplomeRelations
> {
  constructor(
    @inject('datasources.kibaro_mongo') dataSource: KibaroMongoDataSource,
  ) {
    super(Diplome, dataSource);
  }
}
