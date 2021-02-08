/**
 * This is required to fix a bug where the cids module requires a json file, 
 * but the multicodec module only exposes a js file
 */

const { baseTable } = require("multicodec/src/base-table");
const fs = require("fs");

fs.writeFileSync(
  "node_modules/multicodec/src/base-table.json",
  JSON.stringify(baseTable)
);
