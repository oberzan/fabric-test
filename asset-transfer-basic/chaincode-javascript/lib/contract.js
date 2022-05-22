// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class mainContract extends Contract {

  async queryTransaction(ctx, id) {
    let assetJSON = await ctx.stub.getState(id);
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error("Asset with id: " + id + " does not exist");
    }

    //let asset = JSON.parse(assetAsBytes.toString());

    //return JSON.stringify(asset);
    return assetJSON.toString();
  }

  async queryWithSelector(ctx, selector) {
    console.log(selector);
    let queryIterator = await ctx.stub.getQueryResult(selector);

    console.log(queryIterator);
    console.log(Object.keys(queryIterator));

    const allResults = [];
    while (true) {
      const res = await queryIterator.next();
      if (res.value) {
        allResults.push(JSON.parse(res.value.value.toString('utf8')));
      }

      if (res.done) {
        await queryIterator.close();
        return allResults;
      }
    }
  }

  async addTransaction(ctx, uid, timestamp, intrface, method, data) {
    if (!uid)
      throw new Error('"uid" attribute is missing');
    if (!timestamp)
      throw new Error('"timestamp" attribute is missing');
    if (!intrface)
      throw new Error('"interface" attribute is missing');
    if (!method)
      throw new Error('"method" attribute is missing');
    if (!data)
      throw new Error('"data" attribute is missing');

    data = JSON.parse(data);

    const transaction = {
      uid,
      timestamp,
      "interface": intrface,
      method,
      data
    }

    await ctx.stub.putState(uid, Buffer.from(stringify(sortKeysRecursive(transaction))));
    return JSON.stringify(transaction);
  }
  
}

module.exports = mainContract;
