const Exchange = require('../src/js/exchange.js');
const Transaction = require('../src/js/transaction.js');
const Order = require('../src/js/order.js');
const Constants = require('../src/js/constants.js');

describe('Testing the exchange', () => {
    let exchange = null;
    const exName = 'def', symbol = 'def';

    beforeEach(() => {
        exchange = new Exchange(exName);
        exchange.addOrderbook(symbol);
    });

    describe('Testing order validation', () => {
        let order = undefined;
        beforeEach(() => {
            order = new Order(0);
        });

        test('Orders for non-existent symbol are rejected', () => {
            order.symbol = 'non-existent';
            let result = exchange.validate(order);
            expect(result).toBe(Constants.ExchangeError.INVALID_SYMBOL);
        });


    });

    describe('Executing orders with no match', () => {
        test('Adding a limit buy order that produces no match, is added to its corresponding orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            exchange.execute(order);
            const orderbook = exchange.getOrderbook(symbol);

            expect(orderbook).not.toBeUndefined();

            const queue = orderbook.bestBid();

            expect(queue).not.toBeUndefined();

            const exOrder = queue.front();

            expect(exOrder).toEqual(order);
        });

        test('Adding a limit cover order that produces no match, is added to its corresponding orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.CVR, Constants.OrderType.LMT);
            exchange.execute(order);
            const orderbook = exchange.getOrderbook(symbol);

            expect(orderbook).not.toBeUndefined();

            const queue = orderbook.bestBid();

            expect(queue).not.toBeUndefined();

            const exOrder = queue.front();

            expect(exOrder).toEqual(order);
        });

        test('Adding a limit sell order that produces no match, is added to its corresponding orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
            exchange.execute(order);
            const orderbook = exchange.getOrderbook(symbol);

            expect(orderbook).not.toBeUndefined();

            const queue = orderbook.bestAsk();

            expect(queue).not.toBeUndefined();

            const exOrder = queue.front();

            expect(exOrder).toEqual(order);
        });

        test('Adding a limit short order that produces no match, is added to its corresponding orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SHT, Constants.OrderType.LMT);
            exchange.execute(order);
            const orderbook = exchange.getOrderbook(symbol);

            expect(orderbook).not.toBeUndefined();

            const queue = orderbook.bestAsk();

            expect(queue).not.toBeUndefined();

            const exOrder = queue.front();

            expect(exOrder).toEqual(order);
        });

        test('An unfilled market buy order is discarded', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.MKT);
            exchange.execute(order);

            expect(exchange.getOrderbook(symbol).bestBid()).toBeUndefined();
        });

        test('An unfilled market cover order is discarded', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.CVR, Constants.OrderType.MKT);
            exchange.execute(order);

            expect(exchange.getOrderbook(symbol).bestBid()).toBeUndefined();
        });

        test('An unfilled market sell order is discarded', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.MKT);
            exchange.execute(order);

            expect(exchange.getOrderbook(symbol).bestBid()).toBeUndefined();
        });

        test('An unfilled market short order is discarded', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SHT, Constants.OrderType.MKT);
            exchange.execute(order);

            expect(exchange.getOrderbook(symbol).bestBid()).toBeUndefined();
        });

        test('An unfilled limit buy order is added into the orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            exchange.execute(order);
            const ob = exchange.getOrderbook(symbol);
            
            const buySide = ob.bestBid();

            expect(buySide).not.toBeUndefined();
            expect(buySide.front() == order);
        });

        test('An unfilled limit cover order is added into the orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.CVR, Constants.OrderType.LMT);
            exchange.execute(order);
            const ob = exchange.getOrderbook(symbol);
            
            const buySide = ob.bestBid();

            expect(buySide).not.toBeUndefined();
            expect(buySide.front() == order);
        });

        test('An unfilled limit sell order is added into the orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
            exchange.execute(order);
            const ob = exchange.getOrderbook(symbol);
            
            const buySide = ob.bestAsk();

            expect(buySide).not.toBeUndefined();
            expect(buySide.front() == order);
        });

        test('An unfilled limit short order is added into the orderbook', () => {
            const order = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SHT, Constants.OrderType.LMT);
            exchange.execute(order);
            const ob = exchange.getOrderbook(symbol);
            
            const buySide = ob.bestAsk();

            expect(buySide).not.toBeUndefined();
            expect(buySide.front() == order);
        });
    });

    describe('Executing buy orders with a match', () => {
        beforeEach(() => {
            const sellOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
            exchange.execute(sellOrder);
        });

        test('A fully filled buy market order empties the sell side and the filled buy order is discarded', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.MKT);
            exchange.execute(buyOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide).toBeUndefined();
            expect(buySide).toBeUndefined();
        });

        test('A fully filled buy limit order at equal price empties the sell side and the filled buy order is discarded', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            exchange.execute(buyOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide).toBeUndefined();
            expect(buySide).toBeUndefined();
        });

        test('A partially filled buy market order reduces the size of the seller by the correct amount and the buy order is added into the orderbook', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 50, Constants.OrderSide.BUY, Constants.OrderType.MKT);
            exchange.execute(buyOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide != undefined);
            expect(buySide != undefined);

            expect(sellSide.calculateShareSize() == 50);
        });

        test('A fully filled cover market order empties the sell side and the filled buy order is discarded', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.CVR, Constants.OrderType.MKT);
            exchange.execute(buyOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide).toBeUndefined();
            expect(buySide).toBeUndefined();
        });

        test('A partially filled cover market order reduces the size of the seller by the correct amount and the buy order is added into the orderbook', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 50, Constants.OrderSide.CVR, Constants.OrderType.MKT);
            exchange.execute(buyOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide != undefined);
            expect(buySide != undefined);

            expect(sellSide.calculateShareSize() == 50);
        });
    });

    describe('Executing sell orders with a match', () => {
        beforeEach(() => {
            const buyOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            exchange.execute(buyOrder);
        });

        test('A fully filled sell market order empties the buy side and the filled buy order is discarded', () => {
            const sellOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.MKT);
            exchange.execute(sellOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide).toBeUndefined();
            expect(buySide).toBeUndefined();
        });

        test('A fully filled sell limit order at equal price empties the buy side and the filled buy order is discarded', () => {
            const sellOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
            exchange.execute(sellOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide).toBeUndefined();
            expect(buySide).toBeUndefined();
        });

        test('A partially filled sell market order reduces the size of the buyer by the correct amount and the sell order is added into the orderbook', () => {
            const sellOrder = new Order(0, symbol, exName, 10, 50, Constants.OrderSide.SEL, Constants.OrderType.MKT);
            exchange.execute(sellOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide != undefined);
            expect(buySide != undefined);

            expect(buySide.calculateShareSize() == 50);
        });

        test('A fully filled short market order empties the buy side and the filled short order is discarded', () => {
            const sellOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SHT, Constants.OrderType.MKT);
            exchange.execute(sellOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide).toBeUndefined();
            expect(buySide).toBeUndefined();
        });

        test('A partially filled short market order reduces the size of the buyer by the correct amount and the short order is added into the orderbook', () => {
            const sellOrder = new Order(0, symbol, exName, 10, 50, Constants.OrderSide.SHT, Constants.OrderType.MKT);
            exchange.execute(sellOrder);

            const ob = exchange.getOrderbook(symbol);

            const sellSide = ob.bestAsk();
            const buySide = ob.bestBid();

            expect(sellSide != undefined);
            expect(buySide != undefined);

            expect(buySide.calculateShareSize() == 50);
        });
    });

    describe('Executing buy limit orders at different prices than those available', () => {
        beforeEach(() => {
            const sellOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
            exchange.execute(sellOrder);
        });

        test('Executing a buy order at a lower price than what is sold, is added to the orderbook', () => {
            const buyOrder = new Order(0, symbol, exName, 9, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            exchange.execute(buyOrder);

            expect(exchange.getOrderbook(symbol).bestBid().front()).toEqual(buyOrder);
        });

        test('Executing a cover order at a lower price than what is sold, is added to the orderbook', () => {
            const buyOrder = new Order(0, symbol, exName, 9, 100, Constants.OrderSide.CVR, Constants.OrderType.LMT);
            exchange.execute(buyOrder);

            expect(exchange.getOrderbook(symbol).bestBid().front()).toEqual(buyOrder);
        });
    });

    describe('Executing sell limit orders at different prices than those available', () => {
        beforeEach(() => {
            const buyOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            exchange.execute(buyOrder);
        });

        test('Executing a sell order at a higher price than what is bought, is added to the orderbook', () => {
            const sellOrder = new Order(0, symbol, exName, 11, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
            exchange.execute(sellOrder);

            expect(exchange.getOrderbook(symbol).bestAsk().front()).toEqual(sellOrder);
        });

        test('Executing a short order at a higher price than what is bought, is added to the orderbook', () => {
            const sellOrder = new Order(0, symbol, exName, 11, 100, Constants.OrderSide.SHT, Constants.OrderType.LMT);
            exchange.execute(sellOrder);

            expect(exchange.getOrderbook(symbol).bestAsk().front()).toEqual(sellOrder);
        });
    });

    describe('Generated transactions', () => {
        test('Transacting a buyer first and then a seller at equal size, generates correct transaction at the sell side', () => {
            const origSize = 100;
            const buyOrder = new Order(0, symbol, exName, 10, origSize, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 10, origSize, Constants.OrderSide.SEL, Constants.OrderType.LMT);

            exchange.execute(buyOrder);
            exchange.execute(sellOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.SEL);
            expect(tx.price).toBe(sellOrder.price);
            expect(tx.size).toBe(origSize);
            expect(tx.buyer).toBe(buyOrder.accountId);
            expect(tx.seller).toBe(sellOrder.accountId);
        });

        test('Transacting a buyer first and then a seller, where the buyer is bigger, generates correct transaction at the sell side', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 1000, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SHT, Constants.OrderType.LMT);

            exchange.execute(buyOrder);
            exchange.execute(sellOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.SEL);
            expect(tx.price).toBe(sellOrder.price);
            expect(tx.size).toBe(100);
            expect(tx.buyer).toBe(buyOrder.accountId);
            expect(tx.seller).toBe(sellOrder.accountId);
        });

        test('Transacting a buyer first and then a seller, where the seller is bigger, generates correct transaction at the sell side', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 10, 1000, Constants.OrderSide.SHT, Constants.OrderType.LMT);

            exchange.execute(buyOrder);
            exchange.execute(sellOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.SEL);
            expect(tx.price).toBe(sellOrder.price);
            expect(tx.size).toBe(100);
            expect(tx.buyer).toBe(buyOrder.accountId);
            expect(tx.seller).toBe(sellOrder.accountId);
        });

        test('Transacting a seller first and then a buyer at equal size, generates correct transaction at the buy side', () => {
            const origSize = 100;
            const buyOrder = new Order(0, symbol, exName, 10, origSize, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 10, origSize, Constants.OrderSide.SEL, Constants.OrderType.LMT);

            exchange.execute(sellOrder);
            exchange.execute(buyOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.BUY);
            expect(tx.price).toBe(buyOrder.price);
            expect(tx.size).toBe(origSize);
            expect(tx.buyer).toBe(buyOrder.accountId);
            expect(tx.seller).toBe(sellOrder.accountId);
        });

        test('Transacting a seller first and then a buyer, where the seller is bigger, generates correct transaction at the buy side', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 10, 1000, Constants.OrderSide.SEL, Constants.OrderType.LMT);

            exchange.execute(sellOrder);
            exchange.execute(buyOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.BUY);
            expect(tx.price).toBe(buyOrder.price);
            expect(tx.size).toBe(100);
            expect(tx.buyer).toBe(buyOrder.accountId);
            expect(tx.seller).toBe(sellOrder.accountId);
        });

        test('Transacting a seller first and then a buyer, where the buyer is bigger, generates correct transaction at the buy side', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 1000, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);

            exchange.execute(sellOrder);
            exchange.execute(buyOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.BUY);
            expect(tx.price).toBe(buyOrder.price);
            expect(tx.size).toBe(100);
            expect(tx.buyer).toBe(buyOrder.accountId);
            expect(tx.seller).toBe(sellOrder.accountId);
        });

        test('Transacting a buyer at a higher price than an available seller, generates a transaction on the buy side with the price of the seller', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 1000, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 9, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);

            exchange.execute(sellOrder);
            exchange.execute(buyOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.BUY);
            expect(tx.price).toBe(sellOrder.price);
            expect(tx.size).toBe(100);
        });

        test('Transacting a seller at a lower price than an available buyer, generates a transaction on the sell side with the price of the buyer', () => {
            const buyOrder = new Order(0, symbol, exName, 10, 1000, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const sellOrder = new Order(0, symbol, exName, 9, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);

            exchange.execute(buyOrder);
            exchange.execute(sellOrder);

            const tx = exchange.getLatestTransaction();

            expect(tx.side).toBe(Constants.OrderSide.SEL);
            expect(tx.price).toBe(buyOrder.price);
            expect(tx.size).toBe(100);
        });
    });
})