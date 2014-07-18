# apple-autoingestion - Autoingestion tool for Nodejs
It's just node version of Apple's autoingestion tool that's written in Java.

[![NPM](https://nodei.co/npm/apple-autoingestion.png?downloads=true&stars=true)](https://nodei.co/npm/apple-autoingestion/)


## Installation
	npm install --save apple-autoingestion
	
## Examples

Download daily sales report

```javascript
	var autoingestion = require("apple-autoingestion").AutoIngestion({
		username: "userid",
      		password: "password",
      		vendorId: "vendorid"
	});
	autoingestion.downloadSalesReport("Daily", "Sales", "Summary", "20140714", "./download", function (error, filePath) {
  		if (!error) {
		    console.log("Download finished:" + filePath);
		  } else {
		    console.log("Error: " + error);
		  }
	}
```

Download earnings report

```javascript
	var autoingestion = require("apple-autoingestion").AutoIngestion({
		username: "userid",
      		password: "password",
      		vendorId: "vendorid"
	});
	autoingestion.downloadEarningsReport("AU", 2014, 8, "./download", function (error, filePath) {
  		if (!error) {
		    console.log("Download finished:" + filePath);
		  } else {
		    console.log("Error: " + error);
		  }
	}
```

## Methods
### downloadSalesReport(dateType, reportType, reportSubType, reportDate, downloadPath, callback)
Download sales report that you can find on "Sales and Trends" section on iTunes Connect.
#### Arguments
* `dateType`: it can be one of "Daily", "Weekly", "Monthly", "Yearly"
* `reportType`: it can be one of "Sales" or "Newsstand"
* `reportSubType`: it can be one of "Summary", "Detailed", or "Opt-In"
* `reportDate`: it's format should be "YYYYMMDD" (Daily or Weekly), "YYYYMM" (Monthly) or "YYYY" (Yearly)
* `downloadPath`: a directory where the report will be downloaded.
* `callback(err, filePath)`: A callback which is called as soon as the report is downloaded. `filePath` will be the full path to the downloaded file.

### downloadEarningsReport(regionCode, fiscalYear, fiscalPeriod, downloadPath, callback)
Download earnings report that you can find on "Payments and Financial Reports" section on iTunes Connect.
#### Arguments
* `regionCode`: Refer to list of regions listed in Apple's document (i.e. "AU", "US", "JP")
* `fiscalYear`: Apple's fiscal calendar year.
* `fiscalPeriod`: Apple's fiscal calendar month.
* `downloadPath`: a directory where the report will be downloaded
* `callback(err, filePath)`: A callback which is called as soon as the report is downloaded. `filePath` will be the full path to the downloaded file.



## Reference

Earnings Report Arguments  
https://itunesconnect.apple.com/docs/Apps_Payments_Finance_Reports_Guide.pdf

Sales Report Arguments  
http://www.apple.com/itunesnews/docs/AppStoreReportingInstructions.pdf

