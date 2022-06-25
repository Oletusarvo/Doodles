import Order from './order';
import Constants from './constants';
import BrokerAccount from './brokeraccount';
import Transaction from './transaction';
import Position from './position';

class Broker{

    private accounts : Map<number, BrokerAccount>;
    private name : string;

    constructor(name = 'default'){
        this.accounts = new Map<number, BrokerAccount>();
        this.name = name;
    }

    public addAccount(id ? : number) : number{
        const acc = new BrokerAccount(id);
        this.accounts.set(acc.getId(), acc);
        return acc.getId();
    }

    public addPendingOrder(order : Order){
        const acc = this.accounts.get(order.accountId);
        
        if(acc){
            acc.addPendingOrder(order);
        }
    }

    public getAccount(id : number) : BrokerAccount | undefined{
        return this.accounts.get(id);
    }

    public processTransaction(tx : Transaction){

        const buyer = this.accounts.get(tx.buyer);
        const seller = this.accounts.get(tx.seller);

        if(buyer){
            const pos = buyer.getPosition(tx.symbol);

            if(pos){
                if(pos.getSide() == Constants.OrderSide.BUY){
                    //Adding to an existing long position.
                    pos.update(tx.price, tx.size);
                }
                else{
                    //Covering a short position.
                    pos.update(tx.price, -tx.size);

                    if(pos.isClosed()){
                        buyer.closePosition(pos.getSymbol());
                    }
                }
            }
            else{
                //Buyer does not have any position.
                buyer.addPosition(tx.symbol, tx.price, tx.size, Constants.OrderSide.BUY);
            }
        }

        if(seller){
            const pos = seller.getPosition(tx.symbol);

            if(pos){
                if(pos.getSide() == Constants.OrderSide.SHT){
                    //Adding to an existing short position.
                    pos.update(tx.price, tx.size);
                }
                else{
                    //Selling a long position.
                    pos.update(tx.price, -tx.size);

                    if(pos.isClosed()){
                        seller.closePosition(pos.getSymbol());
                    }
                }
            }
            else{
                //Seller has no position and thus is shorting.
                seller.addPosition(tx.symbol, tx.price, tx.size, Constants.OrderSide.SHT);
            }
        }
    }

    public validate(order : Order) : number{

        if(typeof(order.accountId) !== 'number'){
            return Constants.BrokerError.INVALID_ID;
        }

        if(typeof(order.symbol) !== 'string'){
            return Constants.BrokerError.INVALID_SYMBOL;
        }

        if(typeof(order.route) !== 'string'){
            return Constants.BrokerError.INVALID_ROUTE;
        }

        if(typeof(order.price) !== 'number' || order.price <= 0){
            return Constants.BrokerError.INVALID_PRICE;
        }

        if(typeof(order.size) !== 'number' || order.size <= 0){
            return Constants.BrokerError.INVALID_SIZE;
        }

        if(typeof(order.side) !== 'number' || order.side > Constants.OrderSide.SHT || order.side < Constants.OrderSide.BUY){
            return Constants.BrokerError.INVALID_SIDE;
        }

        if(typeof(order.type) !== 'number' || order.type < Constants.OrderType.MKT || order.type > Constants.OrderType.LMT){
            return Constants.BrokerError.INVALID_TYPE;
        }

        const acc = this.accounts.get(order.accountId);

        if(!acc){
            return Constants.BrokerError.INVALID_ACCOUNT;
        }
        else{
            const pos = acc.getPosition(order.symbol);

            if(pos){
                if(pos.getSide() == Constants.OrderSide.BUY){
                    if(order.side == Constants.OrderSide.SEL){
                        const posSize = pos.calculateSize();

                        if(pos.isReservedForBorrow()){
                            return Constants.BrokerError.MARKED_FOR_BORROW;
                        }

                        if(order.size > posSize){
                            return Constants.BrokerError.SELL_OVERFLOW;
                        }
                    }

                    if(order.side == Constants.OrderSide.BUY){
                        const availableEquity = acc.getAvailableEquity();
                        const orderEquity = order.price * order.size;
                        if(orderEquity > availableEquity){
                            return Constants.BrokerError.EQUITY_OVERFLOW;
                        }
                    }

                    if(order.side == Constants.OrderSide.SHT){
                        return Constants.BrokerError.SHORT_LONG;
                    }

                    if(order.side == Constants.OrderSide.CVR){
                        return Constants.BrokerError.COVER_LONG;
                    }
                }

                if(pos.getSide() == Constants.OrderSide.SHT){
                    if(order.side == Constants.OrderSide.CVR){
                        const posSize = pos.calculateSize();
                        if(order.size > posSize){
                            return Constants.BrokerError.COVER_OVERFLOW;
                        }
                    }

                    if(order.side == Constants.OrderSide.SHT){
                        const availableEquity = acc.getAvailableEquity();
                        const orderEquity = order.price * order.size;

                        if(orderEquity > availableEquity){
                            return Constants.BrokerError.EQUITY_OVERFLOW;
                        }
                    }

                    if(order.side == Constants.OrderSide.SEL){
                        return Constants.BrokerError.SELL_SHORT;
                    }

                    if(order.side == Constants.OrderSide.BUY){
                        return Constants.BrokerError.BUY_SHORT;
                    }
                }
            }
            else{
                if(order.side == Constants.OrderSide.SEL || order.side == Constants.OrderSide.CVR){
                    return Constants.BrokerError.NO_POSITION;
                }
            }
        }

        return 0;
    }

    shortLocate(symbol : string, numShares : number) : Position | null{
        this.accounts.forEach(acc => {
            const pos = acc.getPosition(symbol);
            if(pos != undefined && pos.isReservedForBorrow() && pos.calculateSize() == numShares){
                return pos;
            }
        });

        return null;
    }
}

export = Broker;