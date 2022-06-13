#ifndef CARD_HPP_
#define CARD_HPP_
#include <iostream>

enum CardSuite : unsigned int{
	SPADES = 0,
	CLUBS,
	HEARTS,
	DIAMONDS
};

enum CardValue : unsigned int{
	JACK = 11,
	QUEEN,
	KING,
	ACE
};

class Card{
	unsigned int m_value;
	unsigned int m_suite;
	
	public:
	Card(int value, int suite);
	unsigned int getValue()const;
	unsigned int getSuite()const;
	
	friend std::ostream &operator<<(std::ostream &os, const Card &card);
};
#endif