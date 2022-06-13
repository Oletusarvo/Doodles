#include "cards.hpp"
#include <iostream>

int main(){
    const unsigned int suite = CardSuite::SPADES;

    Hand hand({Card(9, suite), Card(11, suite), Card(11, suite - 1), Card(9, suite), Card(13, suite)});
    std::cout << hand;

    std::cout.setf(std::ostream::boolalpha);
    unsigned int value = HandAnalyzer(hand).getHandInfo().value;
    std::cout << "Hand value: " << handValueToString(HandAnalyzer(hand).getHandInfo().value);
    return 0;
}