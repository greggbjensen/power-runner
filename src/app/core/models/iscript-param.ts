import { ParamType } from './param-type.enum';

export interface IScriptParam {
  name: string;
  type: ParamType;
  default: any;
  value: any;
  validation?: any;
}
