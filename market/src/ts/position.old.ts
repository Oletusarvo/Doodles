import Constants from './constants';

class Position{
    private bookmarks : any[];

    private sizeIn : number;
    private sizeOut : number;
    private avgPriceIn : number;
    private avgPriceOut : number;

    private side : number;
    private ownerId : number;
    private symbol : string;
    private reservedForBorrow : boolean;
    private borrowOptions : {};
    
    constructor(symbol : string, price : number, size : number, side : number, ownerId : number = -1){
        this.bookmarks = [{price, size}];
        this.side = side;
        this.symbol = symbol;

        this.sizeIn = size;
        this.sizeOut = 0;
        this.avgPriceIn = price;
        this.avgPriceOut = 0;

        this.reservedForBorrow = false;
        this.ownerId = ownerId;
        this.borrowOptions = {fee : 0};
    }

    public getSide() : number{
        return this.side;
    }

    public getBookmarks() : any[]{
        return this.bookmarks;
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

    public calculateSizeOut() : number{
        let total = 0;
        let bookmarks = this.bookmarks.filter(bookmark => bookmark.size < 0);
        bookmarks.forEach(bookmark => total += bookmark.size);
        return -total;
    }

    public calculateSizeIn() : number{
        let total = 0;
        let bookmarks = this.bookmarks.filter(bookmark => bookmark.size > 0);
        bookmarks.forEach(bookmark => total += bookmark.size);
        return total;
    }

    public calculateSize() : number{
        return this.sizeIn - this.sizeOut;
    }

    public add(size : number, price : number){
        const addedEquity = size * price;
        const previousEquity = this.avgPriceIn * this.sizeIn;
        const currentEquity = addedEquity + previousEquity;

        this.sizeIn += size;
        this.avgPriceIn = currentEquity / this.sizeIn;

    }

    public remove(size : number, price : number){
        
    }

    public calculateCurrentSize() : number{
        let total = 0;
        this.bookmarks.forEach(bookmark => total += bookmark.size);
        return total;
    }

    public calculateAveragePriceOut() : number{
        let totalEquity = 0;
        let totalSize = 0;
        let bookmarks = this.bookmarks.filter(bookmark => bookmark.size < 0);
        
        for(let bookmark of bookmarks){
            totalEquity += bookmark.price * bookmark.size;
            totalSize += bookmark.size;
        }

        return totalEquity / totalSize;
    }

    public calculateAveragePriceIn() : number{
        let totalEquity = 0;
        let totalSize = 0;
        let bookmarks = this.bookmarks.filter(bookmark => bookmark.size > 0);
        
        for(let bookmark of bookmarks){
            totalEquity += bookmark.price * bookmark.size;
            totalSize += bookmark.size;
        }

        return totalEquity / totalSize;
    }

    public calculateEquity() : number{
        return this.calculateSize() * this.avgPriceIn;
    }

    public calculateGain(currentSharePrice : number) : number{
        const avgPriceIn = this.calculateAveragePriceIn();
        const gain = this.side == Constants.OrderSide.BUY ? ((currentSharePrice - avgPriceIn) / avgPriceIn) : ((avgPriceIn - currentSharePrice) / avgPriceIn);
        return gain;
    }

    public calculateUnrealized(currentSharePrice : number) : number{
        const avgPriceIn = this.calculateAveragePriceIn();
        const size = this.calculateCurrentSize();
        const difference = this.side == Constants.OrderSide.BUY ? (currentSharePrice - avgPriceIn) : (avgPriceIn - currentSharePrice);
        return difference * size;
    }

    public calculateRealized() : number{
        const avgPriceIn = this.calculateAveragePriceIn();
        const avgPriceOut = this.calculateAveragePriceOut();
        const size = this.calculateSizeOut();
        const difference = this.side == Constants.OrderSide.BUY ? (avgPriceOut - avgPriceIn) : (avgPriceIn - avgPriceOut);
        return difference * size;
    }

    public isClosed() : boolean{
        return this.calculateCurrentSize() == 0;
    }

    public consolidate() : any{
        const avgPriceIn = this.calculateAveragePriceIn();
        const avgPriceOut = this.calculateAveragePriceOut();
        const sizeIn = this.calculateSizeIn();
        const sizeOut = this.calculateSizeOut();
        const realized = this.calculateRealized();
        const symbol = this.symbol;
        const side = this.side == Constants.OrderSide.BUY ? 'BUY' : 'SEL';
        const gain = side == 'BUY' ? (avgPriceOut - avgPriceIn) / avgPriceIn : (avgPriceIn - avgPriceOut) / avgPriceIn;

        return {
            symbol,
            side,
            sizeIn,
            sizeOut, 
            avgPriceIn, 
            avgPriceOut, 
            realized,
            gain
        }
    }

    public setReservedForBorrow(state : boolean){
        this.reservedForBorrow = state;
    }

    public isReservedForBorrow() : boolean{
        return this.reservedForBorrow;
    }

    public update(price : number, size : number){
        this.bookmarks.push({price, size});
    } 
}

export = Position;