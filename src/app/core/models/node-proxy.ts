export class NodeProxy {

    private _proxies = new Map<string, (...args: any[]) => Promise<any>>();

    public add(functionName: string, call: (...args: any[]) => Promise<any>): void {
        this._proxies.set(functionName, call);
    }

    public has(functionName: string): boolean {
      return this._proxies.has(functionName);
    }

    public async invoke(functionName: string, ...args: any[]): Promise<any> {
      const proxy = this._proxies.get(functionName);
      if (!proxy) {
        throw new Error(`No proxy has been created for ${functionName}`);
      }

      return this._proxies.get(functionName)(...args);
    }
}
