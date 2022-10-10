const { expect } = require('chai')
const { ethers } = require('hardhat')

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
            this.signers[0].address,
            currentTime - DAY * 3, // start buy time
            currentTime + DAY * 5, // end buy time
            currentTime + DAY * 0, // claim time
            currentTime + DAY * 5, // cliff time
            currentTime - 60 * 45 // listing time
        )
        await idoDeploy.deployed()

        this.token = new ethers.Contract(
            tokenDeploy.address,
            this.tokenAbi,
            this.signers[0]
        )

        this.busd = new ethers.Contract(
            busdDeploy.address,
            this.tokenAbi,
            this.signers[0]
        )

        this.ido = new ethers.Contract(
            idoDeploy.address,
            this.idoAbi,
            this.signers[0]
        )
    })

    it('transfer', async () => {
        const balance = await this.token.balanceOf(this.ido.address)
        // console.log(ethers.utils.formatEther(balance))
    })

    it('approval', async () => {
        const allowance = await this.token.allowance(
            this.signers[0].address,
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
            this.signers[0].address,
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

    /* it('sale', async () => {
        const total = await this.ido.totalSale()
        const current = await this.ido.currentSale()
        const progress = await this.ido.progress()
        console.log({
            totalSale: formatEther(total),
            currentSale: formatEther(current),
            progress: formatEther(progress)
        })
    }) */

    /* it('buy', async () => {
        for (let i = 0; i < 2; i++) {
            let bought = await this.ido.buy(parseEther('300'))
            await bought.wait()
        }

        const busdBalance = await this.busd.balanceOf(this.signers[0].address)
        const user = await this.ido.userByAddress(this.signers[0].address)
        console.log({
            busdBalance: formatEther(busdBalance),
            buyAmount: formatEther(user.buyAmount),
            initVestingAmount: formatEther(user.initVestingAmount),
            initVestingDebt: formatEther(user.initVestingDebt),
            dailyVestingAmount: formatEther(user.dailyVestingAmount),
            dailyVestingDebt: formatEther(user.dailyVestingDebt),
        })
    }) */

    /* it('getVestingAmount', async () => {
        const idoAmount = await this.ido.getVestingAmount()
        console.log(formatEther(idoAmount))
    }) */

    /* it('claim', async () => {
        const claimed = await this.ido.claim()
        await claimed.wait()
        
        const busdBalance = await this.busd.balanceOf(this.signers[0].address)
        const tokenBalance = await this.token.balanceOf(this.signers[0].address)
        const user = await this.ido.userByAddress(this.signers[0].address)
        console.log({
            busdBalance: formatEther(busdBalance),
            tokenBalance: formatEther(tokenBalance),
            buyAmount: formatEther(user.buyAmount),
            initVestingAmount: formatEther(user.initVestingAmount),
            initVestingDebt: formatEther(user.initVestingDebt),
            dailyVestingAmount: formatEther(user.dailyVestingAmount),
            dailyVestingDebt: formatEther(user.dailyVestingDebt),
        })
    }) */

    /* it('sale', async () => {
        const total = await this.ido.totalSale()
        const current = await this.ido.currentSale()
        const progress = await this.ido.progress()
        console.log({
            totalSale: formatEther(total),
            currentSale: formatEther(current),
            progress: formatEther(progress)
        })
    }) */
})
