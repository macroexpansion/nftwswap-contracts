const { ethers, network } = require('hardhat')
const fs = require('fs')

const deploy = async () => {
    const Token = await ethers.getContractFactory('Token')
    const token = await Token.deploy()
    await token.deployed()

    let fo = JSON.parse(fs.readFileSync(`${network.name}_address.json`))
    fo.tokenAddress = token.address
    fs.writeFileSync(
        `${network.name}_address.json`,
        JSON.stringify(fo, null, 4)
    )

    console.log('Contract deploy to a address:', token.address)
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
