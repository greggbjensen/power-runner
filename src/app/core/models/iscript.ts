import { IScriptFile } from './iscript-file';
import { IScriptParam } from './iscript-param';
import { ScriptStatus } from './script-status.enum';

export interface IScript extends IScriptFile {
  hash: string;
  params: IScriptParam[];
  status: ScriptStatus;
}
