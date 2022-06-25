const Orderqueue = require('../src/js/orderqueue.js');
const Order = require('../src/js/order.js');
const Constants = require('../src/js/constants.js');

describe('Testing the orderqueue', () => {
    let queue = null;
    const symbol = 'def', route = 'def';

    beforeEach(() => {
        queue = new Orderqueue();
    });

    describe('Order validation', () => {
        test('Adding an order into an empty queue must succeed', () => {
            const order = new Order(0, symbol, route, 10.00, 1000, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            const res = queue.push(order);
            expect(res).toBeTruthy();
        });
    
        test('Adding an order with different price to the ones in the queue will be rejected.', () => {
            const order = new Order(0, symbol, route, 10.00, 1000, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            queue.push(order);
            const anotherOrder = new Order(0, symbol, route, 11, 100, 1, 1);
    
            const res = queue.push(anotherOrder);
            expect(res).toBeFalsy();
        });
    });

    describe('Calculating sharesize', () => {
        let expectedSize = 0;

        beforeEach(() => {
            for(let i = 0; i < 10; ++i){
                const order = new Order(0, symbol, route, 10.00, 1000, Constants.OrderSide.BUY, Constants.OrderType.LMT);
                queue.push(order);
            }
        });

        test('Sharesize of a queue is correct', () => {
            expectedSize = 10 * 1000;
        });

        test('Popping an order reduces the sharesize correctly', () => {
            expectedSize = 10 * 1000 - 1000;
            queue.pop();
        });

        test('Adding an order increases the sharesize correctly', () => {
            expectedSize = 10 * 1000 + 1000;
            queue.push(new Order(0, symbol, route, 10.00, 1000, 1, 1));
        });

        test('Calling reduce, reduces the size of the first queue element correctly', () => {
            expectedSize = 10 * 1000 - 100;
            queue.reduce(100);
        });

        test('Empty elements are popped automatically', () =>{
            expect(queue.items.length == 10);
            expectedSize = 9 * 1000;
            queue.reduce(1000);
            expect(queue.items.length == 9);
        })

        afterEach(() => {
            expect(queue.calculateShareSize()).toBe(expectedSize);
        });
    });

    describe('Order canceling', () => {
        test('Canceling an order correctly removes it from the queue', () => {
            const order = new Order(0, symbol, route, 10.00, 100, Constants.OrderSide.BUY, Constants.OrderType.LMT);
            queue.push(order);
            expect(queue.calculateShareSize()).toBe(order.size);
            queue.cancel(order.id);
            expect(queue.calculateShareSize()).toBe(0);
        });
    })
});