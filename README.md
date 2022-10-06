# etwswap-contracts

## NFT
- Test NFT URL: https://static.howlcity.io/bike/10.json
- [ABI](./artifacts/contracts/NFT.sol/NFT.json)
- Address: 0x50b49fed58eAD9476Ed99D007E9c91112092D264
- Code:
```js
const minted = await nftContract.safeMint(address, [nftURL](https://static.howlcity.io/bike/10.json))
await minted.wait()
```
