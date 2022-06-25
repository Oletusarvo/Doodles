const Orderbook = require('../src/js/orderbook.js');
const Order = require('../src/js/order.js');
const Constants = require('../src/js/constants.js');
const Transaction = require('../src/js/transaction.js');

describe('Testing the orderbook', () => {
    let orderbook = null;
    const symbol = 'def', route = 'def';

    beforeEach(() => {
        orderbook = new Orderbook(symbol);
    });

    describe('Order validation', () => {
        let order = null;
        beforeEach(() => {
            order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
        });

        test('Valid orders must be accepted', () => {
            let result = orderbook.addOrder(order);
            expect(result).toBeTruthy();
        });

        test('Invalid orders must be rejected', () => {
            order.symbol = 'fed';
            let result = orderbook.addOrder(order);
            expect(result).toBeFalsy();
        });
    });

    describe('Adding buy orders', () => {
        test('Adding a buy order and calling bestBid, will return an orderque containing the order', () => {
            const order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            orderbook.addOrder(order);
            const bestOrder = orderbook.bestBid().front();

            expect(bestOrder).toEqual(order);
        });

        test('Adding a cover order and calling bestBid, will return an orderque containing the order', () => {
            const order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.CVR, Constants.OrderType.LMT);
            orderbook.addOrder(order);
            const bestOrder = orderbook.bestBid().front();

            expect(bestOrder).toEqual(order);
        });

        
    });

    describe('Adding sell orders', () => {
        test('Adding a sell order and calling bestAsk, will return an orderque containing the order', () => {
            const order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
            orderbook.addOrder(order);
            const bestOrder = orderbook.bestAsk().front();

            expect(bestOrder).toEqual(order);
        });

        test('Adding a short order and calling bestAsk, will return an orderque containing the order', () => {
            const order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.SHT, Constants.OrderType.LMT);
            orderbook.addOrder(order);
            const bestOrder = orderbook.bestAsk().front();

            expect(bestOrder).toEqual(order);
        });
    });

    describe('Empty queues', () => {

        test('Flushing removes empty queues', () => {
            const order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.BUY, 0);
            orderbook.addOrder(order);
            expect(orderbook.bestBid()).not.toBeUndefined();

            orderbook.bestBid().reduce(100);
            orderbook.flush();
            expect(orderbook.bestBid()).toBeUndefined();
        });
    });

    describe('Updating high, low, open and last prices', () => {

        let tx;

        beforeEach(() => {
            tx = new Transaction(symbol, 0, 1, 10, 100, Constants.OrderSide.BUY);
        });

        test('First transaction will set the open price to the price in the transaction', () => {
            orderbook.update(tx);

            expect(orderbook.getOpen()).toBe(tx.price);
        });

        test('Receiving a transaction with price higher than the previous high, sets the high to the new price', () => {
            orderbook.update(tx);
            const previousHigh = orderbook.getHigh();
            tx.price = 11;

            orderbook.update(tx);
            expect(orderbook.getHigh()).toBeGreaterThan(previousHigh);
        });

        test('Receiving a transaction with higher price than the low price, will not change the low price', () => {
            orderbook.low = 9;
            const previousLow = orderbook.getLow();
            orderbook.update(tx);
            expect(orderbook.getLow()).toBe(previousLow);
        });

        test('Receiving a transaction with lower price than the high price, will not change the high price', () => {
            orderbook.high = 11;
            const previousHigh = orderbook.getHigh();
            orderbook.update(tx);
            expect(orderbook.getHigh()).toBe(previousHigh);
        });

        test('Receiving a transaction with price lower than the previous low, sets the low to the new price', () => {
            orderbook.update(tx);
            const previousLow = orderbook.getLow();
            tx.price = 9;
            orderbook.update(tx);
            expect(orderbook.getLow()).toBeLessThan(previousLow);
        });
    });
})