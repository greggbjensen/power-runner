import { IScript } from './iscript';
import { IScriptParams } from './iscript-params';

export interface IScriptRun {
  script: IScript;
  params: IScriptParams;
}
