export  interface TX {
    blockNumber: number;
    blockHash: string;
    transactionIndex: number;
    removed: boolean;
    address: string;
    data: string;
    topics: string[];
    transactionHash: string;
    logIndex: number;
  }
   export enum WinningType {
    GRANDPRICE,//0
    OVERUNDERDRAW,//1
    MATCHDRAW5,//2
    MATCHDRAW4,//3
    MATCHDRAW3,//4
    NONE//5
   }

  export type UserWinningAllocation = {
    winner:string,
    WinningType:WinningType,
  
  }

  export enum OUTypes{
    Over,
    Under
  }
