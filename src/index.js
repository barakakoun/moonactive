const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_OBJ_IN_MEMORY = process.env.MAX_OBJ_IN_MEMORY || 3;
const filesFolder = "./files/";

app.use(express.json());

var minRank = 1;

const objMostFreq = {};

const accessCounter = {};

// Initiate access counter to 0 for every file in the files' directory
fs.readdirSync(filesFolder).forEach(file => {
  // Trimming the extension
  accessCounter[
    file
      .split(".")
      .slice(0, -1)
      .join(".")
  ] = 0;
});

// var het = accessCounter["file1"]++;

app.get("", (req, res) => {
  let fileName = req.query.filename;

  // Try to get the object from the memory
  let currObj = objMostFreq[fileName];

  // If not in memory, we will read it from the file
  if (!currObj) {
    currObj = fetchFileObj(filesFolder + fileName + ".json");
  }

  // **** HERE TO BE ALL THE PROCESSING RELATED TO THE OBJECT ****

  res.send(currObj);

  // PLEASE NOTICE
  // We already returned a response to the client,
  // so the next part isn't part of the "processing time" we're trying to reduce

  // Increase the counter
  accessCounter[fileName]++;

  // The file isn't saved in memory already
  if (!objMostFreq[fileName]) {

    let arrFreqKeys = Object.keys(objMostFreq);

    // There's still room for more objs in memory, so we can push the current one
    if (arrFreqKeys.length < MAX_OBJ_IN_MEMORY) {
      objMostFreq[fileName] = currObj;
    }

    // If current count is bigger than the min rank
    if (accessCounter[fileName] === (minRank+1)) {
        // Get array of the files who are inside the mostFreq object AND has the min count
        let arrWeakest = arrFreqKeys.filter((file) => accessCounter[file] === minRank);

        // Delete the obj with the min count
        delete objMostFreq[arrWeakest[0]];

        // Insert the new obj
        objMostFreq[fileName] = currObj;

        // If there was only one file with the min count, it means the min count has increased
        if (arrWeakest.length === 1) {
            minRank++;
        }
    }
  } else if (accessCounter[fileName] === (minRank+1)) {
    // For the case in which all the counters of the most freq objects are now bigger than min rank


    let arrFreqKeys = Object.keys(objMostFreq);

    // Get array of the files who are inside the mostFreq object AND has the min count
    if (!arrFreqKeys.find((file) => accessCounter[file] === minRank)) minRank++;
  } 
});

var fetchFileObj = fileName => {
  try {
    var data = fs.readFileSync(fileName);
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

app.listen(PORT, () => {
  console.log("Server is up on port " + PORT);
});
