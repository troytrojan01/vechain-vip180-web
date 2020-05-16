<template>
  <div class="home" v-loading="loading"
       element-loading-text="issuing"
       element-loading-spinner="el-icon-loading"
       element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-container class="index">
      <el-header>
        <h1>ISSUE TOKEN</h1> onVeChainThor Blockchain ddd</el-header>
      <section class="main">
        <el-tabs @tab-click="handleClick" v-model="activeName">
          <el-tab-pane label="Step1. Token properties" name="step1">
            <div class="step1_tips">Configure properties of your token. Created token contract will be VIP180 compatible on VeChainThor Blockchain.</div>
            <el-form class="token_form" :model="tokenForm" :rules="rules" ref="tokenForm">
              <el-form-item label="Token Name" prop="tokenName">
                <el-input v-model.trim="tokenForm.tokenName" placeholder="Eg: VeThor"></el-input>
                <span>Input the name of your new token.</span>
              </el-form-item>
              <el-form-item label="Symbol" prop="symbol">
                <el-input v-model.trim="tokenForm.symbol" placeholder="Eg: VTHO"></el-input>
                <span>Input the symbol of your new token.</span>
              </el-form-item>
              <el-form-item label="Total Supply" prop="supply">
                <el-input v-model.triml="tokenForm.supply" @change='formatSupply' placeholder="Eg: 1,000,000,000"></el-input>
                <span>Input the total amount you want to issue your new token, the value should smaller than 100 trillion.</span>
              </el-form-item>
              <el-form-item label="Decimals Name" prop="decimals">
                <el-input v-model.trim="tokenForm.decimals" placeholder="Eg: 18"></el-input>
                <span>Refer to the divisibility of a token, from 0 (indivisible) to 18 (pretty much continuous).</span>
              </el-form-item>
              <el-form-item label="Initial Owner Address" prop="address">
                <el-input v-model.trim="tokenForm.address" placeholder="Input your VeChainThor wallet address, which is 42 characters in length starting with 0x."></el-input>
                <span>When token is issued, all the new token will transfer to this address (initial owner) immediately.</span>
              </el-form-item>

              <el-button type="primary" @click="confirm">Confirm to issue</el-button>
              <p class="testnet">
                If you don't havn't enough VTHO on testnet to sign transaction, <a @click="setAddress">click here to apply VTHO on test net.</a>
              </p>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="Step2. Issue Info" name="step2">
            <div class="step2_tips" v-if="issueInfo.length">The new token has been issued successfully!</div>
            <div class="step2_tips" v-else>No Issue Token!</div>
            <el-row class="step2_success_info" v-for="(item, index) in issueInfo" :key="index">
              <el-col :span="8" class="left">{{item.key}}</el-col>
              <el-col :span="16" class="right">{{item.value}}</el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </section>
      <el-dialog :visible.sync="dialogIssueVisible"
                 width="30%"
                 center="">
        <span class="issue_dialog_content">Confirm to issue</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="issue" size="small">Confirm</el-button>
          <el-button type="info" @click="dialogIssueVisible = false" size="small">Cancel</el-button>
        </span>
      </el-dialog>

      <el-dialog :visible.sync="dialogCometLoginVisible"
                 width="30%"
                 center="">
        <i class="el-icon-warning warning"></i>
        <p class="comet_dialog_waring">Warning</p>
        <span>You signed out from Totient. Open Totient extension anf sign in first.</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="issue" size="small">OK</el-button>
        </span>
      </el-dialog>

      <el-dialog :visible.sync="dialogApplyVisible"
                 width="30%"
                 center>
        <el-form :model="applyForm" :rules="applyRules" ref="applyForm">
          <el-form-item label="Input your address, click confirm to apply VTHO on testnet:" label-position="top" prop="address" >
            <el-input  auto-complete="off" placeholder="" v-model.trime="applyForm.address"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="apply" size="small">Apply</el-button>
          <el-button type="info" size="small">Cancel</el-button>
        </div>
      </el-dialog>
    </el-container>
  </div>
