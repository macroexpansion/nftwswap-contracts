/** @type import('hardhat/config').HardhatUserConfig */

require('dotenv').config({ path: '.env' })
require('dotenv').config({ path: '.secret' })
require('@nomicfoundation/hardhat-toolbox')

require('./tasks')

module.exports = {
    solidity: '0.8.4',
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {},
        ethw_mainnet: {
            url: 'http://mainnet.ethereumpow.org',
            chainId: 10001,
            accounts: [process.env.MAINNET_PK ?? process.env.TESTNET_PK],
        },
    },
    mocha: {
        timeout: 20000,
    },
}
