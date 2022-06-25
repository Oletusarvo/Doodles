const Market = require('../market.js');

describe('Testing the broker account', () => {
    var acc = undefined;

    beforeEach(() => {
        acc = new Market.BrokerAccount(0);
    });

    test('Adding a pending order', () => {
        acc.addPendingOrder(new Market.Order(0, 'DEF', 'DEF', 10.00, 100, Market.Constants.OrderSide.BUY, Market.Constants.OrderType.LMT));
        expect(acc.pendingOrders.length).not.toBe(0);
    });

    test('Removing a pending order', () => {
        const order = new Market.Order(0, 'DEF', 'DEF', 10.00, 100, Market.Constants.OrderSide.BUY, Market.Constants.OrderType.LMT)
        acc.addPendingOrder(order);

        acc.removePendingOrder(order.id);
        expect(acc.pendingOrders.length).toBe(0);
    });

})