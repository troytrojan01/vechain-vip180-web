# Issue VIP180 token


## Overview

This utility is used for VeChain users to issue a VIP180 token from a simple web UI.

Granted by VeChain, Morpheus Labs has published this utility as an application in Application Library of Morpheus Labs BPaaS (ML BPaaS) https://bps.morpheuslabs.io.

Chrome extention based waller Comet is required to run this utility. Install Comet on your browser, refer to https://chrome.google.com/webstore/detail/comet/jpkkakbelpcambmhdcaoidiejaikiemn

VeChain users can follow the steps below to install and run the utility on ML BPaaS. Refer to the ML BPaaS documents when needed: https://docs.morpheuslabs.io/docs.


## Steps to launch the utility

Step 1 - Download the VIP180 token generator web version from Application Library

Step 2 - Deploy the application from my repository to create a new workspace in CDE

Step 3 - Start the newly created workspace

Step 4 - Open the workspace to launch the CDE

Step 5 - Open a terminal and cd to the application directory

Step 6 - Install program dependencies

```
npm install
```

Step 7 - Start the application

```
npm run dev
```

Step 8 - Open the Comet wallet from the chrome browser extention and select the network that you want to issue the token (the testnet, the mainnet and your local Solo node)

Note that to connect to a solo node under the Blockchain Ops, you can use Solo node's external URL by clocking on "i" icon.

You may need to know the URL of your target network. You can configure "Custom End Point" to connect to the Solo node under Blockchain Ops.

Configure your comet wallet accordingly based on the information above.

Step 9 - Click "+" to select a "server", click the URL that is mapped to the port 8080 to launch the Web UI

Step 10 - Issue a VIP180 token from the Web UI wizard. Enter token name, token symbol, total supply, decimal, holder address and click button Confirm to issue. And Confirm from the Comet wallet.

Note that your initial wallet that to own the issued tokens should have VET tokens to be able to deploy the smart contracts.

Step 11 - Verify the token issuance using VeChain explorer (search the token smart contract address).

Note if you want to run the utility in another environment, you can run and export the code to run in another environment.

```
npm run build
```
