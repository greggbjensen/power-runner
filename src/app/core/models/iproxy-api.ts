export interface IProxyApi {
  send(channel: string, ...data: any[]): void;
  receive(channel: string, handler: (...data: any[]) => void): void;
}
