const Position = require('../src/js/position.js');
const Constants = require('../src/js/constants.js');

describe('Testing the position', () => {
    describe('Position open and closed status', () => {
        test('Position with sizeIn different from sizeOut is considered to be open', () => {
            const pos = new Position('DEF', Constants.OrderSide.BUY, 0).update(1.00, 1000);
            expect(pos.isClosed()).toBeFalsy();
        });

        test('Position with sizeIn equal to sizeOut is considered closed', () => {
            const pos = new Position('DEF', Constants.OrderSide.BUY, 0).update(1, 1000);
            pos.remove(1000, 1.00);
            expect(pos.isClosed()).toBeTruthy();
        });
    });

    describe('Position average in price', () => {
        test('Opening a position at 1.00 will have an average opening price of 1.00', () => {
            const pos = new Position('DEF', Constants.OrderSide.BUY, 0).update(1.00, 1000);
            expect(pos.avgPriceIn).toBe(1.00);
        });

        test('A long position opened at 1.00 and increased at 1.1 by an equal amount of shares, will have an average in-price of 1.05', () => {
            const pos = new Position('DEF', Constants.OrderSide.BUY, 0).update(1.00, 1000);
            pos.add(1000, 1.1);
            expect(pos.avgPriceIn).toBe(1.05);
        });

        test('A short position opened at 1.1 and increased at 1.00 by an equal amount of shares, will have an average in-price of 1.05', () => {
            const pos = new Position('DEF', Constants.OrderSide.SHT, 0).update(1.1, 1000);
            pos.add(1000, 1.00);
            expect(pos.avgPriceIn).toBe(1.05);
        });
    });

    describe('Position average out price', () => {
        var pos = undefined;
        beforeEach(() => {
            pos = new Position('DEF', Constants.OrderSide.BUY, 0).update(1.1, 1000);
        });

        test('A long position closed by half at 1.2 and 1.3, will have an average out-price of 1.25', () => {
            pos.remove(500, 1.2);
            pos.remove(500, 1.3)
            expect(pos.avgPriceOut).toBe(1.25);
        });

        test('A short position closed by half at 1.2 and 1.3, will have an average out-price of 1.25', () => {
            pos.side = Constants.OrderSide.SHT;
            pos.remove(500, 1.2);
            pos.remove(500, 1.3);
            expect(pos.avgPriceOut).toBe(1.25);
        });
    });

    describe('Calculating gain', () => {

        var pos = undefined;
        describe('Long position', () => {
            

            beforeEach(() => {
                pos = new Position('DEF', Constants.OrderSide.BUY, 0).update(1.00, 1000);
            });

            test('A position opened at 1.00 will have a gain of 100% at 2.00', () => {
                const gain = pos.calculateGain(2.00);
                expect(gain).toBe(1);
            });

            test('A position opened at 1.00 will have a gain of 50% at 1.50', () => {
                const gain = pos.calculateGain(1.5);
                expect(gain).toBe(0.5);
            });

            test('A position opened at 1.00 will have a gain of -50% at 0.5', () => {
                const gain = pos.calculateGain(0.5);
                expect(gain).toBe(-0.5);
            });
        });

        describe('Short position', () => {
            beforeEach(() => {
                pos = new Position('DEF', Constants.OrderSide.SHT, 0).update(2.00, 1000);
            });

            test('A position opened at 2.00 will have a gain of 50% at 1.00', () => {
                const gain = pos.calculateGain(1.00);
                expect(gain).toBe(0.5);
            });

            test('A position opened at 2.00 will have a gain of 75% at 0.5', () => {
                const gain = pos.calculateGain(0.5);
                expect(gain).toBe(0.75);
            });

            test('A position opened at 2.00 will have a gain of -50% at 3.00', () => {
                const gain = pos.calculateGain(3.00);
                expect(gain).toBe(-0.5);
            });
        })
    });

    describe('Position updating', () => {
        var pos = undefined;

        beforeEach(() => {
            pos = new Position('DEF', Constants.OrderSide.BUY, 0).update(1.00, 1000);
        });

        test('Updating a position with a positive size value, increases the size-in of the position', () => {
            pos.update(1.50, 1000);
            expect(pos.sizeIn).toBe(2000);
        });

        test('Updating a position with a negative size value, increases the size-out of the position', () => {
            pos.update(1.50, -1000);
            expect(pos.sizeOut).toBe(1000);
        });
    })
});