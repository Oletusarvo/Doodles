import Constants from './constants';

class Position{
    private history : any[];

    private sizeIn : number;
    private sizeOut : number;
    private avgPriceIn : number;
    private avgPriceOut : number;

    private side : number;
    private ownerId : number;
    private symbol : string;
    private reservedForBorrow : boolean;
    private borrowOptions : {};
    
    constructor(symbol : string, side : number, ownerId : number = -1){
        this.history = [];
        this.side = side;
        this.symbol = symbol;

        this.sizeIn = 0;
        this.sizeOut = 0;
        this.avgPriceIn = 0;
        this.avgPriceOut = 0;

        this.reservedForBorrow = false;
        this.ownerId = ownerId;
        this.borrowOptions = {fee : 0};
    }

    public getSide() : number{
        return this.side;
    }

    public getHistory() : any[]{
        return this.history;
    }

    public getSymbol() : string{
        return this.symbol;
    }

    public getOwnerId() : number{
        return this.ownerId;
    }

    public getBorrowOptions() : any{
        return this.borrowOptions;
    }

    public setBorrowOptions(options : any){
        this.borrowOptions = options;
    }

    public calculateSize() : number{
        return this.sizeIn - this.sizeOut;
    }

    public isClosed() : boolean{
        return this.sizeOut == this.sizeIn;
    }

    public calculateEquity() : number{
        return this.calculateSize() * this.avgPriceIn;
    }

    public calculateGain(price : number) : number{
        if(this.side == Constants.OrderSide.BUY){
            return (price - this.avgPriceIn) / this.avgPriceIn;
        }
        
        return (this.avgPriceIn - price) / this.avgPriceIn;
    }

    public setReservedForBorrow(state : boolean){
        this.reservedForBorrow = state;
    }

    public isReservedForBorrow() : boolean{
        return this.reservedForBorrow;
    }

    public update(price : number, size : number){
        if(size < 0){
            this.remove(-size, price);
        }
        else{
            this.add(size, price)
        }

        this.updateHistory(price, size);
        return this;
    }

    private updateHistory(price : number, size : number){
        this.history.push({price, size});
    } 

    private add(size : number, price : number){
        this.avgPriceIn = ((this.avgPriceIn * this.sizeIn) + (size * price)) / (this.sizeIn += size);
    }

    private remove(size : number, price : number){
        this.avgPriceOut = ((this.avgPriceOut * this.sizeOut) + (size * price)) / (this.sizeOut += size);
    }
}

export = Position;