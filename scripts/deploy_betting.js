const { ethers } = require("hardhat");
const axios = require("axios");

const API_URL = "https://api-football-v1.p.rapidapi.com/v3/fixtures";
const API_KEY = "8f0e08fd39msh99bb6126581fc70p149c27jsn84fcf993c72f";

async function main() {
    // Get the contract factory and deploy the contract
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const SportsBetting = await ethers.getContractFactory("SportsBetting");
    const initialEther = ethers.parseEther("3.0");
    const sportsBetting = await SportsBetting.deploy({value: initialEther });

    const response = await axios.get(API_URL, {
        headers: { 
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host" : "api-football-v1.p.rapidapi.com"
        },
        params: { live: "all" }
    });

    const events = response.data.response.slice(0, 5); // Get the first 5 events
    for (const event of events) {
        const eventId = event.fixture.id.toString();
        const outcomes = [1, 2]; // Assuming outcomes: 1 for home, 2 for away
        console.log(`Adding match: ${eventId} with outcomes: ${outcomes}`);
        const tx = await sportsBetting.addMatch(eventId, outcomes);
        await tx.wait();
        console.log(`Match ${eventId} added successfully.`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

    