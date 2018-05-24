const autoingestion = require('./index.js').AutoIngestion({
    username: 'username',
    password: 'password',
    vendorId: 'vendorid',
});


/*
autoingestion.downloadSalesReport("Daily", "Sales", "Summary", "20140714", "./download", function (error, filePath) {
  if (!error) {
    console.log("Download finished:" + filePath);
  } else {
    console.log("Error: " + error);
  }
});
*/

autoingestion.downloadEarningsReport('AU', 2014, 8, './download', (error, filePath) => {
  if (!error) {
      console.log(`Download finished:${filePath}`);
  } else {
    console.log(error);
  }
});

