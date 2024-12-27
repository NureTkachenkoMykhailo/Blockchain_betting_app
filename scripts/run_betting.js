const axios = require("axios");
const { ethers } = require("hardhat");

const API_URL = "https://api-football-v1.p.rapidapi.com/v3/fixtures";
const API_KEY = "8f0e08fd39msh99bb6126581fc70p149c27jsn84fcf993c72f";
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const POLLING_INTERVAL = 30000;
const TO_BE_DETERMINED = 'TBD';

function isMatchFinished(match){
    const matchId = match.fixture.id.toString();
    let homeWinner = match.teams.home.winner;
    let awayWinner = match.teams.away.winner;
    if (homeWinner === null){
        homeWinner = TO_BE_DETERMINED
    }
    if (awayWinner === null){
        awayWinner = TO_BE_DETERMINED
    }

    return  homeWinner !== null && 
            homeWinner !== TO_BE_DETERMINED && 
            awayWinner !== TO_BE_DETERMINED && 
            homeWinner !== undefined &&
            awayWinner !== null && 
            awayWinner !== undefined
}

async function longPollingTask() {
    // Set up provider and contract
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Update RPC URL
    const [deployer] = await ethers.getSigners();
    const SportsBetting = await ethers.getContractFactory("SportsBetting");
    const sportsBetting = SportsBetting.attach(CONTRACT_ADDRESS);

    while (true) {
        try {
            console.log("Fetching live match data...");
            const response = await axios.get(API_URL, {
                headers: { 
                    "x-rapidapi-key": API_KEY, 
                    "x-rapidapi-host" : "api-football-v1.p.rapidapi.com"
                },
                params: { live: 'all' }
            });

            const matches = response.data.response;

            console.log(`Retrieved ${matches.length} matches`);

            for (const match of matches) {
                const matchId = match.fixture.id.toString();
                let homeWinner = match.teams.home.winner;
                let awayWinner = match.teams.away.winner;
                if (homeWinner === null){
                    homeWinner = TO_BE_DETERMINED
                }
                if (awayWinner === null){
                    awayWinner = TO_BE_DETERMINED
                }
                console.log(`match to be held at: ${match.fixture.date}`)
                console.log(matchId + " home winner value: " + homeWinner)
                console.log(matchId + " away winner value: " + awayWinner)

                if (isMatchFinished(match)) {
                    console.log(`home winner: ${homeWinner}`)
                    // Determine winning outcome
                    const winningOutcome = homeWinner ? 1 : 2; // Assume 1 for home, 2 for away
                    // Check if the match is already resolved on-chain
                    const matchDetails = await sportsBetting.matches(matchId);
                    if (!matchDetails.resolved) {
                        console.log(`Resolving match ${matchId} with outcome ${winningOutcome}...`);
                        const tx = await sportsBetting.connect(deployer).resolveMatch(matchId, winningOutcome);
                        await tx.wait();
                        console.log(`Match ${matchId} resolved successfully.`);
                    } else {
                        console.log(`Match ${matchId} already resolved.`);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching or updating match data:", error);
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    }
}



longPollingTask();
