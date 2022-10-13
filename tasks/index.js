const { task, subtask, types } = require('hardhat/config')
const fs = require('fs')

task('accounts', 'Prints the list of accounts').setAction(async (args, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

task('buy', 'buy ido').setAction(async (args, hre) => {
    let fo = JSON.parse(fs.readFileSync(`${network.name}_address.json`))
    const signer = await hre.ethers.getSigner()
    const tokenAbi = require('../artifacts/contracts/Token.sol/Token.json').abi
    const idoAbi = require('../artifacts/contracts/IDO.sol/IDO.json').abi

    const usdt = new hre.ethers.Contract(fo.usdtAddress, tokenAbi, signer)
    const ido = new hre.ethers.Contract(fo.idoAddress, idoAbi, signer)

    const usdtAllowance = await usdt.allowance(signer.address, ido.address)
    console.log(usdtAllowance)

    if (usdtAllowance.eq(hre.ethers.BigNumber.from('0'))) {
        const usdtApproval = await usdt.approve(
            ido.address,
            hre.ethers.utils.parseEther('1000')
        )
        await usdtApproval.wait()
    }

    const buy = await ido.buy(
        hre.ethers.utils.parseEther('1000'),
        '0x274197B91650866F09d95C3c5DC239319d6c0608'
    )
    await buy.wait()

    console.log('done')
})

task('getIdo', 'get ido info').setAction(async (args, hre) => {
    let fo = JSON.parse(fs.readFileSync(`${network.name}_address.json`))
    const signer = await hre.ethers.getSigner()
    const idoAbi = require('../artifacts/contracts/IDO.sol/IDO.json').abi
    const tokenAbi = require('../artifacts/contracts/Token.sol/Token.json').abi

    const ido = new hre.ethers.Contract(fo.idoAddress, idoAbi, signer)
    const usdt = new hre.ethers.Contract(fo.usdtAddress, tokenAbi, signer)

    const usdtBalance = await usdt.balanceOf(signer.address)
    const progress = await ido.progress()
    const user = await ido.userByAddress(signer.address)
    const refs = await ido.getRefs()
    // const refCount = await ido.refCount(refs[1])

    const formatEther = hre.ethers.utils.formatEther
    console.log({
        progress: progress.toString(),
        usdtBalance: formatEther(usdtBalance),
        buyAmount: formatEther(user.buyAmount),
        initVestingAmount: formatEther(user.initVestingAmount),
        initVestingDebt: formatEther(user.initVestingDebt),
        dailyVestingAmount: formatEther(user.dailyVestingAmount),
        dailyVestingDebt: formatEther(user.dailyVestingDebt),
        refs,
        // refCount: refCount.toString(),
    })
})
