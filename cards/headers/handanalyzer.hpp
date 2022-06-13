#ifndef HANDANALYZER_HPP_
#define HANDANALYZER_HPP_
#include "./deck.hpp"

enum HandValue : unsigned int{
	HIGH = 0,
	TWO_OF_A_KIND,
	TWO_PAIR,
	THREE_OF_A_KIND,
	STRAIGHT,
	FLUSH,
	FULL_HOUSE,
	FOUR_OF_A_KIND,
	STRAIGHT_FLUSH,
	ROYAL_FLUSH
};

struct HandInfo{
	unsigned int value;
	unsigned int high;
	unsigned int rparam;
	unsigned int lparam;
};

class HandAnalyzer{
	Hand m_hand;

	unsigned int m_cardCount[13] = {0};
	unsigned int m_suiteCount[4] = {0};
	
	public:
	HandAnalyzer(const Hand &);

	unsigned int getHandSize()const;
	bool isRoyalFlush()const;
	bool isFourOfAKind()const;
	bool isFullHouse()const;
	bool isFlush()const;
	bool isStraight()const;
	bool isThreeOfAKind()const;
	bool isTwoOfAKind()const;
	bool isTwoPair()const;

	HandInfo getHandInfo()const;
};

const char *handValueToString(unsigned int);
std::ostream &operator<<(std::ostream &, const HandInfo &);
#endif