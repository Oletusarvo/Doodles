const Position = require('../src/js/position.old.js');
const Constants = require('../src/js/constants.js');

describe('Testing the *old* position', () => {

    describe('Calculating size', () => {
        test('Creating a position with size 1000 shall yield currentSize of 1000', () => {
            const pos = new Position('def', 10, 1000, 0);
            expect(pos.calculateCurrentSize()).toBe(1000);
        });
    });

    describe('Calculating equity', () => {
        test('A position at price 1 of 1000 shares should have equity of 1000', () => {
            const pos = new Position('def', 1, 1000, 0);
            expect(pos.calculateEquity()).toBe(1000);
        });

        test('Opening a position at 1 for a 1000 shares and closing 500 at 1.10, yields equity of 500', () => {
            const pos = new Position('def', 1, 1000, 0);
            pos.update(1.1, -500);
            expect(pos.calculateEquity()).toBe(500);
        });

        test('Opening a position at 1 for 1000 shares and buying 1000 more at 1.1, yields equity of 2100', () => {
            const pos = new Position('def', 1, 1000, 0);
            pos.update(1.1, 1000);
            expect(pos.calculateEquity()).toBe(2100);
        });

        test('Opening a position at 1 for 1000 shares and selling 500 at 10, yields equity of 500', () => {
            const pos = new Position('def', 1, 1000, 0);
            pos.update(10, -500);
            expect(pos.calculateEquity()).toBe(500);
        });
    });

    describe('Calculating average price in', () => {
        test('Buying 1000 shares at 1.00 yields average price in at 1.00 and size in of 1000', () => {
            const pos = new Position('def', 1.00, 1000, 0);
            expect(pos.calculateAveragePriceIn()).toBe(1.00);

            expect(pos.calculateSizeIn()).toBe(1000);
        });

        test('Buying 1000 shares at 1.00 and 1000 shares at 1.05, yields average price in at 1.025 and size in of 2000', () => {
            const pos = new Position('def', 1.00, 1000, 0);
            pos.update(1.05, 1000);
            expect(pos.calculateAveragePriceIn()).toBe(1.025);

            expect(pos.calculateSizeIn()).toBe(2000);
        });

        test('Buying 1000 shares at 1.00, 1000 shares at 1.05 and 500 shares at 1.1, yields average price in at 1.04 and size in of 2500', () => {
            const pos = new Position('def', 1.00, 1000, 0);
            pos.update(1.05, 1000);
            pos.update(1.1, 500);
            expect(pos.calculateAveragePriceIn()).toBe(1.04);
            expect(pos.calculateSizeIn()).toBe(2500);
        });
    });

    describe('calculate average price out', () => {
        test('Buying 1000 shares at 1.00 and selling them at the same price, yields average price out at 1.00 and size out of 1000', () => {
            const pos = new Position('def', 1.00, 1000, 0);
            pos.update(1.00, -1000);
            expect(pos.calculateAveragePriceOut()).toBe(1.00);

            expect(pos.calculateSizeOut()).toBe(1000);
        });

        test('Buying 1000 shares at 1.00 and selling them at 1.05, yields average price out at 1.05 and size out of 1000', () => {
            const pos = new Position('def', 1.00, 1000, 0);
            pos.update(1.05, -1000);
            expect(pos.calculateAveragePriceOut()).toBe(1.05);

            expect(pos.calculateSizeOut()).toBe(1000);
        });
    });

    describe('Calculating unrealized profit', () => {
        test('Position of 1000 shares long and average price of 1.00, will have gain of 50 if share price is at 1.05', () => {
            const pos = new Position('def', 1.00, 1000, Constants.OrderSide.BUY);
            expect(pos.calculateUnrealized(1.05)).toBeCloseTo(50);
        });

        test('Position of 1000 shares long and average price of 1.00, will have gain of -50 if share price is at 0.95', () => {
            const pos = new Position('def', 1.00, 1000, Constants.OrderSide.BUY);
            expect(pos.calculateUnrealized(0.95)).toBeCloseTo(-50);
        });

        test('Position of 1000 shares short and average price of 1.00, will have gain of 50 if share price is at 0.95', () => {
            const pos = new Position('def', 1.00, 1000, Constants.OrderSide.SHT);
            expect(pos.calculateUnrealized(0.95)).toBeCloseTo(50);
        });

        test('Position of 1000 shares short and average price of 1.00, will have gain of -50 if share price is at 1.05', () => {
            const pos = new Position('def', 1.00, 1000, Constants.OrderSide.SHT);
            expect(pos.calculateUnrealized(1.05)).toBeCloseTo(-50);
        });

        test('Opening a position at 1 for 1000 shares and selling 500 at 10, yields gain of 4500', () => {
            const pos = new Position('def', 1, 1000, 0);
            pos.update(10.0, -500);
            expect(pos.calculateUnrealized(10)).toBe(4500);
        });
    });

    describe('Consolidating a position', () => {
        let pos;
        
        beforeEach(() => {
            pos = new Position('def', 10, 1000, Constants.OrderSide.BUY);
        });

        test('Consolidating a position yields consolidated version matching the original', () => {
            pos.update(11, -1000);
            const expectedResult = {
                realized : 1000,
                avgPriceIn : 10,
                avgPriceOut : 11,
                sizeOut : 1000,
                sizeIn : 1000,
                symbol : 'def',
                side : 'BUY',
                gain : 0.1
            }

            expect(pos.consolidate()).toEqual(expectedResult);
        });
    });
});