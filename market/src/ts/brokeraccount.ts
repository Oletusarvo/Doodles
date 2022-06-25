import Position from './position';
import Order from './order';

class BrokerAccount{
    private pendingOrders : Order[];
    private openPositions : Map<string, Position>;
    private closedPositions : Map<string, any>;
    private balance : number;
    private id : number;

    constructor(id ? :number){
        this.pendingOrders = [];
        this.openPositions = new Map<string, Position>();
        this.closedPositions = new Map<string, Position>();
        this.balance = 0;
        this.id = id != undefined ? id : BrokerAccount.generateId();
    }

    private static generateId() : number{
        return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    public updatePosition(symbol : string, price : number, size : number) : boolean{
        const pos = this.openPositions.get(symbol);

        if(!pos){
            return false;
        }

        pos.update(price, size);
        return true;
    }

    public addPosition(symbol : string, price : number, size : number, side : number){
        const pos = this.openPositions.get(symbol);

        if(pos){
            pos.update(price, size);
        }
        else{
            const pos = new Position(symbol, side, this.id).update(price, size);
            this.openPositions.set(symbol, pos);
        }
    }

    public addPendingOrder(order : Order){
        this.pendingOrders.push(order);
    }

    public removePendingOrder(id : string){
        const index = this.pendingOrders.findIndex(order => order.id === id);
        if(index != -1){
            this.pendingOrders.splice(index, index + 1);
        }
    }

    public getPosition(symbol : string) : Position | undefined{
        return this.openPositions.get(symbol)
    }

    public getPendingOrders() : Order[]{
        return this.pendingOrders;
    }

    public closePosition(symbol : string) : boolean{
        const pos = this.openPositions.get(symbol);
        if(pos){
            this.closedPositions.set(pos.getSymbol(), pos);
            this.openPositions.delete(symbol);
        }
        else{
            return false;
        }

        return true;
    }

    public getOpenEquity() : number{
        let total = 0;
        this.openPositions.forEach(pos => total += pos.calculateEquity());
        return total;
    }

    public getAvailableEquity() : number{
        return this.balance - this.getOpenEquity();
    }

    public getId() : number{
        return this.id;
    }

    public deposit(amount : number){
        this.balance += amount;
    }
}

export = BrokerAccount;