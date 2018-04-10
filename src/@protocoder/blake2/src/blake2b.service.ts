import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { Blake2bContext } from './blake2b-context';

@Injectable()
export class Blake2bService {
  /**
   * Initialization Vector
   */
  private readonly BLAKE2B_IV32 = new Uint32Array([
    0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
    0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
    0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
    0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
  ]);

  /**
   * sigma8 as per the specification
   */
  private readonly SIGMA8: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
    11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
    7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
    9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
    2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
    12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
    13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
    6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
    10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3
  ];

  /**
   * The original SIGMA8 defines offsets based on a uint64 buffer...
   * The joys of javascript mean that we have to work with uint32 buffer,
   * and thus need to double the offsets!
   */
  private readonly SIGMA82: number[] = this.SIGMA8.map(v => {
    return 2 * v
  });


  constructor() {
  }

  init(length: number, key?: Uint8Array): Blake2bContext {
    if (length <= 0 || length > 64) {
      throw new Error('Illegal output length, expected 0 < length <= 64');
    }
    if (key && (key.length <= 0 || key.length > 64)) {
      throw new Error('Illegal key, expected Uint8Array with 0 < length <= 64');
    }

    let context = new Blake2bContext(length);

    for (let i = 0; i < 16; i++) {
      context.h[i] = this.BLAKE2B_IV32[i];
    }

    let keylen = key ? key.length : 0;
    context.h[0] ^= 0x01010000 ^ (keylen << 8) ^ length;

    // key the hash, if applicable
    if (key) {
      this.update(context, key);
      // at the end
      context.c = 128;
    }

    return context;
  }

  update(context: Blake2bContext, input: Uint8Array) {
    for (let i = 0; i < input.length; i++) {
      if (context.c === 128) {
        context.t += context.c;
        this.compress(context, false);
        context.c = 0;
      }
      context.b[context.c++] = input[i];
    }
  }

  final(context: Blake2bContext): Uint8Array {
    context.t += context.c;

    while (context.c < 128) {
      context.b[context.c++] = 0;
    }

    this.compress(context, true);

    let out = new Uint8Array(context.length);
    for (let i = 0; i < context.length; i++) {
      out[i] = context.h[i >> 2] >> (8 * (i & 3));
    }
    return out;
  }

  hash(input: string | Buffer | Uint8Array, key?: Uint8Array, outlen: number = 64): Uint8Array {
    let normalizedInput = UtilService.normalizeInput(input);

    let context = this.init(outlen, key);
    this.update(context, normalizedInput);
    return this.final(context);
  }

  hashToHex(input: string | Buffer | Uint8Array, key?: Uint8Array, outlen: number = 64): string {
    let hash = this.hash(input, key, outlen);
    return UtilService.toHex(hash);
  }

  /**
   * Performs 64-bit unsigned addition
   * Set array[a,a+1] += array[b,b+1] (since Uint64 needs to be represented as 2 Uint32 in javascript
   * @param  array the target array (will be modified as side-effect)
   * @param  a the position at which the array will be modified
   * @param  b the position from which the value should be added
   */
  private add64WithinArray(array: Uint32Array, a: number, b: number) {
    let o0 = array[a] + array[b];
    let o1 = array[a + 1] + array[b + 1];
    if (o0 >= 0x100000000) {
      o1++;
    }
    array[a] = o0;
    array[a + 1] = o1;
  }

  /**
   * Performs 64-bit unsigned addition.
   * Set array[a, a+1] += b
   * @param  array the target array (will be modified as side-effect)
   * @param  a the position at which the array will be modified
   * @param  b0 the low 32 bytes of b
   * @param  b1 the high 32 bytes of b
   */
  private add64Constant(array: Uint32Array, a: number, b0: number, b1: number) {
    let o0 = array[a] + b0;
    if (b0 < 0) {
      o0 += 0x100000000;
    }
    let o1 = array[a + 1] + b1;
    if (o0 >= 0x100000000) {
      o1++;
    }
    array[a] = o0;
    array[a + 1] = o1;
  }

  private getUint32LittleEndian(array: Uint8Array, index: number): number {
    return (array[index] ^
            (array[index + 1] << 8) ^
            (array[index + 2] << 16) ^
            (array[index + 3] << 24));
  }

  private gMixing(a: number, b: number, c: number, d: number,
                  ix: number, iy: number, m: Uint32Array, v: Uint32Array): void {
    let x0 = m[ix];
    let x1 = m[ix + 1];
    let y0 = m[iy];
    let y1 = m[iy + 1];

    this.add64WithinArray(v, a, b);
    this.add64Constant(v, a, x0, x1);

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
    let xor0 = v[d] ^ v[a];
    let xor1 = v[d + 1] ^ v[a + 1];
    v[d] = xor1;
    v[d + 1] = xor0;

    this.add64WithinArray(v, c, d);

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = (xor0 >>> 24) ^ (xor1 << 8);
    v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

    this.add64WithinArray(v, a, b);
    this.add64Constant(v, a, y0, y1);

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
    xor0 = v[d] ^ v[a];
    xor1 = v[d + 1] ^ v[a + 1];
    v[d] = (xor0 >>> 16) ^ (xor1 << 16);
    v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

    this.add64WithinArray(v, c, d);

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = (xor1 >>> 31) ^ (xor0 << 1);
    v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
  }

  private compress(ctx: Blake2bContext, last: boolean): void {
    let v = new Uint32Array(32);
    let m = new Uint32Array(32);

    let i: number;

    for (i = 0; i < 16; i++) {
      v[i] = ctx.h[i];
      v[i + 16] = this.BLAKE2B_IV32[i];
    }

    // low 64 bits of offset
    v[24] = v[24] ^ ctx.t;
    v[25] = v[25] ^ (ctx.t / 0x100000000);
    // high 64 bits not supported, offset may not be higher than 2**53-1

    // last block flag set ?
    if (last) {
      v[28] = ~v[28];
      v[29] = ~v[29];
    }

    // get little-endian words
    for (i = 0; i < 32; i++) {
      m[i] = this.getUint32LittleEndian(ctx.b, 4 * i);
    }


    // twelve rounds of mixing
    for (i = 0; i < 12; i++) {
      this.gMixing(0, 8, 16, 24, this.SIGMA82[i * 16 + 0], this.SIGMA82[i * 16 + 1], m, v);
      this.gMixing(2, 10, 18, 26, this.SIGMA82[i * 16 + 2], this.SIGMA82[i * 16 + 3], m, v);
      this.gMixing(4, 12, 20, 28, this.SIGMA82[i * 16 + 4], this.SIGMA82[i * 16 + 5], m, v);
      this.gMixing(6, 14, 22, 30, this.SIGMA82[i * 16 + 6], this.SIGMA82[i * 16 + 7], m, v);
      this.gMixing(0, 10, 20, 30, this.SIGMA82[i * 16 + 8], this.SIGMA82[i * 16 + 9], m, v);
      this.gMixing(2, 12, 22, 24, this.SIGMA82[i * 16 + 10], this.SIGMA82[i * 16 + 11], m, v);
      this.gMixing(4, 14, 16, 26, this.SIGMA82[i * 16 + 12], this.SIGMA82[i * 16 + 13], m, v);
      this.gMixing(6, 8, 18, 28, this.SIGMA82[i * 16 + 14], this.SIGMA82[i * 16 + 15], m, v);
    }

    for (i = 0; i < 16; i++) {
      ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16]
    }
  }
}
