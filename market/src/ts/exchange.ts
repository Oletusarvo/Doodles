import Orderbook from './orderbook';
import Order from './order';
import Orderqueue from './orderqueue';
import Transaction from './transaction';
import Constants from './constants';

const BUY = Constants.OrderSide.BUY;
const CVR = Constants.OrderSide.CVR;

const SEL = Constants.OrderSide.SEL;
const SHT = Constants.OrderSide.SHT;

class Exchange{
    private name : string;
    private pendingOrders : Order[];
    private transactions : Transaction[];
    private orderbooks : Map<string, Orderbook>;

    constructor(name : string){
        this.name = name;
        this.pendingOrders = [];
        this.transactions = [];
        this.orderbooks = new Map<string, Orderbook>();
    }

    private transact(order : Order, queue : Orderqueue){

        const otherOrder = queue.front();

        let tx = new Transaction(order.symbol);
        tx.side = order.side == BUY || order.side == CVR ? BUY : SEL;
        tx.price = otherOrder.price
        tx.buyer = (order.side == Constants.OrderSide.BUY || order.side == Constants.OrderSide.CVR) ? order.accountId : otherOrder.accountId;
        tx.seller = (order.side == Constants.OrderSide.SEL || order.side == Constants.OrderSide.SHT) ? order.accountId : otherOrder.accountId;
    
        const otherOrderSize = otherOrder.size;

        if(order.size > otherOrderSize){
            order.size -= otherOrderSize;
            queue.reduce(otherOrderSize);

            tx.size = otherOrderSize;
        }
        else if(otherOrderSize > order.size){
            queue.reduce(order.size);

            tx.size = order.size;

            order.size = 0;
        }
        else{
            tx.size = order.size;
            queue.reduce(order.size);
            order.size = 0;
        }

        this.transactions.push(tx);
    }

    private executeBuyMKT(order : Order){
        const ob = this.orderbooks.get(order.symbol);
        if(ob){
            let seller : Orderqueue | undefined = ob.bestAsk();
            
            while(seller && order.size > 0){
                this.transact(order, seller);
                ob.flush();
                seller = ob.bestAsk();
            }
        }
    }

    private executeSellMKT(order : Order){
        const ob = this.orderbooks.get(order.symbol);
        if(ob){
            let buyer : Orderqueue | undefined = ob.bestBid();
            
            while(buyer && order.size > 0){
                this.transact(order, buyer);
                ob.flush();
                buyer = ob.bestBid();
            }
        }
    }

    private executeBuyLMT(order : Order){
        
        const ob = this.orderbooks.get(order.symbol);
        if(ob){
            let seller : Orderqueue | undefined = ob.bestAsk();
            while(seller && seller.front().price <= order.price && order.size > 0){
                this.transact(order, seller);
                ob.flush();
                seller = ob.bestBid();
            }
        }
    }

    private executeSellLMT(order : Order){
        
        const ob = this.orderbooks.get(order.symbol);
        if(ob){
            let buyer : Orderqueue | undefined = ob.bestBid();
            while(buyer && buyer.front().price >= order.price && order.size > 0){
                this.transact(order, buyer);
                ob.flush();
                buyer = ob.bestAsk();
            }
        }
    }

    private executeBuyOrder(order : Order){
        switch(order.type){
            case Constants.OrderType.MKT:
                this.executeBuyMKT(order);
            break;

            case Constants.OrderType.LMT:
                this.executeBuyLMT(order);
            break;
        }
    }

    private executeSellOrder(order : Order){
        switch(order.type){
            case Constants.OrderType.MKT:
                this.executeSellMKT(order);
            break;

            case Constants.OrderType.LMT:
                this.executeSellLMT(order);
            break;
        }
    }

    public getName(){
        return this.name;
    }

    public addOrderbook(symbol : string) : boolean{
        if(this.orderbooks.get(symbol)){
            return false;
        }

        this.orderbooks.set(symbol, new Orderbook(symbol));
        return true;
    }

    public getOrderbook(symbol : string){
        return this.orderbooks.get(symbol);
    }

    public getLatestTransaction() : Transaction{
        return this.transactions[this.transactions.length - 1];
    }

    public execute(order : Order){
        switch(order.side){
            case Constants.OrderSide.BUY:
            case Constants.OrderSide.CVR:
                this.executeBuyOrder(order);
            break;

            case Constants.OrderSide.SEL:
            case Constants.OrderSide.SHT:
                this.executeSellOrder(order);
            break;
        }

        if(order.type == Constants.OrderType.LMT && order.size > 0){
            const ob = this.orderbooks.get(order.symbol);
            if(ob){
                ob.addOrder(order);
            }
        }
    }

    public cancel(symbol : string, id : string){
        const ob = this.orderbooks.get(symbol);
        if(ob){
            ob.cancel(id);
        }
    }

    public validate(order : Order) : number{
        //Asumes a broker has already done its own validation.

        const ob = this.getOrderbook(order.symbol);
        if(!ob){
            return Constants.ExchangeError.INVALID_SYMBOL;
        }

        return 0;
    }
}

export = Exchange;