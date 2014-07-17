var fs = require('fs'),
  path = require('path'),
  request = require('request'),
  async = require('async'),
  mkdirp = require('mkdirp'),
  zlib = require('zlib');

function AutoIngestion(params) {
  this.username = params.username;
  this.password = params.password;
  this.vendorId = params.vendorId;
}

AutoIngestion.BASE_URL = 'https://reportingitc.apple.com/autoingestion.tft';

AutoIngestion.prototype.downloadSalesReport = function(dateType, reportType, reportSubType, reportDate, downloadPath, callback) {
  var self = this;
  async.waterfall(
    [
      self._checkDownloadPath(downloadPath),
      self._downloadReport(dateType, reportType, reportSubType, reportDate, downloadPath),
      self._unarchiveDownloadedFile(downloadPath)
    ],
    function (error, filePath) {
      if (error) return callback(error);
      else callback(null, filePath);
    }
  )
};


AutoIngestion.prototype.downloadEarningsReport = function(regionCode, fiscalYear, fiscalPeriod, downloadPath, callback) {
  var self = this;
  async.waterfall(
    [
      self._checkDownloadPath(downloadPath),
      self._downloadEarnings(regionCode, fiscalYear, fiscalPeriod, downloadPath),
      self._unarchiveDownloadedFile(downloadPath)
    ],
    function (error, filePath) {
      if (error) return callback(error);
      else callback(null, filePath);
    }
  )
};

AutoIngestion.prototype._checkDownloadPath = function(downloadPath) {
  return function (callback) {
    mkdirp(downloadPath, function (error, result) {
      callback(error);
    })
  };
};

AutoIngestion.prototype._downloadReport = function(dateType, reportType, reportSubType, reportDate, downloadPath) {
  var self = this;
  return function (callback) {
    var postParams = {
      USERNAME: self.username,
      PASSWORD: self.password,
      VNDNUMBER: self.vendorId,
      TYPEOFREPORT: reportType,
      REPORTTYPE: reportSubType,
      DATETYPE: dateType,
      REPORTDATE: reportDate
    };

    return self._download(postParams, downloadPath, callback);
  }
};

AutoIngestion.prototype._downloadEarnings = function(regionCode, fiscalYear, fiscalPeriod, downloadPath) {
  var self = this;
  return function (callback) {
    var postParams = {
      USERNAME: self.username,
      PASSWORD: self.password,
      VNDNUMBER: "00" + self.vendorId,
      TYPEOFREPORT: regionCode,
      DATETYPE: "DRR",
      REPORTTYPE: fiscalYear,
      REPORTDATE: fiscalPeriod
    };

    return self._download(postParams, downloadPath, callback);
  }
};

AutoIngestion.prototype._unarchiveDownloadedFile = function(downloadPath) {
  return function (filePath, callback) {
    var gunzip = zlib.createGunzip();
    var finalFilePath = path.join(downloadPath, path.basename(filePath, ".gz"));

    fs.createReadStream(filePath)
      .pipe(gunzip)
      .pipe(fs.createWriteStream(finalFilePath))
      .on('finish', function() {
        callback(null, finalFilePath);
      })
      .on('error', function(error) {
        callback(error);
      });
  }
};


AutoIngestion.prototype._download = function(requestParams, downloadPath, callback) {
  var downloadFilePath;
  var postRequest = request.post('https://reportingitc.apple.com/autoingestion.tft', { form: requestParams });

  postRequest.on('response', function (response) {
    if (response.statusCode == 200) {
      if (response.headers.errormsg !== undefined && response.headers.errormsg !== null) {
        callback(new Error(response.headers.errormsg));
      } else {
        downloadFilePath = path.join(downloadPath, response.headers.filename);

        var fileStream = fs.createWriteStream(downloadFilePath);
        fileStream.on('finish', function() {
          return callback(null, downloadFilePath);
        }).on('error', function(err) {
          return callback(err);
        });

        response.pipe(fileStream);
      }
    } else {
      return callback(new Error("Server return code:" + response.statusCode));
    }
  });
};

exports.AutoIngestion = function(params) {
  return new AutoIngestion(params);
};
