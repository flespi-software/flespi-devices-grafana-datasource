'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnnotationsQueryCtrl = exports.QueryOptionsCtrl = exports.ConfigCtrl = exports.QueryCtrl = exports.Datasource = undefined;

var _datasource = require('./datasource');

var _query_ctrl = require('./query_ctrl');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FlespiDevicesConfigCtrl = function FlespiDevicesConfigCtrl() {
  _classCallCheck(this, FlespiDevicesConfigCtrl);
};

FlespiDevicesConfigCtrl.templateUrl = 'partials/config.html';

var FlespiDevicesQueryOptionsCtrl = function FlespiDevicesQueryOptionsCtrl() {
  _classCallCheck(this, FlespiDevicesQueryOptionsCtrl);
};

FlespiDevicesQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

var FlespiDevicesAnnotationsQueryCtrl = function FlespiDevicesAnnotationsQueryCtrl() {
  _classCallCheck(this, FlespiDevicesAnnotationsQueryCtrl);
};

FlespiDevicesAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

exports.Datasource = _datasource.FlespiDevicesDatasource;
exports.QueryCtrl = _query_ctrl.FlespiDevicesDatasourceQueryCtrl;
exports.ConfigCtrl = FlespiDevicesConfigCtrl;
exports.QueryOptionsCtrl = FlespiDevicesQueryOptionsCtrl;
exports.AnnotationsQueryCtrl = FlespiDevicesAnnotationsQueryCtrl;
//# sourceMappingURL=module.js.map
