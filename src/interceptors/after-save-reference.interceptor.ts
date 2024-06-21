import {
  inject,
  /* inject, */
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import { BlockChainModule } from '../blockchainClient';
import {SecurityBindings, UserProfile} from '@loopback/security';

let blockchainClient = new BlockChainModule.BlockchainClient();
/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({ tags: { key: AfterSaveReferenceInterceptor.BINDING_KEY } })
export class AfterSaveReferenceInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${AfterSaveReferenceInterceptor.name}`;

  constructor(
    @inject(SecurityBindings.USER, {optional: false})
    private userProfile: UserProfile,
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
      // Add post-invocation logic here
      let networkObj = await blockchainClient.connectToNetwork(this.userProfile.name ?? 'enroll', "reference", this.userProfile.org);
      if (!networkObj) {
        let errString = 'Error connecting to network';
        return 401;
      }

      let rs;
      rs = await networkObj.contract.submitTransaction("CreateReference",
        result.id,
        result.prenom,
        result.nom,
        result.mission,
        result.entreprise,
        result.referent,
        result.poste,
        result.email,
        result.phone,
        result.appreciation,
        result.date
      );
      return (JSON.stringify(JSON.parse(rs.toString()), null, 2));
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
