const Market = require('../market.js');

describe('Converting json into objects', () => {
    test('Converting into exchange', () => {
        const ex = new Market.Exchange('DEF');
        ex.execute(new Market.Order(1, 'def', 'def', 1, 11, Market.Constants.OrderSide.BUY, Market.Constants.OrderType.LMT));
        const str = JSON.stringify(ex, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(ex);
    });

    test('Converting into order', () => {
        const ord = new Market.Order(0, 'def', 'def', 1, 100, Market.Constants.OrderSide.BUY, Market.Constants.OrderType.LMT);
        const str = JSON.stringify(ord, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(ord);
    });

    test('Converting into orderqueue', () => {
        const q = new Market.Orderqueue();
        for(let i = 0; i < 10; ++i){
            q.push(new Market.Order(0));
        }

        const str = JSON.stringify(q, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(q);
    });

    test('Converting into broker', () => {
        const b = new Market.Broker('DEF');
        b.addAccount(0);
        const str = JSON.stringify(b, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(b);
    });

    test('Converting into broker account', () => {
        const a = new Market.BrokerAccount(0);
        const str = JSON.stringify(a, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(a);
    });

    test('Converting into position', () => {
        const p = new Market.Position('def', 1, 0);
        const str = JSON.stringify(p, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(p);
    });

    test('Converting into transaction', () => {
        const t = new Market.Transaction('DEF', 1, 0, 10, 1000, 0);
        const str = JSON.stringify(t, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(t);
    });

    test('Converting into orderbook', () => {
        const orderbook = new Market.Orderbook('def');
        orderbook.addOrder(new Market.Order(1, 'def', 'def', 1, 1, Market.Constants.OrderSide.BUY, Market.Constants.OrderType.LMT));
        orderbook.addOrder(new Market.Order(1, 'def', 'def', 2, 1, Market.Constants.OrderSide.SEL, Market.Constants.OrderType.LMT));
        
        const str = JSON.stringify(orderbook, Market.JSON.replacer);
        const obj = JSON.parse(str, Market.JSON.reviver);

        expect(obj).toEqual(orderbook);
    });

})