export class Blake2bContext {
  readonly b: Uint8Array= new Uint8Array(128);
  readonly h: Uint32Array= new Uint32Array(16);
  public t: number = 0;
  public c: number = 0;

  constructor(public length: number) {
  }
}
