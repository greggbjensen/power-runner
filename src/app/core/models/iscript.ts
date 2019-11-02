import { IScriptParam } from './iscript-param';

export interface IScript {
  id: string;
  module: string;
  name: string;
  directory: string;
  params: IScriptParam[];
}
