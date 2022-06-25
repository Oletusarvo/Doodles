import Orderqueue from './orderqueue';
import Order from './order';
import Constants from './constants';
import Transaction from './transaction';

class Orderbook {
    private symbol : string = "";
    private precision : number; //Decimal precision of listed prices.
    private open : number;
    private low : number;
    private high : number;
    private last : number;
    private ask : Map<number, Orderqueue>;
    private bid : Map<number, Orderqueue>;

    constructor(symbol : string){
        this.symbol = symbol;
        this.precision = 2;
        this.ask = new Map<number, Orderqueue>();
        this.bid = new Map<number, Orderqueue>();

        this.open = this.low = this.high = this.last = NaN;
    }

    private validate(order : Order) : boolean{
        if(order.symbol != this.symbol){
            return false;
        }

        return true;
    }

    private addBuyOrder(order : Order){
        const queue = this.bid.get(order.price);

        if(queue){
            queue.push(order);
        }
        else{
            this.bid.set(order.price, new Orderqueue());
            this.addBuyOrder(order);
        }
    }

    private addSellOrder(order : Order){
        const queue = this.ask.get(order.price);

        if(queue){
            queue.push(order);
        }
        else{
            this.ask.set(order.price, new Orderqueue());
            this.addSellOrder(order);
        }
    }

    public getSymbol() : string{
        return this.symbol;
    }

    public addOrder(order : Order) : boolean{

        if(!this.validate(order)){
            return false;
        }

        switch(order.side){
            case Constants.OrderSide.BUY:
            case Constants.OrderSide.CVR:
                this.addBuyOrder(order);
            break;

            case Constants.OrderSide.SEL:
            case Constants.OrderSide.SHT:
                this.addSellOrder(order);
            break;

            default:
                throw new Error('Invalid order side!');
        }

        return true;
    }

    public update(newTransaction : Transaction){
        this.low = isNaN(this.low) || newTransaction.price < this.low ? newTransaction.price : this.low;
        this.high = isNaN(this.high) || newTransaction.price > this.high ? newTransaction.price : this.high;
        this.open = isNaN(this.open) ? newTransaction.price : this.open;
        this.last = isNaN(this.last) ? newTransaction.price : this.last;
    }

    public getOpen() : number{
        return this.open;
    }

    public getLast() : number{
        return this.last;
    }

    public getLow() : number{
        return this.low;
    }

    public getHigh() : number{
        return this.high;
    }

    public bestBid() : Orderqueue | undefined{
        let best = 0;
        for(let key of this.bid.keys()){
            let queue = this.bid.get(key);

            if(queue && queue.calculateShareSize() > 0){
                const price = queue.getPrice();
                best = price > best ? price : best;
            }
        }
        return this.bid.get(best);
    }

    public bestAsk() : Orderqueue | undefined{
        let best = Number.MAX_VALUE;

        for(let key of this.ask.keys()){
            let queue = this.ask.get(key);

            if(queue && queue.calculateShareSize() > 0){
                const price = queue.getPrice();
                best = price < best ? price : best;
            }
        }

        return this.ask.get(best);
    }

    public cancel(id : string){
        this.bid.forEach(queue => {
            queue.cancel(id);
        });

        this.ask.forEach(queue => {
            queue.cancel(id);
        });
    }

    public flush() : void{

        for(let key of this.bid.keys()){
            const queue = this.bid.get(key);
            
            if(queue?.calculateShareSize() == 0){
                this.bid.delete(key);
            }
        }

        for(let key of this.ask.keys()){
            const queue = this.bid.get(key);
            
            if(queue?.calculateShareSize() == 0){
                this.ask.delete(key);
            }
        }
    }
}

export = Orderbook;