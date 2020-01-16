import { IScriptParam } from './iscript-param';
import { ScriptStatus } from './script-status.enum';

export interface IScript {
  id: string;
  module: string;
  name: string;
  directory: string;
  params: IScriptParam[];
  status: ScriptStatus;
}
