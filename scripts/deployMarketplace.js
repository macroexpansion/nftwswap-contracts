const { ethers, network } = require('hardhat')
const fs = require('fs')

const deploy = async () => {
    const [signer, Market] = await Promise.all([
        ethers.getSigner(),
        ethers.getContractFactory('NFTMarketplace'),
    ])
    const market = await Market.deploy(signer.address, 50)
    await market.deployed()

    let fo = JSON.parse(fs.readFileSync(`${network.name}_address.json`))
    fo.marketplaceAddress = market.address
    fs.writeFileSync(
        `${network.name}_address.json`,
        JSON.stringify(fo, null, 4)
    )

    console.log('Contract deploy to a address:', market.address)
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
