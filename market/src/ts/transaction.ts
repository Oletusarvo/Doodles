class Transaction{
    public buyer : number = -1;
    public seller : number = -1;
    public price : number = -1;
    public size : number = -1;
    public side : number;
    public timestamp : string;
    public symbol : string;

    constructor(symbol : string, buyer : number = -1, seller : number = -1, price : number = -1, size : number = -1, side : number = -1){
        this.buyer = buyer;
        this.seller = seller;
        this.price = price;
        this.size = size;
        this.side = side;
        this.symbol = symbol;
        this.timestamp = new Date().toString();
    }
}

export = Transaction;