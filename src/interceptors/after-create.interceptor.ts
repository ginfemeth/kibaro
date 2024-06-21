import {
  /* inject, */
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {registerAndEnrollUser} from '../helper';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: AfterCreateInterceptor.BINDING_KEY}})
export class AfterCreateInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${AfterCreateInterceptor.name}`;

  /*
  constructor() {}
  */

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
      let rs = await registerAndEnrollUser(result.username, result.realm, result.organization)
      // { success: true, message: 'user8' }
      return rs;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
