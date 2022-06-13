#include "../headers/card.hpp"

Card::Card(int value, int suite){
	m_value = value;
	m_suite = suite;
}

unsigned int Card::getValue()const{
	return m_value;
}

unsigned int Card::getSuite()const{
	return m_suite;
}

std::ostream &operator<<(std::ostream &os, const Card &card){
	if(card.m_value < JACK){
		os << card.m_value;
	}
	else{
		switch(card.m_value){
			case JACK:
			os << "Jack";
			break;
			
			case QUEEN:
			os << "Queen";
			break;
			
			case KING:
			os << "King";
			break;
			
			case ACE:
			os << "Ace";
			break;
			
			default:
			os << "Undefined";
		}
	}
	
	os << " of ";
	
	switch(card.m_suite){
		case SPADES:
		os << "Spades";
		break;
		
		case DIAMONDS:
		os << "Diamonds";
		break;
		
		case CLUBS:
		os << "Clubs";
		break;
		
		case HEARTS:
		os << "Hearts";
		break;
		
		default:
		os << "Undefined";
	}
	
	return os;
}