</template>
<script>
  import abi from './abi.js'
  import './comet.less'
  import axios from 'axios'
  export default {
    name: "comet",
    data() {
      const validatorName = (rule, value, callback) => {
        let exp = /^[a-z]+$/
        if (exp.test(value.toLowerCase()) && value.length <= 10) {
          callback()
        } else {
          callback(new Error('Please input less than 10 English letters.'))
        }
      }

      const validatorAddress = (rule, value, callback) => {
        let exp = /^0x/
        if (exp.test(value) && value.length === 42) {
          callback()
        } else {
          callback(new Error('Start from 0x, length = 42'))
        }
      }
      return {
        net: '',
        rpcUrl: '',
        loading: false,
        thor: undefined,
        web3js: undefined,
        activeName: 'step1',
        dialogIssueVisible: false,
        dialogCometLoginVisible: false,
        dialogApplyVisible: false,
        issueInfo: [],
        applyForm: {
          address: ''
        },
        applyRules: {
          address: [
            { required: true, message: 'Start from 0x, length = 42', trigger: 'blur' },
            { validator: validatorAddress, trigger: 'blur'}
          ]
        },
        tokenForm: {
          tokenName: '',
          symbol: '',
          supply: '',
          decimals: '',
          address: ''
        },
        rules: {
          tokenName: [
            { required: true, message: 'Please input less than 10 English letters.', trigger: 'blur' },
            { validator: validatorName, trigger: 'blur' }
          ],
          symbol: [
            { required: true, message: 'Please input less than 10 English letters.', trigger: 'blur' },
            { validator: validatorName, trigger: 'blur' }
          ],
          supply: [
            { required: true, message: 'Total should be integer from 1-100T.', trigger: 'blur' },
            {
              validator: (rule, value, callback) => {
                let exp = /^[0-9]+$/
                let max = Math.pow(10, 14)
                if (exp.test(value) && value > 0 && value <= max) {
                  callback()
                } else {
                  callback(new Error(('Total should be integer from 1-100T.')))
                }
              },
              trigger: 'blur'
            }
          ],
          decimals: [
            { required: true, message: 'Decimals should be integer from 0 to 18.', trigger: 'blur' },
            {
              validator: (rule, value, callback) => {
                let exp = /^[0-9]+$/
                let max = 18
                if (exp.test(value) && value > 0 && value <= max) {
                  callback()
                } else {
                  callback(new Error('Decimals should be integer from 0 to 18.'))
                }
              },
              trigger: 'blur'
            }
          ],
          address: [
            { required: true, message: 'Start from 0x, length = 42', trigger: 'blur' },
            { validator: validatorAddress, trigger: 'blur'}
          ]
        },
      }
    },
    mounted() {
      this.thor = window.thor // Comet 插件暴露的对象，用于网页与插件通信
      require.ensure([], (require) => {
        let { extend } = require('thorify/dist/extend/index')
        this.extend = extend
      }, 'extend')
    },
    methods: {
      formatSupply(value) {
        console.log(value)
      },
      handleClick(tab) {
        this.activeName = tab.name
      },
      setAddress() {
        this.dialogApplyVisible = true
      },
      apply() {
        this.$refs['applyForm'].validate(valid => {
          if (valid) {
            this.dialogApplyVisible = false
            axios.post("https://faucet.outofgas.io/requests", {
              to: this.applyForm.address
            })
              .then(res => {
                if (res.data && res.data.id) {
                  this.$alert('Apply Success!', '', {
                    confirmButtonText: 'OK'
                  })
                }
              })
              .catch(err => {
                this.$alert('Apply Failed!', '', {
                  confirmButtonText: 'OK'
                })
              })
          }
        })
      },
      confirm() {
        this.thor = window.thor
        this.issueInfo = []
        this.$refs['tokenForm'].validate(async valid => {
          if (valid) {
            let web3js
            if (typeof this.thor !== 'undefined') {
              // Use thor provider
              web3js = new Web3(this.thor)
              // Extend web3 to connect to VeChain Blockchain
              if (this.extend) {
                this.extend(web3js)
              } else {
              }
            } else {
              this.$alert('Whether to go to Google Store to download Comet plugins?', 'Tip', {
                confirmButtonText: 'OK',
              }).then(() => {
                window.open('https://chrome.google.com/webstore/detail/comet/jpkkakbelpcambmhdcaoidiejaikiemn')
              }).catch(() => {

              })
              return
            }
            this.web3js = web3js
            this.getChain()
            const [currentAccount] = await web3js.eth.getAccounts()
            if (!currentAccount) {
              this.dialogCometLoginVisible = true
            } else {
              this.dialogIssueVisible = true
            }
          }
        })
      },
      async issue() {
        this.dialogCometLoginVisible = false
        this.dialogIssueVisible = false
        this.loading = true
        let result = await this.enableThor()
        const [currentAccount] = await this.web3js.eth.getAccounts()
        this.createContract(currentAccount)
      },
      createContract(currentAccount) {
        const MyTokenABI = abi
        const tokenContract = new this.web3js.eth.Contract(MyTokenABI) // 新建合约只需传入ABI
        let _this = this
        tokenContract.deploy({
          data: '0x60806040523480156200001157600080fd5b506040516200116e3803806200116e8339810180604052810190808051906020019092919080519060200190929190805182019291906020018051820192919060200180519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161415151562000107576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600f8152602001807f696e76616c69642061646472657373000000000000000000000000000000000081525060200191505060405180910390fd5b82600090805190602001906200011f92919062000377565b5081600190805190602001906200013892919062000377565b5080600260006101000a81548160ff021916908360ff1602179055506200016f85856200017a640100000000026401000000009004565b505050505062000426565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415151562000220576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600f8152602001807f696e76616c69642061646472657373000000000000000000000000000000000081525060200191505060405180910390fd5b62000245816003546200035a6401000000000262000cf0179091906401000000009004565b600381905550620002ad81600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546200035a6401000000000262000cf0179091906401000000009004565b600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600081830190508281101515156200036e57fe5b80905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620003ba57805160ff1916838001178555620003eb565b82800160010185558215620003eb579182015b82811115620003ea578251825591602001919060010190620003cd565b5b509050620003fa9190620003fe565b5090565b6200042391905b808211156200041f57600081600090555060010162000405565b5090565b90565b610d3880620004366000396000f300608060405260043610610099576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde031461009e578063095ea7b31461012e57806318160ddd1461017b57806323b872dd146101a6578063313ce5671461021357806370a082311461024457806395d89b411461029b578063a9059cbb1461032b578063dd62ed3e14610378575b600080fd5b3480156100aa57600080fd5b506100b36103ef565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100f35780820151818401526020810190506100d8565b50505050905090810190601f1680156101205780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561013a57600080fd5b50610179600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610491565b005b34801561018757600080fd5b5061019061057b565b6040518082815260200191505060405180910390f35b3480156101b257600080fd5b50610211600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610585565b005b34801561021f57600080fd5b5061022861084f565b604051808260ff1660ff16815260200191505060405180910390f35b34801561025057600080fd5b50610285600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610866565b6040518082815260200191505060405180910390f35b3480156102a757600080fd5b506102b06108af565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102f05780820151818401526020810190506102d5565b50505050905090810190601f16801561031d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561033757600080fd5b50610376600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610951565b005b34801561038457600080fd5b506103d9600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610a17565b6040518082815260200191505060405180910390f35b606060008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156104875780601f1061045c57610100808354040283529160200191610487565b820191906000526020600020905b81548152906001019060200180831161046a57829003601f168201915b5050505050905090565b80600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a35050565b6000600354905090565b600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054811115151561063c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f696e73756666696369656e742062616c616e636500000000000000000000000081525060200191505060405180910390fd5b600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548111151515610730576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6578636565642074686520616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b6107bf81600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610a9e90919063ffffffff16565b600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061084a838383610ab7565b505050565b6000600260009054906101000a900460ff16905090565b6000600460008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b606060018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109475780601f1061091c57610100808354040283529160200191610947565b820191906000526020600020905b81548152906001019060200180831161092a57829003601f168201915b5050505050905090565b600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548111151515610a08576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f696e73756666696369656e742062616c616e636500000000000000000000000081525060200191505060405180910390fd5b610a13338383610ab7565b5050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000828211151515610aac57fe5b818303905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614151515610b5c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600f8152602001807f696e76616c69642061646472657373000000000000000000000000000000000081525060200191505060405180910390fd5b610bae81600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610a9e90919063ffffffff16565b600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610c4381600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610cf090919063ffffffff16565b600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b60008183019050828110151515610d0357fe5b809050929150505600a165627a7a72305820c67efaa8e48ad31c8094c2597dfccfc4201292ab1bec9e145ca5e58b479fd85e0029',
          arguments: [this.tokenForm.address, this.web3js.utils.toWei(this.tokenForm.supply, 'ether'), this.tokenForm.tokenName, this.tokenForm.symbol, this.tokenForm.decimals] // [toAddress, supply, name, symbol, decimals]
        }).send({
          from: currentAccount,
          gas: 3000000, //固定写死
        }, function(err, txhash) {
          console.log("deploy tx hash:"+txhash)
        })
          .on('error', function(error){
            console.error(error)
            _this.loading = false
            _this.dialogCometLoginVisible = false
            _this.dialogIssueVisible = false
            _this.$alert('Issue Failed', 'Tip', {
              confirmButtonText: 'Confirm',
            })
          })
          .on('transactionHash', function(transactionHash){
            console.log("hash:",transactionHash)
          })
          .on('receipt', async function(receipt){
            console.log(receipt.contractAddress) // contains the new contract address
            if (receipt && receipt.contractAddress) {
              _this.dialogCometLoginVisible = false
              _this.dialogIssueVisible = false
              _this.loading = false
              // tokenInfoABI
              const contract = new _this.web3js.eth.Contract(abi, receipt.contractAddress)
              _this.getTokenInfo(contract, receipt.transactionHash, receipt.contractAddress, currentAccount)
            }
          })
      },
      getTokenInfo(contract, transactionHash, contractAddress, walletAddress) {
        Promise.all([
          contract.methods.name().call(),
          contract.methods.symbol().call(),
          contract.methods.totalSupply().call(),
          contract.methods.decimals().call(),
          contract.methods.balanceOf(walletAddress).call()

        ]).then(data => {
          console.log('data', data)
          this.issueInfo = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]

          this.issueInfo[0]['key'] = 'name'
          this.issueInfo[0]['value'] = data[0]

          this.issueInfo[1]['key'] = 'symbol'
          this.issueInfo[1]['value'] = data[1]

          this.issueInfo[2]['key'] = 'totalSupply'
          this.issueInfo[2]['value'] = Number(data[2]).toLocaleString()

          this.issueInfo[3]['key'] = 'decimals'
          this.issueInfo[3]['value'] = data[3]

          this.issueInfo[4]['key'] = 'Contract Address'
          this.issueInfo[4]['value'] = contractAddress

          this.issueInfo[5]['key'] = 'Initial Owner Address'
          this.issueInfo[5]['value'] = this.tokenForm.address

          this.issueInfo[6]['key'] = 'Wallet Balance'
          this.issueInfo[6]['value'] = Number(data[4]).toLocaleString() + 'VET'

          this.issueInfo[7]['key'] = 'Deployment TxID'
          this.issueInfo[7]['value'] = transactionHash

          this.issueInfo[8]['key'] = 'Node'
          this.issueInfo[8]['value'] = this.net

          this.issueInfo[9]['key'] = 'RPC URL'
          this.issueInfo[9]['value'] = this.rpcUrl

          this.activeName = 'step2'
          this.$refs['tokenForm'].resetFields()
        })
      },
      async enableThor () { //通过thor调用插件
        try {
          const [cometAccount] = await this.thor.enable()
          return cometAccount
        } catch (e) {
          console.log(`User rejected request ${e}`)
        }
      },
      getChain() {
        const _this = this
        this.web3js.eth.getChainTag().then(chainTagHex => {
          const chainTag = parseInt(chainTagHex, 16)
          switch (chainTag) {
            case 74:
              _this.net = 'Mainnet'
              _this.rpcUrl = 'https://vethor-node.vechain.com'
              break
            case 39:
              _this.net = 'Testnet'
              _this.rpcUrl = 'https://vethor-node-test.vechaindev.com'

              break
            case 199:
              break
            default:
              console.log('This is an unknown network.')
          }
        })
      }
    }
  }
</script>

