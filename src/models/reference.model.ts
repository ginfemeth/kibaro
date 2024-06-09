import {Entity, model, property} from '@loopback/repository';

@model()
export class Reference extends Entity {
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
  nom?: string;

  @property({
    type: 'string',
    required: true,
  })
  prenom: string;

  @property({
    type: 'string',
    required: true,
  })
  mission: string;

  @property({
    type: 'string',
    required: true,
  })
  entreprise: string;

  @property({
    type: 'string',
    required: true,
  })
  referent: string;

  @property({
    type: 'string',
    required: true,
  })
  poste: string;
  
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  phone: string;

  @property({
    type: 'string',
    required: true,
  })
  appreciation: string;

  @property({
    type: 'date',
    required: true,
  })
  date: string;

  constructor(data?: Partial<Reference>) {
    super(data);
  }
}

export interface ReferenceRelations {
  // describe navigational properties here
}

export type ReferenceWithRelations = Reference & ReferenceRelations;
