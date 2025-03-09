export function fetchBinary(url: any): Promise<Uint8Array<ArrayBuffer>>;
export function serialize(x: any): Uint8Array<any>;
export function deserializeToString(bs: any): string;
export class AnomaClient {
    constructor(grpcServer: any);
    grpcServer: any;
    listUnspentResources(): Promise<any>;
    filterKind(kind: any): Promise<any>;
    prove(program: any, args: any): Promise<any>;
    addTransaction(transaction: any): Promise<any>;
    #private;
}
