import {FlespiDevicesDatasource} from './datasource';
import {FlespiDevicesDatasourceQueryCtrl} from './query_ctrl';

class FlespiDevicesConfigCtrl {}
FlespiDevicesConfigCtrl.templateUrl = 'partials/config.html';

class FlespiDevicesQueryOptionsCtrl {}
FlespiDevicesQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

class FlespiDevicesAnnotationsQueryCtrl {}
FlespiDevicesAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html'

export {
  FlespiDevicesDatasource as Datasource,
  FlespiDevicesDatasourceQueryCtrl as QueryCtrl,
  FlespiDevicesConfigCtrl as ConfigCtrl,
  FlespiDevicesQueryOptionsCtrl as QueryOptionsCtrl,
  FlespiDevicesAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
