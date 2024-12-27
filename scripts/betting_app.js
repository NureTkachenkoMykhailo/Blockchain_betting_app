const { ethers } = require("hardhat");
const axios = require("axios");
const readline = require("readline");

// Configuration
const SPORTS_BETTING_CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Replace with your contract address
const API_URL = "https://api-football-v1.p.rapidapi.com/v3/fixtures";
const API_KEY = "8f0e08fd39msh99bb6126581fc70p149c27jsn84fcf993c72f";
const POLLING_INTERVAL = 30 * 1000; // Poll every 30 seconds

// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Helper function to ask questions in the console
function askQuestion(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

// Fetch match information from the contract and API
async function displayMatches(contract) {
    console.log("\nFetching matches from the contract...");

    try {
        // Fetch match IDs using the updated contract method
        const matchIds = await contract.getTrackedMatchIds();

        if (matchIds.length === 0) {
            console.log("No matches available.");
            return;
        }

        // Fetch live data from the API
        const response = await axios.get(API_URL, {
            headers: {
                "x-rapidapi-key": API_KEY,
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            },
            params: { live: "all" },
        });

        const matches = response.data.response;

        console.log("\nAvailable Matches:");

        for (const matchId of matchIds) {
            const match = matches.find((m) => m.fixture.id.toString() === matchId);

            if (!match) {
                console.log(`Match ID: ${matchId} - No live data available.`);
                continue;
            }

            const homeWinner = match.teams.home.winner == true;
            const awayWinner = match.teams.away.winner == true;
            const ongoing = !homeWinner && !awayWinner;

            console.log(`\nMatch ID: ${matchId}`);
            console.log(`${match.fixture.venue.city} ${match.fixture.venue.name}`)
            console.log(`${match.league.name} ${match.league.round} [${match.league.country}]`)
            console.log(`${match.teams.home.name} ${match.goals.home} : ${match.goals.away} ${match.teams.away.name}`);
            console.log(`Status: ${ongoing ? `${match.fixture.status.long}`:  homeWinner ? match.teams.home.name : match.teams.away.name }`);
        }
    } catch (error) {
        console.error("Error fetching match data:", error.message);
    }
}


// Function to place a bet
async function placeBet(contract) {
    const eventId = await askQuestion("Enter Event ID: ");
    const outcome = await askQuestion("Enter Outcome to bet on (e.g., 1 for Home, 2 for Away): ");
    const betAmount = await askQuestion("Enter Bet Amount in ETH: ");
    
    // Parse the bet amount to wei
    const betAmountEther = ethers.parseEther(betAmount);
    console.log(`Betting: ${betAmountEther.toString()} wei`);

    try {
        const tx = await contract.placeBet(eventId, outcome, {
            value: betAmountEther, // Pass the parsed amount directly
        });
        console.log("Placing bet... Waiting for confirmation...");
        await tx.wait();
        console.log("Bet placed successfully!");
    } catch (error) {
        console.error("Error placing bet:", error.message);
    }
}

// Function to claim winnings
async function claimWinnings(contract) {
    const eventId = await askQuestion("Enter Event ID: ");
    const matchDetails = await contract.getMatchDetails(eventId);
    console.log("Match Details:", matchDetails);
    try {
        const tx = await contract.claimWinnings(eventId);
        console.log("Claiming winnings... Waiting for confirmation...");
        await tx.wait();
        console.log("Winnings claimed successfully!");
    } catch (error) {
        console.error("Error claiming winnings:", error.message);
    }
}

// Main bettor menu
async function bettorMenu(contract) {
    while (true) {
        console.log("\nChoose an action:");
        console.log("1. View Available Matches");
        console.log("2. Place a Bet");
        console.log("3. Claim Winnings");
        console.log("4. Exit");

        const action = await askQuestion("Enter your choice (1-4): ");

        if (action === "1") {
            await displayMatches(contract);
        } else if (action === "2") {
            await placeBet(contract);
        } else if (action === "3") {
            await claimWinnings(contract);
        } else if (action === "4") {
            console.log("Exiting...");
            rl.close();
            break;
        } else {
            console.log("Invalid choice. Please try again.");
        }
    }
}

// Main function
async function main() {
    console.log("Welcome to the Sports Betting Client App!");

    // Ask for private key
    const privateKey = await askQuestion("Enter your private key: ");

    // Connect to the contract
    const provider = new ethers.JsonRpcProvider("http://localhost:8545"); // Replace with your network provider
    let wallet;
    try {
        wallet = new ethers.Wallet(privateKey, provider);
    } catch (error) {
        console.error("Invalid private key:", error.message);
        rl.close();
        return;
    }

    const contract = await ethers.getContractAt("SportsBetting", SPORTS_BETTING_CONTRACT_ADDRESS, wallet);

    console.log(`Connected to SportsBetting Contract at ${SPORTS_BETTING_CONTRACT_ADDRESS}`);
    console.log(`Logged in as: ${wallet.address}`);

    await bettorMenu(contract);
}

// Execute the script
main().catch((error) => {
    console.error("Error:", error.message);
    rl.close();
});
