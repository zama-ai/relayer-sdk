import type { TKMSType, TKMSTypeShape } from '@sdk/types/public-api';
import * as TFHEPkg from './node-tfhe-mock';
import * as TKMSPkg from './node-tkms-mock';

global.TFHE = TFHEPkg;
global.TKMS = TKMSPkg as TKMSTypeShape as unknown as TKMSType;
