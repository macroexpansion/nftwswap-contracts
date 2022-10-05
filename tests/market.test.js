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

        this.seller = this.signers[0]
        this.buyer = this.signers[1]
    })

    it('deploy', async () => {
        const marketDeploy = await this.Market.deploy(this.seller.address, 50)
        await marketDeploy.deployed()
        this.Market = new ethers.Contract(
            marketDeploy.address,
            this.marketAbi,
            this.seller
        )

        const nftDeploy = await this.NFT.deploy()
        await nftDeploy.deployed()
        this.NFT = new ethers.Contract(
            nftDeploy.address,
            this.nftAbi,
            this.seller
        )

        this.Token = await this.Token.connect(this.buyer)
        const tokenDeploy = await this.Token.deploy()
        await tokenDeploy.deployed()
        this.Token = new ethers.Contract(
            tokenDeploy.address,
            this.tokenAbi,
            this.buyer
        )
    })

    it('mint token', async () => {
        const balance = await this.Token.balanceOf(this.buyer.address)
        expect(balance.toString()).to.equal('5000000000000000000000000')
    })

    it('mint nft', async () => {
        for (let i = 0; i < 3; i++) {
            const minted = await this.NFT.safeMint(this.seller.address, 'url')
            await minted.wait()

            const balance = await this.NFT.balanceOf(this.seller.address)
            expect(balance.toString()).to.equal(`${i + 1}`)
        }
    })

    it('approve nft for market', async () => {
        for (let i = 0; i < 3; i++) {
            const approved = await this.NFT.approve(this.Market.address, i)
            await approved.wait()
            const address = await this.NFT.getApproved(i)

            expect(address).to.equal(this.Market.address)
        }
    })

    it('add pay token', async () => {
        const added = await this.Market.addPayableToken(this.Token.address)
        await added.wait()
        const payableTokens = await this.Market.getPayableTokens()
        expect(payableTokens[0]).to.equal(this.Token.address)
    })

    it('listing 2 nfts', async () => {
        for (let i = 0; i < 2; i++) {
            const listed = await this.Market.listItem(
                this.NFT.address,
                i,
                this.Token.address,
                ethers.utils.parseEther('11111')
            )
            await listed.wait()
        }

        const listedNft = await this.Market.getListedItem(this.NFT.address, 0)
        expect(listedNft.nft).to.equal(this.NFT.address)
        expect(listedNft.tokenId).to.equal(0)
        expect(listedNft.seller).to.equal(this.seller.address)
        expect(listedNft.payToken).to.equal(this.Token.address)
        expect(listedNft.price.toString()).to.equal(
            ethers.utils.parseEther('11111')
        )
        expect(listedNft.sold).to.equal(false)
    })

    it('buy nft', async () => {
        const token = await this.Token.connect(this.buyer)
        const approved = await token.approve(
            this.Market.address,
            ethers.utils.parseEther('11111')
        )
        await approved.wait()

        const market = await this.Market.connect(this.buyer)
        const bought = await market.buyItem(
            this.NFT.address,
            0,
            this.Token.address
        )
        await bought.wait()

        const balance = await this.Token.balanceOf(this.seller.address)
        expect(balance).to.equal('11111000000000000000000')

        const numNft = await this.NFT.balanceOf(this.buyer.address)
        expect(numNft.toString()).to.equal('1')
    })

    it('cancel listing', async () => {
        const market = await this.Market.connect(this.seller)
        const canceled = await market.cancelListedItem(this.NFT.address, 1)
        await canceled.wait()

        /* const listedNft = await market.getListedItem(this.NFT.address, 1)
		console.log(listedNft) */
    })

    it('create auction', async () => {
        const startTime = Math.floor(Date.now() / 1000)
        const market = await this.Market.connect(this.seller)
        const auction = await market.createAuction(
            this.NFT.address,
            2,
            this.Token.address,
            ethers.utils.parseEther('10'),
            ethers.utils.parseEther('10'),
            startTime,
            startTime + 20
        )
        await auction.wait()
    })

    it('bid auction', async () => {
        const token = await this.Token.connect(this.buyer)
        const approved = await token.approve(
            this.Market.address,
            ethers.utils.parseEther('20')
        )
        await approved.wait()

        const market = await this.Market.connect(this.buyer)
        const bid = await market.bidAuction(
            this.NFT.address,
            2,
            ethers.utils.parseEther('20')
        )
        await bid.wait()
    })

    it('result auction', async () => {
        const market = await this.Market.connect(this.buyer)
        const won = await market.resultAuction(this.NFT.address, 2)
        await won.wait()

        const balance = await this.Token.balanceOf(this.seller.address)
        expect(balance).to.equal('11131000000000000000000')

        const numNft = await this.NFT.balanceOf(this.buyer.address)
        expect(numNft.toString()).to.equal('2')
    })
})
