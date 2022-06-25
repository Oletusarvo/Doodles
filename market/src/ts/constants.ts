enum BrokerError{
    INVALID_PRICE = 1,
    INVALID_SIZE = 2,
    INVALID_SYMBOL = 4,
    INVALID_ROUTE = 8,
    INVALID_SIDE = 16,
    INVALID_TYPE = 32,
    INVALID_ID = 64,
    INVALID_ACCOUNT = 128,
    NO_POSITION = 256,
    SELL_OVERFLOW = 512,
    COVER_OVERFLOW = 1024,
    EQUITY_OVERFLOW = 2048,
    SELL_SHORT = 4096,
    SHORT_LONG = 8192,
    COVER_LONG = 16384,
    BUY_SHORT = 32768,
    MARKED_FOR_BORROW = 65536
};

enum ExchangeError{
    INVALID_SYMBOL = 131072,
    INVALID_PRICE = 262144
};

enum OrderSide{
    BUY = 0,
    SEL = 1,
    CVR = 2,
    SHT = 3
};

enum OrderType{
    MKT = 0,
    LMT = 1
};

export = {BrokerError, OrderSide, OrderType, ExchangeError};