// Polyfill DOMMatrix for Node.js environment
if (typeof global !== 'undefined' && typeof DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    constructor(init?: string | number[]) {
      if (init) {
        if (typeof init === 'string') {
          const values = init.split(',').map(Number);
          this.m11 = values[0] || 1;
          this.m12 = values[1] || 0;
          this.m13 = values[2] || 0;
          this.m14 = values[3] || 0;
          this.m21 = values[4] || 0;
          this.m22 = values[5] || 1;
          this.m23 = values[6] || 0;
          this.m24 = values[7] || 0;
          this.m31 = values[8] || 0;
          this.m32 = values[9] || 0;
          this.m33 = values[10] || 1;
          this.m34 = values[11] || 0;
          this.m41 = values[12] || 0;
          this.m42 = values[13] || 0;
          this.m43 = values[14] || 0;
          this.m44 = values[15] || 1;
        } else {
          this.m11 = init[0] || 1;
          this.m12 = init[1] || 0;
          this.m13 = init[2] || 0;
          this.m14 = init[3] || 0;
          this.m21 = init[4] || 0;
          this.m22 = init[5] || 1;
          this.m23 = init[6] || 0;
          this.m24 = init[7] || 0;
          this.m31 = init[8] || 0;
          this.m32 = init[9] || 0;
          this.m33 = init[10] || 1;
          this.m34 = init[11] || 0;
          this.m41 = init[12] || 0;
          this.m42 = init[13] || 0;
          this.m43 = init[14] || 0;
          this.m44 = init[15] || 1;
        }
      } else {
        this.m11 = 1;
        this.m12 = 0;
        this.m13 = 0;
        this.m14 = 0;
        this.m21 = 0;
        this.m22 = 1;
        this.m23 = 0;
        this.m24 = 0;
        this.m31 = 0;
        this.m32 = 0;
        this.m33 = 1;
        this.m34 = 0;
        this.m41 = 0;
        this.m42 = 0;
        this.m43 = 0;
        this.m44 = 1;
      }
    }
    m11: number;
    m12: number;
    m13: number;
    m14: number;
    m21: number;
    m22: number;
    m23: number;
    m24: number;
    m31: number;
    m32: number;
    m33: number;
    m34: number;
    m41: number;
    m42: number;
    m43: number;
    m44: number;
  };
} 