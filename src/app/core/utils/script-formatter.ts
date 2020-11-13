import { IScriptParam, ParamType } from '../models';

export class ScriptFormatter {

  public static formatParam(param: IScriptParam): string {
    let paramText = '';

    if (param.value !== '' && param.value !== param.default) {
      switch (param.type) {

        case ParamType.Switch:
          if (param.value) {
            paramText = `-${param.name}`;
          }
          break;

        case ParamType.Boolean:
          paramText = `-${param.name} $${param.value}`;
          break;

        case ParamType.Number:
          paramText = `-${param.name} ${param.value}`;
          break;

        case ParamType.SecureString:
          paramText = `-${param.name} (ConvertTo-SecureString ${param.value} -AsPlainText -Force)`;
          break;

        default: // ParamType.String, ParamType.File, ParamType.Directory
          paramText = `-${param.name} '${param.value.replace('\'', '\'\'')}'`;
          break;
      }
    }

    return paramText;
  }
}
