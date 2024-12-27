// pragma solidity ^0.8.0;

// import "hardhat/console.sol";

// contract SportsBetting {
//     struct Bet {
//         address bettor;
//         uint256 amount;
//         uint256 outcome;
//     }

//     struct Match {
//         string eventId;
//         uint256[] outcomes;
//         uint256 winningOutcome;
//         bool resolved;
//     }

//     address public owner;
//     mapping(string => Match) public matches;
//     mapping(string => Bet[]) public bets;

//     constructor() {
//         owner = msg.sender;
//     }

//     receive() external payable {}
//     fallback() external payable {}

//     modifier onlyOwner() {
//         require(msg.sender == owner, "Not authorized");
//         _;
//     }

//     function addMatch(string memory eventId, uint256[] memory outcomes) public onlyOwner {
//         require(matches[eventId].outcomes.length == 0, "Match already exists");
//         matches[eventId] = Match(eventId, outcomes, 0, false);
//     }

//     function placeBet(string memory eventId, uint256 outcome) public payable {
//         console.log("Placing a bet for %s", msg.value);
//         require(msg.value > 0, "Bet amount must be greater than zero");
//         Match storage matchDetails = matches[eventId];
//         require(matchDetails.outcomes.length > 0, "Match does not exist");
//         require(!matchDetails.resolved, "Match already resolved");

//         bool validOutcome = false;
//         for (uint256 i = 0; i < matchDetails.outcomes.length; i++) {
//             if (matchDetails.outcomes[i] == outcome) {
//                 validOutcome = true;
//                 break;
//             }
//         }
//         require(validOutcome, "Invalid outcome");

//         bets[eventId].push(Bet(msg.sender, msg.value, outcome));
//     }

//     function resolveMatch(string memory eventId, uint256 winningOutcome) public onlyOwner {
//         Match storage matchDetails = matches[eventId];
//         require(!matchDetails.resolved, "Match already resolved");

//         matchDetails.winningOutcome = winningOutcome;
//         matchDetails.resolved = true;
//     }

//     function claimWinnings(string memory eventId) public {
//         Bet[] storage matchBets = bets[eventId];
//         Match storage matchDetails = matches[eventId];
//         require(matchDetails.resolved, "Match not resolved");

//         uint256 totalReward = 0;
//         for (uint256 i = 0; i < matchBets.length; i++) {
//             if (
//                 matchBets[i].bettor == msg.sender &&
//                 matchBets[i].outcome == matchDetails.winningOutcome
//             ) {
//                 totalReward += matchBets[i].amount * 2; // Double the bet as reward
//                 matchBets[i].amount = 0; // Prevent re-claiming
//             }
//         }

//         require(totalReward > 0, "No winnings to claim");
//         console.log("Transferring reward for a bet for %s", totalReward);
//         payable(msg.sender).transfer(totalReward);
//     }
// }

// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "hardhat/console.sol";

// contract SportsBetting {
//     struct Bet {
//         address bettor;
//         uint256 amount;
//         uint256 outcome;
//     }

//     struct Match {
//         string eventId;
//         uint256[] outcomes;
//         uint256 winningOutcome;
//         bool resolved;
//     }

//     address public owner;
//     mapping(string => Match) public matches;
//     mapping(string => Bet[]) public bets;

//     constructor() {
//         owner = msg.sender;
//     }

//     receive() external payable {}
//     fallback() external payable {}

//     modifier onlyOwner() {
//         require(msg.sender == owner, "Not authorized");
//         _;
//     }

//     // Add a new match
//     function addMatch(string memory eventId, uint256[] memory outcomes) public onlyOwner {
//         require(matches[eventId].outcomes.length == 0, "Match already exists");
//         matches[eventId] = Match(eventId, outcomes, 0, false);
//     }

//     // Place a bet on a match
//     function placeBet(string memory eventId, uint256 outcome) public payable {
//         console.log("Placing a bet for %s", msg.value);
//         require(msg.value > 0, "Bet amount must be greater than zero");
//         Match storage matchDetails = matches[eventId];
//         require(matchDetails.outcomes.length > 0, "Match does not exist");
//         require(!matchDetails.resolved, "Match already resolved");

//         bool validOutcome = false;
//         for (uint256 i = 0; i < matchDetails.outcomes.length; i++) {
//             if (matchDetails.outcomes[i] == outcome) {
//                 validOutcome = true;
//                 break;
//             }
//         }
//         require(validOutcome, "Invalid outcome");

