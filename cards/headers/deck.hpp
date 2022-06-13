#ifndef DECK_HPP_
#define DECK_HPP_
#include <vector>
#include <iostream>

const unsigned int k_handSize = 5;

class Card;

typedef std::vector<Card> Hand;

class Deck{
	std::vector<Card> m_cards;
	unsigned int m_cardsOut;
	static const unsigned int k_deckSize = 52;

	public:
	Deck();
	void 			shuffle();
	bool 			generateHand(Hand &, unsigned int);
	unsigned int 	cardsLeft()const;
};

std::ostream &operator<<(std::ostream &os, const Hand &);
#endif