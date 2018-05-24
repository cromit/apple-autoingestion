const fs = require('fs');
const path = require('path');
const request = require('request');
const async = require('async');
const mkdirp = require('mkdirp');
const zlib = require('zlib');

function AutoIngestion(params) {
  this.username = params.username;
  this.password = params.password;
  this.vendorId = params.vendorId;
}

AutoIngestion.BASE_URL = 'https://reportingitc.apple.com/autoingestion.tft';

AutoIngestion.prototype.downloadSalesReport = function (dateType, reportType, reportSubType, reportDate, downloadPath, callback) {
  const self = this;
  async.waterfall(
    [
      self._checkDownloadPath(downloadPath),
      self._downloadReport(dateType, reportType, reportSubType, reportDate, downloadPath),
      self._unarchiveDownloadedFile(downloadPath),
    ],
      (error, filePath) => {
      if (error) return callback(error);
          callback(null, filePath);
      },
  );
};


AutoIngestion.prototype.downloadEarningsReport = function (regionCode, fiscalYear, fiscalPeriod, downloadPath, callback) {
  const self = this;
  async.waterfall(
    [
      self._checkDownloadPath(downloadPath),
      self._downloadEarnings(regionCode, fiscalYear, fiscalPeriod, downloadPath),
      self._unarchiveDownloadedFile(downloadPath),
    ],
      (error, filePath) => {
      if (error) return callback(error);
          callback(null, filePath);
      },
  );
};

AutoIngestion.prototype._checkDownloadPath = function (downloadPath) {
  return function (callback) {
      mkdirp(downloadPath, (error) => {
      callback(error);
    });
  };
};

AutoIngestion.prototype._downloadReport = function (dateType, reportType, reportSubType, reportDate, downloadPath) {
  const self = this;
  return function (callback) {
    const postParams = {
      USERNAME: self.username,
      PASSWORD: self.password,
      VNDNUMBER: self.vendorId,
      TYPEOFREPORT: reportType,
      REPORTTYPE: reportSubType,
      DATETYPE: dateType,
      REPORTDATE: reportDate,
    };

    return self._download(postParams, downloadPath, callback);
  };
};

AutoIngestion.prototype._downloadEarnings = function (regionCode, fiscalYear, fiscalPeriod, downloadPath) {
  const self = this;
  return function (callback) {
    const postParams = {
      USERNAME: self.username,
      PASSWORD: self.password,
        VNDNUMBER: `00${self.vendorId}`,
      TYPEOFREPORT: regionCode,
        DATETYPE: 'DRR',
      REPORTTYPE: fiscalYear,
      REPORTDATE: fiscalPeriod,
    };

    return self._download(postParams, downloadPath, callback);
  };
};

AutoIngestion.prototype._unarchiveDownloadedFile = function (downloadPath) {
  return function (filePath, callback) {
    const gunzip = zlib.createGunzip();
      const finalFilePath = path.join(downloadPath, path.basename(filePath, '.gz'));

    fs.createReadStream(filePath)
      .pipe(gunzip)
      .pipe(fs.createWriteStream(finalFilePath))
        .on('finish', () => {
        callback(null, finalFilePath);
      })
        .on('error', (error) => {
        callback(error);
      });
  };
};


AutoIngestion.prototype._download = function (requestParams, downloadPath, callback) {
    let downloadFilePath;
  const postRequest = request.post('https://reportingitc.apple.com/autoingestion.tft', { form: requestParams });

    postRequest.on('response', (response) => {
    if (response.statusCode === 200) {
      if (response.headers.errormsg !== undefined && response.headers.errormsg !== null) {
        callback(new Error(response.headers.errormsg));
      } else if (typeof response.headers.filename === 'undefined') {
        callback(new Error('No report available.'));
      } else {
        downloadFilePath = path.join(downloadPath, response.headers.filename);

        const fileStream = fs.createWriteStream(downloadFilePath);
          fileStream.on('finish', () => callback(null, downloadFilePath)).on('error', err => callback(err));

        response.pipe(fileStream);
      }
    } else {
        return callback(new Error(`Server return code:${response.statusCode}`));
    }
  });
};

exports.AutoIngestion = function (params) {
  return new AutoIngestion(params);
};
