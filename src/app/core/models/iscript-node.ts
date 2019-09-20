import { IScript } from './iscript';

export interface IScriptNode {
  name: string;
  children?: IScriptNode[];
  script?: IScript;
}
