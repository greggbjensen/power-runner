export class NodeProxy {

    private _proxies = new Map<string, (...args: any[]) => Promise<any>>();

    public add(functionName: string, call: (...args: any[]) => Promise<any>): void {
        this._proxies.set(functionName, call);
    }

    public async invoke(functionName: string, ...args: any[]): Promise<any> {
        return this._proxies.get(functionName)(...args);
    }
}
