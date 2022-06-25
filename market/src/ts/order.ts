import uniqid from 'uniqid';

class Order{
    public symbol : string;
    public route : string;
    public price : number;
    public size : number;
    public side : number;
    public type : number;
    public id : string;
    public accountId : number;

    constructor(accountId : number, symbol : string = '', route : string = '', price : number = -1, size : number = -1, side : number = -1, type : number = -1){
        this.symbol = symbol;
        this.route = route;
        this.price = price;
        this.size = size;
        this.side = side;
        this.type = type;
        this.id = uniqid();
        this.accountId = accountId;
    }
}

export = Order;