//         bets[eventId].push(Bet(msg.sender, msg.value, outcome));
//     }

//     // Resolve the match with the winning outcome
//     function resolveMatch(string memory eventId, uint256 winningOutcome) public onlyOwner {
//         Match storage matchDetails = matches[eventId];
//         require(!matchDetails.resolved, "Match already resolved");

//         matchDetails.winningOutcome = winningOutcome;
//         matchDetails.resolved = true;
//     }

//     // Claim winnings based on bet outcome
//     function claimWinnings(string memory eventId) public {
//         Bet[] storage matchBets = bets[eventId];
//         Match storage matchDetails = matches[eventId];
//         require(matchDetails.resolved, "Match not resolved");

//         uint256 totalReward = 0;
//         for (uint256 i = 0; i < matchBets.length; i++) {
//             if (
//                 matchBets[i].bettor == msg.sender &&
//                 matchBets[i].outcome == matchDetails.winningOutcome
//             ) {
//                 totalReward += matchBets[i].amount * 2; // Double the bet as reward
//                 matchBets[i].amount = 0; // Prevent re-claiming
//             }
//         }

//         require(totalReward > 0, "No winnings to claim");
//         console.log("Transferring reward for a bet for %s", totalReward);
//         payable(msg.sender).transfer(totalReward);
//     }
// }

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract SportsBetting {
    struct Bet {
        address bettor;
        uint256 amount;
        uint256 outcome;
    }

    struct Match {
        string eventId;
        uint256[] outcomes;
        uint256 winningOutcome;
        bool resolved;
    }

    address public owner;
    mapping(string => Match) public matches;
    mapping(string => Bet[]) public bets;
    string[] public eventIds; // New array to track event IDs


     constructor() payable { // Mark the constructor as payable
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Add a new match
    function addMatch(
        string memory eventId,
        uint256[] memory outcomes
    ) public onlyOwner {
        require(matches[eventId].outcomes.length == 0, "Match already exists");
        matches[eventId] = Match(eventId, outcomes, 0, false);
        eventIds.push(eventId); // Track the event ID
    }

    // Get all tracked event IDs
    function getTrackedMatchIds() public view returns (string[] memory) {
        return eventIds;
    }

    // Place a bet on a match
    function placeBet(string memory eventId, uint256 outcome) public payable {
        require(msg.value > 0, "Bet amount must be greater than zero");
        Match storage matchDetails = matches[eventId];
        require(matchDetails.outcomes.length > 0, "Match does not exist");
        require(!matchDetails.resolved, "Match already resolved");

        bool validOutcome = false;
        for (uint256 i = 0; i < matchDetails.outcomes.length; i++) {
            if (matchDetails.outcomes[i] == outcome) {
                validOutcome = true;
                break;
            }
        }
        require(validOutcome, "Invalid outcome");

        bets[eventId].push(Bet(msg.sender, msg.value, outcome));
    }

    // Resolve the match with the winning outcome
    function resolveMatch(
        string memory eventId,
        uint256 winningOutcome
    ) public onlyOwner {
        Match storage matchDetails = matches[eventId];
        require(!matchDetails.resolved, "Match already resolved");

        matchDetails.winningOutcome = winningOutcome;
        matchDetails.resolved = true;
    }

    function getMatchDetails(
        string memory eventId
    ) public view returns (Match memory, Bet[] memory) {
        return (matches[eventId], bets[eventId]);
    }

    // Claim winnings
    function claimWinnings(string memory eventId) public {
        Bet[] storage matchBets = bets[eventId];
        Match storage matchDetails = matches[eventId];

        console.log('claiming winnings for %s', msg.sender);
        //require(matchDetails.resolved, "Match not resolved");

        uint256 totalReward = 0;
        for (uint256 i = 0; i < matchBets.length; i++) {
            if (
                matchBets[i].bettor == msg.sender &&
                matchBets[i].outcome == matchDetails.winningOutcome
            ) {
                totalReward += matchBets[i].amount * 2; // Double the bet as reward
                console.log('%betted: %s', matchBets[i].amount);
                console.log('claimed: %s', totalReward);
                matchBets[i].amount = 0; // Prevent re-claiming
            }
        }

        
        require(totalReward > 0, "No winnings to claim");
        payable(msg.sender).transfer(totalReward);
    }
}
