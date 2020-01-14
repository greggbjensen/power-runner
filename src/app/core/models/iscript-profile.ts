import { SaveAsType } from './save-as-type.enum';

export interface IScriptProfile {
  name: string;
  params: { [name: string]: any };
}
