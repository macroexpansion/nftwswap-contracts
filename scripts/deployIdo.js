const { ethers, network } = require('hardhat')
const fs = require('fs')

const DAY = 60 * 60 * 24 * 1000

const deploy = async () => {
    let fo = JSON.parse(fs.readFileSync(`${network.name}_address.json`))

    const [signer, IDO] = await Promise.all([
        ethers.getSigner(),
        ethers.getContractFactory('IDO'),
    ])
    const ido = await IDO.deploy(
        fo.tokenAddress,
        fo.usdtAddress,
        signer.address,
        1665648000 - DAY, // start buy time
        1665820800, // end buy time
        1665648000 - DAY, // claim time
        1665648000 - DAY // cliff time
    )
    await ido.deployed()

    fo.idoAddress = ido.address
    fs.writeFileSync(
        `${network.name}_address.json`,
        JSON.stringify(fo, null, 4)
    )

    console.log('Contract deploy to a address:', ido.address)
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
