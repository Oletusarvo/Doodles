const Broker = require('../src/js/broker.js');
const Order = require('../src/js/order.js');
const Constants = require('../src/js/constants.js');
const Transaction = require('../src/js/transaction.js');
const Position = require('../src/js/position.js');

describe('Testing the broker', () => {
    let broker = null;
    const symbol = 'def', route = 'def';

    beforeEach(() => {
        broker = new Broker();
    });

    describe('Transaction processing', () => {
        beforeEach(() => {
            broker.addAccount(0);
            broker.addAccount(1);
        });

        describe('No previous position', () => {
            let tx = null;

            beforeEach(() => {
                tx = new Transaction(symbol, 0, 1, 10, 1000, Constants.OrderSide.BUY);
            });

            test('Buyer with no position, will get one generated', () => {
                broker.processTransaction(tx);
                const buyerPos = broker.getAccount(0).getPosition(symbol);
                expect(buyerPos).not.toBeUndefined();
                const pos = new Position(symbol, Constants.OrderSide.BUY, 0).update(10, 1000);
                expect(pos).toEqual(buyerPos);
            });

            test('Short seller with no position, will get one generated', () => {
                tx.side = Constants.OrderSide.SHT;

                broker.processTransaction(tx);
                const sellPos = broker.getAccount(1).getPosition(symbol);
                expect(sellPos).not.toBeUndefined();
                const pos = new Position(symbol, Constants.OrderSide.SHT, 1).update(10, 1000);
                expect(pos).toEqual(sellPos);
            });
        });

        describe('Existing position', () => {
            let tx = null;

            beforeEach(() => {
                broker.getAccount(0).addPosition(symbol, 10, 1000, Constants.OrderSide.BUY);
                broker.getAccount(1).addPosition(symbol, 10, 1000, Constants.OrderSide.SHT);
                tx = new Transaction(symbol, 0, 1, 10, 1000, Constants.OrderSide.BUY);
            });

            test('Buyer unwinding a position fully, will have it deleted', () => {
                tx.side = Constants.OrderSide.SEL;
                tx.seller = 0;
                tx.buyer = 1;
                broker.processTransaction(tx);
                expect(broker.getAccount(0).getPosition(symbol)).toBeUndefined();
            });

            test('Short seller unwinding a position fully, will have it deleted', () => {
                tx.side = Constants.OrderSide.BUY;
                tx.seller = 0;
                tx.buyer = 1;
                broker.processTransaction(tx);
                expect(broker.getAccount(1).getPosition(symbol)).toBeUndefined();
            });
        });
    });

    describe('Order validation', () => {
        let order = null;

        beforeEach(() => {
            order = new Order(0, symbol, symbol, 10, 10, 1, 1);
        });

        describe('Invalid id', () => {
            test('Non-number ids are rejected', () => {
                order.accountId = 'sdkjkf';
            });

            afterEach(() => {
                let result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_ID);
            });


        });

        describe('Invalid symbol', () => {

            test('Non-string symbols are rejected', () => {
                order.symbol = 12;
            });

            afterEach(() => {
                let result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_SYMBOL);
            });
        });

        describe('Invalid route', () => {
            test('Non-string routes are rejected', () => {
                order.route = 12;
            });

            afterEach(() => {
                let result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_ROUTE);
            });
        })

        describe('Invalid price', () => {

            test('Non-number prices are rejected', () => {
                order.price = '';
                
            });

            test('Prices less than or equal to zero are rejected', () => {
                order.price = 0;
            });

            afterEach(() => {
                let result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_PRICE);
            })
        });

        describe('Invalid size', () => {
            test('Non-number size is rejected', () => {
                order.size = 'sdsddf';
            });

            test('Sizes equal to zero are rejected', () => {
                order.size = 0;
            });

            test('Sizes less than zero are rejected', () => {
                order.size = -1;
            });

            afterEach(() => {
                let result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_SIZE);
            })
        });

        describe('Invalid side', () => {
            test('Non-number sides are rejected', () => {
                order.side = 'ssafjlk';
            });

            describe('An undefined side (bigger or less than the enum values) is rejected', () => {
                test('Higher than maximum value', () => {
                    order.side = 1100;
                });

                test('Lower than minimum value', () => {
                    order.side = -1;
                });
            });
            

            afterEach(() => {
                let result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_SIDE);
            });
        });

        describe('Invalid type', () => {
            test('Non-number types are rejected', () => {
                order.type = 'ssafjlk';
            });

            describe('A non-defined type (bigger or less than the enum values) is rejected', () => {
                test('Higher than maximum value', () => {
                    order.type = 1100;
                });

                test('Lower than minimum value', () => {
                    order.type = -1;
                });
            })
            

            afterEach(() => {
                let result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_TYPE);
            });
        });

        describe('Invalid account', () => {
            let order = null;
            beforeEach(() => {
                order = new Order(0, symbol, route, 10, 1, Constants.OrderSide.BUY, Constants.OrderType.MKT);
            });

            test('Orders with id referencing non-existent account are rejected', () => {
                const result = broker.validate(order);
                expect(result).toBe(Constants.BrokerError.INVALID_ACCOUNT);
            });
        });

        describe('Existing account', () => {
            let id = -1;

            beforeEach(() => {
                id = broker.addAccount(0);
                broker.getAccount(id).deposit(1000);
            });

            describe('No position', () => {
                test('Selling when there is no open long position, is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 10, Constants.OrderSide.SEL, Constants.OrderType.MKT);
                });
    
                test('Covering when there is no open short position, is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 10, Constants.OrderSide.CVR, Constants.OrderType.MKT);
                });
    
                afterEach(() => {
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.NO_POSITION);
                });
            });

            describe('Existing long position', () => {
                let pos = null;
                beforeEach(() => {
                    pos = broker.accounts.get(0).addPosition(symbol, 10, 100, Constants.OrderSide.BUY)
                });

                test('Trying to sell more than existing position is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 1000, Constants.OrderSide.SEL, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.SELL_OVERFLOW);
                });

                test('Orders to sell a partial position must succeed', () => {
                    order = new Order(0, symbol, route, 10, 50, Constants.OrderSide.SEL, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(0);
                });

                test('Orders to sell an entire position must succeed', () => {
                    order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(0);
                });

                test('Orders to buy more, exceeding available account equity, are rejected', () => {
                    order = new Order(0, symbol, route, 10, 2000, Constants.OrderSide.BUY, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.EQUITY_OVERFLOW);
                });

                test('Shorting while in an open long position, is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.SHT, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.SHORT_LONG);
                });

                test('Covering while in an open long position, is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.CVR, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.COVER_LONG);
                });

                test('Selling a position marked for borrow is prohibited', () => {
                    const pos = broker.getAccount(0).getPosition(symbol);
                    pos.setReservedForBorrow(true);
                    order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.LMT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.MARKED_FOR_BORROW);
                });
            });

            describe('Existing short position', () => {
                let pos = null;
                beforeEach(() => {
                    pos = broker.accounts.get(0).addPosition(symbol, 10, 100, Constants.OrderSide.SHT)
                });

                test('Trying to cover more than existing position is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 1000, Constants.OrderSide.CVR, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.COVER_OVERFLOW);
                });

                test('Orders to cover a partial position must succeed', () => {
                    order = new Order(0, symbol, route, 10, 50, Constants.OrderSide.CVR, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(0);
                });

                test('Orders to cover an entire position must succeed', () => {
                    order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.CVR, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(0);
                });

                test('Orders to short more, exceeding available account equity, are rejected', () => {
                    order = new Order(0, symbol, route, 10, 2000, Constants.OrderSide.SHT, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.EQUITY_OVERFLOW);
                });

                test('Selling while in an open short position, is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.SEL, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.SELL_SHORT);
                });

                test('Buying when in an open short position, is not allowed', () => {
                    order = new Order(0, symbol, route, 10, 100, Constants.OrderSide.BUY, Constants.OrderType.MKT);
                    const result = broker.validate(order);
                    expect(result).toBe(Constants.BrokerError.BUY_SHORT);
                });
            });
           
        });

        describe('Short locating', () => {
            beforeEach(() => {

            });

            describe('No-previous position', () => {
                test('',() => {

                });
            });
        });

    });
});