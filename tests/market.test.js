const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Market', () => {
    before('set up', async () => {
        this.marketAbi =
            require('../artifacts/contracts/Market.sol/Market.json').abi
        this.nftAbi = require('../artifacts/contracts/NFT.sol/NFT.json').abi

        const ret = await Promise.all([
            ethers.getSigners(),
            ethers.getContractFactory('Market'),
            ethers.getContractFactory('NFT'),
        ])
        this.signers = ret[0]
        this.Market = ret[1]
        this.NFT = ret[2]
    })

    it('deploy', async () => {
        const marketDeploy = await this.Market.deploy()
        await marketDeploy.deployed()
        this.Market = new ethers.Contract(
            marketDeploy.address,
            this.marketAbi,
            this.signers[0]
        )

        const nftDeploy = await this.NFT.deploy()
        await nftDeploy.deployed()
        this.NFT = new ethers.Contract(
            nftDeploy.address,
            this.nftAbi,
            this.signers[0]
        )
    })

    it('mint nft', async () => {
        const minted = await this.NFT.safeMint(this.signers[0].address, 'url')
        await minted.wait()

        const balance = await this.NFT.balanceOf(this.signers[0].address)
        expect(balance.toString()).to.equal('1')
    })

    it('approve nft for market', async () => {
        const approved = await this.NFT.isApprovedForAll(
            this.signers[0].address,
            this.Market.address
        )
        if (!approved) {
            const setApproved = await this.NFT.setApprovalForAll(
                this.Market.address,
                true
            )
            await setApproved.wait()

            const approved = await this.NFT.approve(this.Market.address, 0)
            await approved.wait()
            const address = await this.NFT.getApproved(0)

            expect(address).to.equal(this.Market.address)
        }
    })

    it('market listing nft', async () => {
        const tokenId = 0
        const listed = await this.Market.listItem(
            this.NFT.address,
            tokenId,
            ethers.utils.parseEther('100')
        )
        await listed.wait()
    })

    it('get listing', async () => {
        const listing = await this.Market.getListing(this.Market.address, 0)
        console.log(listing)
    })
})
