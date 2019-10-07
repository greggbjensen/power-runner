import { ParamType } from './param-type.enum';

export interface IScriptParam {
  name: string;
  type: ParamType;
  value: any;
}
