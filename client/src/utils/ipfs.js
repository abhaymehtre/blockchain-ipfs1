const IPFS = require('ipfs-api');
const ipfs = IPFS('localhost', '5001');

// ipfs.id(function(err, res) {
//     if (err) throw err
//     console.log('Connected to IPFS node!', res.id, res.agentVersion, res.protocolVersion);
//     });
export default ipfs;




 // CORS disable for IPFS transfer data.
// ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]"
// ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
// ipfs daemon
