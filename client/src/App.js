import React, { Component } from "react";
import SolidityDriveContract from "./contracts/SolidityDrive.json";
import getWeb3 from "./utils/getWeb3";
import { StyledDropZone } from 'react-drop-zone';
import { Table } from 'reactstrap';
import "react-drop-zone/dist/styles.css";
import "bootstrap/dist/css/bootstrap.css";
import { FileIcon } from 'react-file-icon';
import { defaultStyles } from "react-file-icon";
import fileReaderPullStream from 'pull-file-reader';
import ipfs from "./utils/ipfs";
import Moment from "react-moment";


import "./App.css";

class App extends Component {
  state = { solidityDrive: [], web3: null, accounts: null, contract: null, emailid: "abc@xyz.com", transaction: ''};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SolidityDriveContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SolidityDriveContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.getFiles);
      web3.currentProvider.publicConfigStore.on('update', async () => {
        const changedAccounts = await web3.eth.getAccounts();
        this.setState({accounts: changedAccounts});
        this.getFiles();
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getFiles = async () => {
    try {
      const { accounts, contract } = this.state;
      let filesLength = await contract.methods
        .getLength()
        .call({ from: accounts[0] });
      let files = [];
      for (let i = 0; i < filesLength; i++) {
        let file = await contract.methods.getFile(i).call({ from: accounts[0] });

        files.push(file);
      }
      this.setState({ solidityDrive: files });
      // this.setState({data: this.state.accounts[0]});
      this.setState({emailid: this.state.emailid});
      this.setState({transaction: this.state.accounts[0]});
    } catch (error) {
    }
  };

  onDrop = async (file) => {
    try {
      const {contract, accounts} = this.state;
      const stream = fileReaderPullStream(file);
      const result = await ipfs.add(stream);
      const timestamp = Math.round(+new Date() / 1000);
      const type = file.name.substr(file.name.lastIndexOf(".")+1);
      let uploaded = await contract.methods.add(result[0].hash, file.name, type, timestamp).send({from: accounts[0], gas: 3000000})
      console.log(uploaded);
      this.getFiles();
      debugger;
    } catch (error) {
      console.log(error);
    }
  };



 
  render() {
    const {solidityDrive} = this.state;

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (

      <div className="App">
        <div className="container pt-3">
          <StyledDropZone onDrop={this.onDrop} />
          <Table>
            <thead>
              <tr>
                <th width="7%" scope="row"> Type</th>
                <th className="text-left">File Name </th>
                <th className="text-left">Date</th>
                <th className="text-left"> Account Number</th>
                <th className="text-right"> File Hash Value </th>
                <th className="text-left">Uploaded By</th>
                
              </tr>

            </thead>
            <tbody>
              {solidityDrive !== [] ? solidityDrive.map((item, key)=>(
                <tr>
                <th>
                  <FileIcon
                    size={30}
                    extension={item[2]}
                    {...defaultStyles[item[2]]}
                  />
                </th>
                <th className="text-left"><a href={"https://ipfs.io/ipfs/"+item[0]}>{item[1]}</a></th>
                <th className="text-right">
                  <Moment format="YYYY/MM/DD" unix>{item[3]}</Moment>
                </th>
                 <th className="text-left">{this.state.transaction}</th>
                <th className="text-right">{item[0]}</th>
                <th className="text-left">{this.state.emailid}</th>
               
              </tr>
              )) : null}
            </tbody>
          </Table>

        </div>
      </div>
     
    );
  }
}

export default App;