import {
  inject,
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import { BlockChainModule } from '../blockchainClient';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import { UserServiceBindings } from '../keys';
import { MyUserService } from '../services';

let blockchainClient = new BlockChainModule.BlockchainClient();

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: AfterSaveDiplomeInterceptor.BINDING_KEY}})
export class AfterSaveDiplomeInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${AfterSaveDiplomeInterceptor.name}`;

  constructor(
    @inject(SecurityBindings.USER, {optional: true})
    private userProfile: UserProfile,
    @inject(UserServiceBindings.USER_SERVICE)
        public userService: MyUserService,
  ) {}

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      const result = await next();
      if (this.userProfile) {

        const user =this.userService.findUserById(this.userProfile[securityId]);
        let networkObj = await blockchainClient.connectToNetwork(this.userProfile.name ?? 'enroll', "diplome", (await user).organization);

      if (!networkObj) {
        let errString = 'Error connecting to network';
        return 401;
      }
      let rs;
      rs = await networkObj.contract.submitTransaction("CreateDiplome",
        result.id,
        result.owner,
        result.awards,
        result.adress,
        result.phone,
        result.email,
        result.cid,
        new Date().toISOString()
      );
      return (JSON.stringify(JSON.parse(rs.toString()), null, 2));
      }else{
        console.log('No user is logged in');
      }
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
