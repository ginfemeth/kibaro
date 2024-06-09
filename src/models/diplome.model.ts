import {Entity, model, property} from '@loopback/repository';

@model()
export class Diplome extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;
  
  @property({
    type: 'string',
    required: true,
  })
  owner: string;

  @property({
    type: 'string',
    required: true,
  })
  awards: string;

  @property({
    type: 'string',
  })
  adress?: string;

  @property({
    type: 'string',
  })
  phone?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  cid: string;

  @property({
    type: 'date',
  })
  date?: string;


  constructor(data?: Partial<Diplome>) {
    super(data);
  }
}

export interface DiplomeRelations {
  // describe navigational properties here
}

export type DiplomeWithRelations = Diplome & DiplomeRelations;
