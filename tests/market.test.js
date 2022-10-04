const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Market', () => {
    before('set up', async () => {
        this.marketAbi =
            require('../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json').abi
        this.nftAbi = require('../artifacts/contracts/NFT.sol/NFT.json').abi
        this.tokenAbi =
            require('../artifacts/contracts/Token.sol/Token.json').abi

        const ret = await Promise.all([
            ethers.getSigners(),
            ethers.getContractFactory('NFTMarketplace'),
            ethers.getContractFactory('NFT'),
            ethers.getContractFactory('Token'),
        ])
        this.signers = ret[0]
        this.Market = ret[1]
        this.NFT = ret[2]
        this.Token = ret[3]
    })

    it('deploy', async () => {
        const marketDeploy = await this.Market.deploy(
            this.signers[0].address,
            50
        )
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

        const tokenDeploy = await this.Token.deploy()
        await tokenDeploy.deployed()
        this.Token = new ethers.Contract(
            tokenDeploy.address,
            this.tokenAbi,
            this.signers[0]
        )
    })

    it('mint token', async () => {
        const balance = await this.Token.balanceOf(this.signers[0].address)
        expect(balance.toString()).to.equal('5000000000000000000000000')
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

    it('add pay token', async () => {
        const added = await this.Market.addPayableToken(this.Token.address)
        await added.wait()
        const payableTokens = await this.Market.getPayableTokens()
        expect(payableTokens[0]).to.equal(this.Token.address)
    })

    it('market listing nft', async () => {
        const listed = await this.Market.listNft(
            this.NFT.address,
            0,
            this.Token.address,
            ethers.utils.parseEther('11111')
        )
        await listed.wait()

        const listedNft = await this.Market.getListedNFT(this.NFT.address, 0)
        expect(listedNft.nft).to.equal(this.NFT.address)
        expect(listedNft.tokenId).to.equal(0)
        expect(listedNft.seller).to.equal(this.signers[0].address)
        expect(listedNft.payToken).to.equal(this.Token.address)
        expect(listedNft.price.toString()).to.equal(
            ethers.utils.parseEther('11111')
        )
        expect(listedNft.sold).to.equal(false)
    })

    it('', async () => {})
})
