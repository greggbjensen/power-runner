import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Md5 } from 'ts-md5/dist/md5';
import * as XRegExp from 'xregexp';
import { IScript, IScriptParam, ParamType, ScriptStatus } from '../../app/core/models';

export class ScriptParser {

  private static readonly AttributesParamRegex = /^\s*(?:\[?(.*)\])?\s*\$([\w]+)\s*(?:=(.+)\s*)?/is;
  private static readonly CommentsRegex = /#.*?(\r?\n|$)/g;
  private static readonly ParamSeparatorRetgex = /,\s*\[/g;

  private static readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public async parseScript(filePath: string): Promise<IScript> {

    const content = await ScriptParser.readFile(filePath);

    // SourceRef: https://stackoverflow.com/questions/546433/regular-expression-to-match-balanced-parentheses
    let scriptParams: IScriptParam[];
    try {
      const match = XRegExp.matchRecursive(content, '\\(', '\\)');
      if (match && match[0]) {
        let paramText = match[0].trim();
        paramText = paramText.replace(ScriptParser.CommentsRegex, '');  // Trim out comments.
        const paramList = paramText.split(ScriptParser.ParamSeparatorRetgex);

        scriptParams = paramList.map(i => this.parseParam(i)).filter(p => !!p);
      } else {
        scriptParams = [];
      }
    } catch (err) {
      console.error(err);
      scriptParams = [];
    }

    let directory = path.dirname(filePath);
    if (os.platform() === 'win32') {
      directory = directory.replace(/\//g, '\\');
    }

    const name = path.basename(filePath);
    const id = `${directory.replace(/\//g, '_')}_${name}`;
    const script: IScript = {
      id,
      directory,
      module: path.basename(directory),
      name,
      params: scriptParams,
      status: ScriptStatus.Stopped
    };

    return script;
  }

  private parseParam(paramLine: string): IScriptParam {
    let param: IScriptParam = null;

    const match = ScriptParser.AttributesParamRegex.exec(paramLine);
    if (match) {
      const attributes = match[1];
      const name = match[2];
      let value: any = match[3];

      param = {
        name,
        type: ParamType.String,
      } as IScriptParam;

      if (attributes) {
        const attributesList = attributes.replace('[', '').split(']');
        attributesList.forEach(a => {
          if (a.includes('(')) {
            this.applyAttribute(param, a);
          } else {
            this.setParamType(param, a);
          }
        });
      }

      if (value) {
        value = value.trim().replace(/^['"]/, '').replace(/['"]$/, '');
      }

      const defaultValue = this.normalizeValue(param, value);
      param.default = defaultValue;
      param.value = defaultValue;
    }

    return param;
  }

  private normalizeValue(param: IScriptParam, value: any): any {
    let result = value;

    if (result && result.toLowerCase() === '$null') {
      result = null;
    }

    switch (param.type) {
      case ParamType.Switch:
      case ParamType.Boolean:
        result = value.toLowerCase() === '$true';
        break;

      default:
        break;
    }

    return result || '';
  }

  private setParamType(param: IScriptParam, attribute: string): void {
    switch (attribute.toLowerCase()) {
      case 'string':
        param.type = ParamType.String;
        break;

      case 'securestring':
        param.type = ParamType.SecureString;
        break;

      case 'switch':
        param.type = ParamType.Switch;
        break;

      case 'bool':
        param.type = ParamType.Boolean;
        break;

      case 'validateset':
        param.type = ParamType.Set;
        break;
    }
  }

  private applyAttribute(param: IScriptParam, attribute: string): void {
    const parts = attribute.split(/[()]/);
    const type = parts[0].toLowerCase();
    const params = parts[1].split(',');

    switch (type) {
      case 'validateset':
        const set = params.map(p => p.replace(/^\s*["']/, '').replace(/["']\s*$/, ''));
        param.type = ParamType.Set;

        if (!param.validation) {
          param.validation = { };
        }

        param.validation = param.validation.set = set;
        break;

      case 'parameter':

        const paramMap = { } as any;
        params.map(p => {
          const keyValue = p.split('=');
          if (parts.length > 1) {
            let value: any = keyValue[1].trim();
            const lowerValuue = value.toLowerCase();
            if (lowerValuue === '$true') {
              value = true;
            } else if (lowerValuue === '$false') {
              value = false;
            }

            paramMap[keyValue[0].trim()] = value;
          }
        });

        if (paramMap.Mandatory) {
          if (!param.validation) {
            param.validation = { };
          }

          param.validation = { required: true };
        }

        break;

      default:
        break;
    }
  }
}
