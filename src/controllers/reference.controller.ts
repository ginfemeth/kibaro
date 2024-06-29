import {authenticate} from "@loopback/authentication";
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {BlockChainModule} from '../blockchainClient';
import {Reference} from '../models';
import {ReferenceRepository} from '../repositories';
import { AfterSaveReferenceInterceptor } from "../interceptors";
import { intercept } from "@loopback/core";
let blockchainClient = new BlockChainModule.BlockchainClient();


export class ReferenceController {
  constructor(
    @repository(ReferenceRepository)
    public referenceRepository: ReferenceRepository,
  ) { }

  @authenticate('jwt')
  @intercept(AfterSaveReferenceInterceptor.BINDING_KEY)
  @post('/references')
  @response(200, {
    description: 'Reference model instance',
    content: {'application/json': {schema: getModelSchemaRef(Reference)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reference, {
            title: 'NewReference',
            exclude: ['id'],
          }),
        },
      },
    })
    reference: Omit<Reference, 'id'>,
  ): Promise<Reference> {
    return this.referenceRepository.create(reference);
  }

  @post('/hlf-reference')
  @response(200, {
    description: 'Save reference model instance to HLF',
    content: {'application/json': {schema: getModelSchemaRef(Reference)}},
  })
  async hlfcreate(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reference, {
            title: 'NewReference',
          }),
        },
      },
    })
    reference: Omit<Reference, 'id'>,
  ): Promise<any> {
    let networkObj = await blockchainClient.connectToNetwork("enroll", "reference", "kibarocertMSP");
    if (!networkObj) {
      let errString = 'Error connecting to network';
      return 401;
    }
    let dataForIssue = {
      "ID": "dip3",
      "owner": "EEE",
      "awards": "red",
      "adress": "dev",
      "email": "Brad@e.com",
      "phone": "0478545215",
      "cid": "154546546546546546546",
      "date": "21/05/2024",
    }
    let results;
    results = await networkObj.contract.submitTransaction("CreateRegistre", 
    "ref3",
    // reference.Consultant.prenom, 
    // reference.Consultant.nom, 
    // reference.Consultant.mission, 
    // reference.Manager.entreprise, 
    // reference.Manager.referent, 
    // reference.Manager.poste, 
    // reference.Manager.email, 
    // reference.Manager.phone, 
    // reference.Manager.appreciation, 
    // reference.Manager.date
  );
    return (JSON.stringify(JSON.parse(results.toString()), null, 2));
  }

  @authenticate('jwt')
  @get('/references/count')
  @response(200, {
    description: 'Reference model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Reference) where?: Where<Reference>,
  ): Promise<Count> {
    return this.referenceRepository.count(where);
  }

  @authenticate('jwt')
  @get('/references')
  @response(200, {
    description: 'Array of Reference model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Reference, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Reference) filter?: Filter<Reference>,
  ): Promise<Reference[]> {
    return this.referenceRepository.find(filter);
  }

  @get('/hlf-references')
  @response(200, {
    description: 'Array of Reference model instances from HLF',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Reference, {includeRelations: true}),
        },
      },
    },
  })

  @authenticate('jwt')
  async findAll(
  ): Promise<any> {
    let networkObj = await blockchainClient.connectToNetwork("enroll", "reference", "kibarocertMSP");
    if (!networkObj) {
      let errString = 'Error connecting to network';
      return 401;
    }
    let results;
    results = await networkObj.contract.evaluateTransaction("GetAllReferences");
    return JSON.stringify(JSON.parse(results.toString()));
  }

  @authenticate('jwt')
  @patch('/references')
  @response(200, {
    description: 'Reference PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reference, {partial: true}),
        },
      },
    })
    reference: Reference,
    @param.where(Reference) where?: Where<Reference>,
  ): Promise<Count> {
    return this.referenceRepository.updateAll(reference, where);
  }

  @get('/references/{id}')
  @response(200, {
    description: 'Reference model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Reference, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Reference, {exclude: 'where'}) filter?: FilterExcludingWhere<Reference>
  ): Promise<Reference> {
    return this.referenceRepository.findById(id, filter);
  }

  @get('/hlf-references/{id}')
  @response(200, {
    description: 'Reference model instance from HLF',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Reference, {includeRelations: true}),
      },
    },
  })
  async findHlfById(
    @param.path.string('id') id: string,
  ): Promise<any> {
    let networkObj = await blockchainClient.connectToNetwork("user100", "reference", "kibarocertMSP");
    if (!networkObj) {
      let errString = 'Error connecting to network';
      return 401;
    }
    let results;
    results = await networkObj.contract.evaluateTransaction("ReadReference", id);
    // return JSON.stringify(JSON.parse(results.toString()));
    return results;
  }

  @authenticate('jwt')
  @patch('/references/{id}')
  @response(204, {
    description: 'Reference PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reference, {partial: true}),
        },
      },
    })
    reference: Reference,
  ): Promise<void> {
    await this.referenceRepository.updateById(id, reference);
  }

  @authenticate('jwt')
  @put('/references/{id}')
  @response(204, {
    description: 'Reference PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() reference: Reference,
  ): Promise<void> {
    await this.referenceRepository.replaceById(id, reference);
  }

  @authenticate('jwt')
  @del('/references/{id}')
  @response(204, {
    description: 'Reference DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.referenceRepository.deleteById(id);
  }

}

