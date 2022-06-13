#include "../headers/handanalyzer.hpp"
#include "../headers/card.hpp"
#include <algorithm>

HandAnalyzer::HandAnalyzer(const Hand &hand){
    m_hand = hand;
    std::sort(m_hand.begin(), m_hand.end(), [](const Card &a, const Card &b){
        return a.getValue() < b.getValue();
    });

    for(const Card &c : m_hand){
        unsigned int value = c.getValue();
        unsigned int suite = c.getSuite();

        m_cardCount[value - 2]++;
        m_suiteCount[suite]++;
    }
}

unsigned int HandAnalyzer::getHandSize()const{
    return m_hand.size();
}

bool HandAnalyzer::isRoyalFlush()const{

    //A royal flush begins with a 10.
    if(m_hand[0].getValue() != 10){
        return false;
    }

    for(unsigned int i = 1; i < m_hand.size(); ++i){
        const Card &previousCard = m_hand[i - 1];
        const Card &currentCard = m_hand[i];

        //All cards have to be of the same suite and consequtive cards need to be of one higher value than the previous.
        if(currentCard.getSuite() != previousCard.getSuite()){
            return false;
        }

        if(currentCard.getValue() != previousCard.getValue() + 1){
            return false;
        }
    }

    return true;
}

bool HandAnalyzer::isStraightFlush()const{
    return isStraight() && isFlush();
}

bool HandAnalyzer::isFourOfAKind()const{
    for(unsigned int c : m_cardCount){
        if(c == 4){
            return true;
        }
    }
    
    return false;
}

bool HandAnalyzer::isThreeOfAKind()const{
    for(unsigned int c : m_cardCount){
        if(c == 3){
            return true;
        }
    }
    
    return false;
}

bool HandAnalyzer::isTwoOfAKind()const{
    for(unsigned int c : m_cardCount){
        if(c == 2){
            return true;
        }
    }
    
    return false;
}

bool HandAnalyzer::isTwoPair()const{
    unsigned int pairCount = 0;

    for(unsigned int i : m_cardCount){
        if(i == 2){
            pairCount++;
        }
    }

    return pairCount == 2;
}

bool HandAnalyzer::isStraight()const{

    for(unsigned int i = 1; i < m_hand.size(); ++i){
        const Card &previousCard = m_hand[i - 1];
        const Card &currentCard = m_hand[i];

        if(currentCard.getValue() != previousCard.getValue() + 1){
            return false;
        }
    }

    return true;
}

bool HandAnalyzer::isFlush()const{

    for(unsigned int i = 1; i < m_hand.size(); ++i){
        const Card &previousCard = m_hand[i - 1];
        const Card &currentCard = m_hand[i];

        if(previousCard.getSuite() != currentCard.getSuite()){
            return false;
        }
    }

    return true;
}

bool HandAnalyzer::isFullHouse()const{
    return isThreeOfAKind() && isTwoOfAKind();
}

HandInfo HandAnalyzer::getHandInfo()const{

    HandInfo info = {0};

    if(isRoyalFlush()){
        info.value = ROYAL_FLUSH;
        info.high = CardValue::ACE;
    }
    else if(isStraightFlush()){
        info.value = STRAIGHT_FLUSH;
        info.high = m_hand.back().getValue();
    }
    else if(isFourOfAKind()){
        info.value = FOUR_OF_A_KIND;
        info.high = m_hand.back().getValue();

        //Find which card there is four of.
        for(unsigned int i = 0; i < m_hand.size(); ++i){
            const unsigned int cardValue = m_hand[i].getValue();
            if(m_cardCount[cardValue - 2] == 4){
                info.rparam = cardValue;
                break;
            }
        }
    }
    else if(isFullHouse()){
        info.value = FULL_HOUSE;
        info.high = m_hand.back().getValue();

        for(const Card &c : m_hand){
            unsigned int value = c.getValue();
            unsigned int count = m_cardCount[value - 2];

            if(count == 2){
                info.rparam = value;
            }
            else if(count == 3){
                info.lparam = value;
            }
        }
    }
    else if(isFlush()){
        info.value = FLUSH;
        info.high = m_hand.back().getValue();
        info.rparam = m_hand.back().getSuite();
    }
    else if(isStraight()){
        info.value = STRAIGHT;
        info.high = m_hand.back().getValue();
    }
    else if(isThreeOfAKind()){
        info.value = THREE_OF_A_KIND;
        info.high = m_hand.back().getValue();

        for(const Card &c : m_hand){
            unsigned int value = c.getValue();
            unsigned int count = m_cardCount[value - 2];

            if(count == 3){
                info.rparam = value;
                break;
            }
        }
    }
    else if(isTwoPair()){
        info.value = TWO_PAIR;
        info.high = m_hand.back().getValue();

        for(const Card &c : m_hand){
            unsigned int value = c.getValue();
            unsigned int count = m_cardCount[value - 2];

            if(count == 2 && info.rparam != 0){
                info.rparam = value;
            }
            else{
                info.lparam = value;
                break;
            }
        }
    }
    else if(isTwoOfAKind()){
        info.value = TWO_OF_A_KIND;
        info.high = m_hand.back().getValue();

        for(const Card &c : m_hand){
            unsigned int value = c.getValue();
            unsigned int count = m_cardCount[value - 2];

            if(count == 2){
                info.rparam = value;
                break;
            }
        }
    }
    else{
        info.value = HIGH;
        info.rparam = m_hand.back().getValue();
    }
    

    return info;
}

const char *handValueToString(unsigned int value){
    switch(value){
        case HIGH:
        return "High";

        case TWO_OF_A_KIND:
        return "Two of a kind";

        case TWO_PAIR:
        return "Two pair";

        case THREE_OF_A_KIND:
        return "Three of a kind";

        case STRAIGHT:
        return "Straight";

        case FLUSH:
        return "Flush";

        case FULL_HOUSE:
        return "Full house";

        case FOUR_OF_A_KIND:
        return "Four of a kind";

        case STRAIGHT_FLUSH:
        return "Straight flush";

        case ROYAL_FLUSH:
        return "Royal flush";

        default:
        return "Undefined";
    }
}

std::ostream &operator<<(std::ostream &os, const HandInfo &info){
    const char *stringValue = handValueToString(info.value);
    os << "Value: " << stringValue;

    if(info.value == STRAIGHT_FLUSH){
        os << " High: " << info.high;
    }
    else if(info.value == FOUR_OF_A_KIND){
        os << " Cards: " << info.rparam;
    }
    else if(info.value == FULL_HOUSE){
        os << " Cards: Three: " << info.rparam << " Two: " << info.lparam;
    }
    else if(info.value == FLUSH){
        os << " High: " << info.high;
    }
    else if(info.value == STRAIGHT){
        os << " High: " << info.high;
    }
    else if(info.value == THREE_OF_A_KIND){
        os << " Card: " << info.rparam;
    }
    else if(info.value == TWO_PAIR){
        os << " Cards: " << info.rparam << " and " << info.lparam;
    }
    else if(info.value == TWO_OF_A_KIND){
        os << " Card: " << info.rparam;
    }
    else if(info.value == HIGH){
        os << " Card: " << info.high;
    }

    return os;
}