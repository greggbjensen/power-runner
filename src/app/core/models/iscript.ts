import { IScriptParam } from './iscript-param';

export interface IScript {
    module: string;
    name: string;
    directory: string;
    params: IScriptParam[];
}
