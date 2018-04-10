export class UtilService {

  constructor() {
  }

  /**
   * Allow for parsing of string, byte arrays or buffers... and convert hte minto the matching byte array
   * @param  input the provided input
   * @returns  the resulting byte array
   */
  static normalizeInput(input: string | Uint8Array | Buffer): Uint8Array {
    let ret: Uint8Array;
    if (input instanceof Uint8Array) {
      ret = input;
    } else if (typeof input === 'string') {
      ret = new Uint8Array(Buffer.from(input, 'utf-8'));
    } else {
      ret = new Uint8Array(<Buffer>input);
    }
    return ret;
  }

  /**
   * Converts a byte array into the corresponding hex string
   * @param  input the provided byte array
   * @returns  the resulting hex string
   */
  static toHex(input: Uint8Array): string {
    return input.reduce<string>(hexAndConcatenate, '');

    // can't have lambdas in static functions: see https://github.com/dherges/ng-packagr/issues/696
    function hexAndConcatenate(previousValue, value, i, a) {
      return previousValue + (value < 16 ? '0' : '') + value.toString(16);
    }
  }

  /**
   * Converts any value in [0 .. 2^32-1] to the equivalent 8 digit hex string
   * @param  val the value to be converted
   * @returns  the resulting hex string
   */
  static uint32ToHex(val: number): string {
    return (0x100000000 + val).toString(16).substring(1)
  }
}
