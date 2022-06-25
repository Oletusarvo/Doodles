import Order from './order';

class Orderqueue{
    private items : Order[];

    constructor(){
        this.items = [];
    }

    private validate(order : Order) : boolean{
        if(this.items.length == 0){
            return true;
        }

        const queuePrice = this.items[this.items.length - 1].price;
        return order.price == queuePrice;
    }

    public calculateShareSize() : number{
        let total = 0;
        this.items.forEach(item => total += item.size);
        return total;
    }

    public getPrice() : number{
        return this.items[0].price;
    }

    public push(order : Order) : boolean{
        if(!this.validate(order)){
            return false;
        }

        this.items.push(order);
        return true;
    }

    public pop() : Order | undefined{
        return this.items.shift();
    }

    public front() : Order{
        return this.items[0];
    }

    public reduce(amount : number){
        let f = this.front();
        f.size -= amount;

        if(f.size == 0){
            this.pop();
        }
    }

    public cancel(orderId : string){
       const index = this.items.findIndex(item => item.id === orderId);
       if(index != -1){
           this.items.splice(index, index + 1);
       }
    }
}

export = Orderqueue;