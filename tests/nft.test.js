const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('NFT', () => {
    before('set up', async () => {
        this.nftAbi = require('../artifacts/contracts/NFT.sol/NFT.json').abi

        const ret = await Promise.all([
            ethers.getSigners(),
            ethers.getContractFactory('NFT'),
        ])
        this.signers = ret[0]
        this.NFT = ret[1]
    })

    it('deploy', async () => {
        const nftDeploy = await this.NFT.deploy()
        await nftDeploy.deployed()
        this.NFT = new ethers.Contract(
            nftDeploy.address,
            this.nftAbi,
            this.signers[0]
        )
    })

    it('mint once', async () => {
        const minted = await this.NFT.safeMint(this.signers[0].address, 'url')
        await minted.wait()

        const balance = await this.NFT.balanceOf(this.signers[0].address)
        expect(balance.toString()).to.equal('1')

        for (let i = 0; i < balance; i++) {
            const tokenId = await this.NFT.tokenOfOwnerByIndex(
                this.signers[0].address,
                i
            )
            const uri = await this.NFT.tokenURI(tokenId)
            expect(uri).to.equal('url')
        }
    })
})
