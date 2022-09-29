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
        /* bsc_testnet: {
            url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
            chainId: 97,
            gasPrice: 20000000000,
            accounts: [
                process.env.TESTNET_PK,
            ],
        },
        bsc_mainnet: {
            url: 'https://bsc-dataseed.binance.org/',
            chainId: 56,
            gasPrice: 20000000000,
            accounts: [
                process.env.MAINNEET_PK ?? process.env.TESTNET_PK
            ],
        }, */
    },
    mocha: {
        timeout: 20000,
    },
}
