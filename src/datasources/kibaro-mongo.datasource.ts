import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'kibaro_mongo',
  connector: 'mongodb',
  url: 'mongodb+srv://amadouadmin:cY6i3uC8daJCahR5@cluster0.pw23q6v.mongodb.net/Kibarocert2?retryWrites=true&w=majority&appName=Cluster0',
  host: '',
  port: 0,
  user: '',
  password: '',
  database: '',
  useNewUrlParser: true
};
// mongodb+srv://amadouadmin:cY6i3uC8daJCahR5@kibarocertinstance0.qdhmgmi.mongodb.net/?retryWrites=true&w=majority&appName=KibaroCertInstance0

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class KibaroMongoDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'kibaro_mongo';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.kibaro_mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
