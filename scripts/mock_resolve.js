const { ethers } = require("hardhat");
const readline = require("readline");
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function mockResolveMatch(matchId, winningOutcome) {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const [deployer] = await ethers.getSigners();
    const SportsBetting = await ethers.getContractFactory("SportsBetting");
    const sportsBetting = SportsBetting.attach(CONTRACT_ADDRESS);

    try {
        console.log(`Mock resolving match ${matchId} with outcome ${winningOutcome}...`);
        const tx = await sportsBetting.connect(deployer).resolveMatch(matchId, winningOutcome);
        await tx.wait();
        console.log(`Match ${matchId} resolved successfully with outcome ${winningOutcome}.`);
    } catch (error) {
        console.error("Error resolving match:", error);
    }
}

// Function to prompt user for input
function promptUser () {
    rl.question("Enter the match ID: ", (matchId) => {
        rl.question("Enter the winning outcome (1 for home win, 2 for away win): ", (outcome) => {
            const winningOutcome = parseInt(outcome);
            if (winningOutcome === 1 || winningOutcome === 2) {
                mockResolveMatch(matchId, winningOutcome);
            } else {
                console.log("Invalid winning outcome. Please enter 1 or 2.");
            }
            rl.close();
        });
    });
}

promptUser ();