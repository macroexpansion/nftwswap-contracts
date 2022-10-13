# nftwswap-contracts

## NFT

-   Test NFT URL: https://static.howlcity.io/bike/10.json
-   [ABI](./artifacts/contracts/NFT.sol/NFT.json)
-   Address: 0x50b49fed58eAD9476Ed99D007E9c91112092D264
-   Code:

```js
const minted = await nftContract.safeMint(address, [nftURL](https://static.howlcity.io/bike/10.json))
await minted.wait()
```

## IDO

-   [ABI](./artifacts/contracts/IDO.sol/IDO.json)
-   IDO Address: 0x35C3A6069e71C6dc6B1ef2EB0E6D8bb99AF3fE62
-   USDT Address: 0xdac17f958d2ee523a2206206994597c13d831ec7
-   Code:

```js
// give IDO contract to transfer USDT
const usdtAllowance = await usdt.allowance(buyerAddress, idoAddress)
if (usdtAllowance.eq(ethers.BigNumber.from('0'))) {
    const usdtApproval = await usdt.approve(
        idoAddress,
        ethers.utils.parseEther('1000')
    )
    await usdtApproval.wait()
}

const ref = '0x91A736439Cb6339bA892fE70Bb5146A54e21044B'
const buy = await idoContract.buy(ethers.utils.parseEther('1000'), ref)
await buy.wait()
```

```js
const claim = await idoContract.claim()
await claim.wait()
```
