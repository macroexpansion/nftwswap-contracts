const { ethers, network } = require('hardhat')
const fs = require('fs')

const deploy = async () => {
    const NFT = await ethers.getContractFactory('NFT')
    const nft = await NFT.deploy()
    await nft.deployed()

    let fo = JSON.parse(fs.readFileSync(`${network.name}_address.json`))
    fo.nftAddress = nft.address
    fs.writeFileSync(
        `${network.name}_address.json`,
        JSON.stringify(fo, null, 4)
    )

    console.log('Contract deploy to a address:', nft.address)
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
