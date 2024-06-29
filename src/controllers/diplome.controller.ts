import {authenticate} from "@loopback/authentication";
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, param, patch, post, put, requestBody, response} from '@loopback/rest';
import {BlockChainModule} from '../blockchainClient';
import {getRegisteredUser} from '../helper';
import {Diplome} from '../models';
import {DiplomeRepository} from '../repositories';
import { inject, intercept } from "@loopback/core";
import { AfterSaveDiplomeInterceptor } from "../interceptors";
const utf8Decoder = new TextDecoder();
import {SecurityBindings, UserProfile} from '@loopback/security';

let blockchainClient = new BlockChainModule.BlockchainClient();


export class DiplomeController {
  constructor(
    @repository(DiplomeRepository)
    public diplomeRepository: DiplomeRepository,
  ) { }

  @intercept(AfterSaveDiplomeInterceptor.BINDING_KEY)
  @authenticate('jwt')
  @post('/diplomes')
  @response(200, {
    description: 'Diplome model instance',
    content: {'application/json': {schema: getModelSchemaRef(Diplome)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Diplome, {
            title: 'NewDiplome',
            exclude: ['id'],
          }),
        },
      },
    })
    diplome: Omit<Diplome, 'id'>,
  ): Promise<Diplome> {
    return this.diplomeRepository.create(diplome);
  }

  @authenticate('jwt')
  @post('/hlf-diplomes')
  @response(200, {
    description: 'Save diplome model instance to HLF',
    content: {'application/json': {schema: getModelSchemaRef(Diplome)}},
  })
  async hlfcreate(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Diplome, {
            title: 'NewDiplome',
          }),
        },
      },
    })
    diplome: Omit<Diplome, 'id'>,
  ): Promise<any> {
    let networkObj = await blockchainClient.connectToNetwork("user100", "diplome", "kibarocertMSP");
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
      "date": "21/05/2024"
    }
    let results;
    results = await networkObj.contract.submitTransaction("CreateDiplome", "dip9", "AAA", "red", "ile de france", "test@demo.com", "0744519990", "154546546546546546546", "21/05/2024");
    // console.log("1" + results.toString());
    // console.log("2" + JSON.parse(results.toString()));
    // console.log("3" + JSON.parse(results.toString()));
    // console.log(JSON.stringify(JSON.parse(results.toString()), null, 2));
    // console.log("5" + JSON.stringify(Buffer.from(JSON.parse(results.toString()))));
    // console.log(results.toString());
    // return JSON.stringify(JSON.parse(results.toString()));
    return JSON.parse(utf8Decoder.decode(results));
  }

  @authenticate('jwt')
  @get('/diplomes/count')
  @response(200, {
    description: 'Diplome model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Diplome) where?: Where<Diplome>,
  ): Promise<Count> {
    return this.diplomeRepository.count(where);
  }

  @authenticate('jwt')
  @get('/diplomes')
  @response(200, {
    description: 'Array of Diplome model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Diplome, {includeRelations: true}),
        },
      },
    },
  })

  async find(
    @param.filter(Diplome) filter?: Filter<Diplome>,
  ): Promise<Diplome[]> {
    return this.diplomeRepository.find(filter);
  }

  @authenticate('jwt')
  @get('/hlf-diplomes')
  @response(200, {
    description: 'Array of Diplome model instances from HLF',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Diplome, {includeRelations: true}),
        },
      },
    },
  })

  async findAll(
    @inject(SecurityBindings.USER)
    loggedInUserProfile: UserProfile,
  ): Promise<any> {
    let networkObj = await blockchainClient.connectToNetwork("enroll", "diplome", "inphbMSP");
    if (!networkObj) {
      let errString = 'Error connecting to network';
      return 401;
    }
    let results;
    results = await networkObj.contract.evaluateTransaction("GetAllDiplomes");
    return JSON.stringify(JSON.parse(results.toString()));
  }

  @authenticate('jwt')
  @patch('/diplomes')
  @response(200, {
    description: 'Diplome PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Diplome, {partial: true}),
        },
      },
    })
    diplome: Diplome,
    @param.where(Diplome) where?: Where<Diplome>,
  ): Promise<Count> {
    return this.diplomeRepository.updateAll(diplome, where);
  }

  @get('/diplomes/{id}')
  @response(200, {
    description: 'Diplome model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Diplome, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Diplome, {exclude: 'where'}) filter?: FilterExcludingWhere<Diplome>
  ): Promise<Diplome> {
    let user = await getRegisteredUser("enroll", "kibarocertMSP");
    return this.diplomeRepository.findById(id, filter);
  }

  @get('/hlf-diplomes/{id}')
  @response(200, {
    description: 'Diplome model instance from HLF',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Diplome, {includeRelations: true}),
      },
    },
  })
  async findHlfById(
    @param.path.string('id') id: string,
  ): Promise<any> {
    let networkObj = await blockchainClient.connectToNetwork("enroll", "diplome", "kibarocertMSP");
    if (!networkObj) {
      let errString = 'Error connecting to network';
      return 401;
    }
    let results;
    results = await networkObj.contract.evaluateTransaction("ReadDiplome", id);
    return JSON.stringify(JSON.parse(results.toString()));
  }

  @authenticate('jwt')
  @patch('/diplomes/{id}')
  @response(204, {
    description: 'Diplome PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Diplome, {partial: true}),
        },
      },
    })
    diplome: Diplome,
  ): Promise<void> {
    await this.diplomeRepository.updateById(id, diplome);
  }

  @authenticate('jwt')
  @put('/diplomes/{id}')
  @response(204, {
    description: 'Diplome PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() diplome: Diplome,
  ): Promise<void> {
    await this.diplomeRepository.replaceById(id, diplome);
  }

  @del('/diplomes/{id}')
  @response(204, {
    description: 'Diplome DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.diplomeRepository.deleteById(id);
  }
}
