#include "../headers/deck.hpp"
#include "../headers/card.hpp"
#include <algorithm>
#include <random>
#include <chrono>

Deck::Deck(){
	for(unsigned int suite = SPADES; suite <= DIAMONDS; ++suite){
		for(unsigned int value = 2; value <= ACE; ++value){
			m_cards.push_back(Card(value, suite));
		}
	}
}

void Deck::shuffle(){
	std::default_random_engine e(std::chrono::system_clock::now().time_since_epoch().count());
	std::shuffle(m_cards.begin(), m_cards.end(), e);
}

bool Deck::generateHand(Hand &hand, unsigned int handSize){
	if(m_cardsOut + handSize == Deck::k_deckSize){
		return false;
	}

	for(unsigned int c = 0; c < handSize; ++c){
		hand.push_back(m_cards[c]);
		
	}
	
	std::sort(hand.begin(), hand.end(), [](const Card &a, const Card &b){return a.getValue() < b.getValue();});
	return true;
}

unsigned int Deck::cardsLeft()const{
	return k_deckSize - m_cardsOut;
}

std::ostream &operator<<(std::ostream &os, const Hand &hand){
	for(const Card &c : hand){
		os << c << std::endl;
	}
	
	return os;
}