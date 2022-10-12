const { expect } = require('chai')
const { ethers } = require('hardhat')

const formatEther = ethers.utils.formatEther
const parseEther = ethers.utils.parseEther

const DAY = 60 * 60 * 24

const UNLIMITED_ALLOWANCE =
    '115792089237316195423570985008687907853269984665640564039457584007913129639935'

describe('IDO', () => {
    before('set up', async () => {
        this.signers = await ethers.getSigners()
        this.Token = await ethers.getContractFactory('Token')
        this.IDO = await ethers.getContractFactory('IDO')

        this.tokenAbi =
            require('../artifacts/contracts/Token.sol/Token.json').abi
        this.idoAbi = require('../artifacts/contracts/IDO.sol/IDO.json').abi

        this.buyer = this.signers[0]
        this.ref = this.signers[1].address
    })

    it('deploy', async () => {
        const tokenDeploy = await this.Token.deploy()
        await tokenDeploy.deployed()

        const busdDeploy = await this.Token.deploy()
        await busdDeploy.deployed()

        const currentTime = Math.floor(Date.now() / 1000)
        const idoDeploy = await this.IDO.deploy(
            tokenDeploy.address,
            busdDeploy.address,
            this.buyer.address,
            currentTime - DAY * 1, // start buy time
            currentTime + DAY * 10, // end buy time
            currentTime - DAY * 1, // claim time
            currentTime - DAY * 1 // cliff time
        )
        await idoDeploy.deployed()

        this.token = new ethers.Contract(
            tokenDeploy.address,
            this.tokenAbi,
            this.buyer
        )

        this.busd = new ethers.Contract(
            busdDeploy.address,
            this.tokenAbi,
            this.buyer
        )

        this.ido = new ethers.Contract(
            idoDeploy.address,
            this.idoAbi,
            this.buyer
        )
    })

    it('transfer', async () => {
        const balance = await this.token.balanceOf(this.ido.address)
        // console.log(ethers.utils.formatEther(balance))
    })

    it('approval', async () => {
        const allowance = await this.token.allowance(
            this.buyer.address,
            this.ido.address
        )
        if (allowance.eq(ethers.BigNumber.from('0'))) {
            const tokenApproval = await this.token.approve(
                this.ido.address,
                UNLIMITED_ALLOWANCE
            )
            await tokenApproval.wait()
        }

        const busdAllowance = await this.busd.allowance(
            this.buyer.address,
            this.ido.address
        )
        if (busdAllowance.eq(ethers.BigNumber.from('0'))) {
            const busdApproval = await this.busd.approve(
                this.ido.address,
                UNLIMITED_ALLOWANCE
            )
            await busdApproval.wait()
        }
    })

    it('sale', async () => {
        const total = await this.ido.totalSale()
        const current = await this.ido.currentSale()
        const progress = await this.ido.progress()
        console.log({
            totalSale: formatEther(total),
            currentSale: formatEther(current),
            progress: formatEther(progress),
        })
    })

    it('buy', async () => {
        for (let i = 0; i < 2; i++) {
            let bought = await this.ido.buy(parseEther('500'), this.ref)
            await bought.wait()
        }

        const busdBalance = await this.busd.balanceOf(this.buyer.address)
        const user = await this.ido.userByAddress(this.buyer.address)
        const refs = await this.ido.getRefs()
        const refCount = await this.ido.refCount(refs[0])
        console.log({
            busdBalance: formatEther(busdBalance),
            buyAmount: formatEther(user.buyAmount),
            initVestingAmount: formatEther(user.initVestingAmount),
            initVestingDebt: formatEther(user.initVestingDebt),
            dailyVestingAmount: formatEther(user.dailyVestingAmount),
            dailyVestingDebt: formatEther(user.dailyVestingDebt),
            refs,
            refCount: refCount.toString(),
        })
    })

    it('getVestingAmount', async () => {
        const idoAmount = await this.ido.getVestingAmount()
        console.log(formatEther(idoAmount))
    })

    it('claim', async () => {
        const transfered = await this.token.transfer(
            this.ido.address,
            parseEther('1000000')
        )
        await transfered.wait()
        const balance = await this.token.balanceOf(this.ido.address)

        const claimed = await this.ido.claim()
        await claimed.wait()

        const busdBalance = await this.busd.balanceOf(this.buyer.address)
        const tokenBalance = await this.token.balanceOf(this.buyer.address)
        const user = await this.ido.userByAddress(this.buyer.address)
        console.log({
            busdBalance: formatEther(busdBalance),
            tokenBalance: formatEther(tokenBalance),
            buyAmount: formatEther(user.buyAmount),
            initVestingAmount: formatEther(user.initVestingAmount),
            initVestingDebt: formatEther(user.initVestingDebt),
            dailyVestingAmount: formatEther(user.dailyVestingAmount),
            dailyVestingDebt: formatEther(user.dailyVestingDebt),
        })
    })

    it('sale', async () => {
        const total = await this.ido.totalSale()
        const current = await this.ido.currentSale()
        const progress = await this.ido.progress()
        console.log({
            totalSale: formatEther(total),
            currentSale: formatEther(current),
            progress: formatEther(progress),
        })
    })
})
