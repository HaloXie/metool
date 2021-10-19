// eslint-disable-next-line @typescript-eslint/no-unused-vars
import camelcaseKeys from 'camelcase-keys';
// TO-DO: remove this file
declare module 'express-serve-static-core' {
  export interface Request {
    email?: string;
    postOps?: { fn: Function; args: unknown[] }[];
  }
}
