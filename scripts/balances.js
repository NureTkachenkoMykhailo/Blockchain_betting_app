const { ethers } = require("hardhat");

async function main() {
    const accounts = await ethers.getSigners(); // Await the promise to get signers
    const provider = ethers.provider;

    for (const account of accounts) {
        const balance = await provider.getBalance(account.address); // Await the promise to get balance
        console.log(
            "%s (%s ETH)", // Use %s for string formatting
            account.address,
            ethers.formatEther(balance) // Use ethers.utils.formatEther to format the balance
        );
    }
}

// Call the main function and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });