(function (d) {
    var isUAFeaturesFound = function(features) {
        return (function(userAgent) {
            var featureIdx = 0,
                isMatched = false;

            while (!isMatched && featureIdx < features.length) {
                var curFeature = features[featureIdx++];

                if (userAgent.indexOf(curFeature) !== -1) {
                    isMatched = true;
                }
            }

            return isMatched;
        });
    };

    var isPhilipsVendor = isUAFeaturesFound(['NETTV\/', 'Philips']);
    var isToshibaVendor = isUAFeaturesFound(['DTVNetBrowser', 'Espial', 'Toshiba', 'TOSHIBA']);

    var getDeviceVendor = function (UA) {
        var vendor = '';
        var hostname = '';
        UA = UA.toLowerCase();

        if (UA.indexOf('smarthub') !== -1) {
            vendor = 'samsung';
        } else if (UA.search(/tizen/i) !== -1) {
            vendor = 'tizen';
        } else if (UA.indexOf('webos') !== -1 || UA.indexOf('web0s') !== -1) {
            vendor = 'webos';
        } else if (UA.indexOf('netcast') !== -1) {
            vendor = 'lg';
        } else if (isPhilipsVendor(UA)) {
            vendor = 'philips';
        } else if (isToshibaVendor(UA)) {
            vendor = 'toshiba';
        } else if (UA.indexOf('viera') !== -1) {
            vendor = 'panasonic';
        } else if (UA.indexOf('hisense') !== -1) {
            vendor = 'hisense';
        } else if (UA.indexOf('opera tv') !== -1) {
            vendor = 'opera';
        } else if (UA.indexOf('sony') !== -1) {
            vendor = 'sony';
        } else if (UA.indexOf('mag') !== -1) {
            vendor = 'infomir';
        } else if (UA.indexOf('spiderman') !== -1) {
            vendor = 'browser';
        } else {
            hostname = window.location.hostname;

            if (hostname.toLowerCase().indexOf('netrange') != -1) {
                vendor = 'netrange';
            } else if (hostname.toLowerCase().indexOf('opera') != -1) {
                vendor = 'opera';
            } else {
                vendor = 'std';
            }
        }

        return vendor;
    };

    var head = d.getElementsByTagName('head')[0];
    var deviceVendor = getDeviceVendor(navigator.userAgent);

    switch (deviceVendor) {
        case 'samsung':
            var script = d.createElement('script');

            script.type = 'text/javascript';
            script.onload = function() {
                window.widgetAPI = null;

                if ('Common' in window) {
                    widgetAPI = new Common.API.Widget();
                    widgetAPI.sendReadyEvent();
                }
            };
            script.src = '$MANAGER_WIDGET/Common/API/Widget.js';
            head.appendChild(script);

            script = d.createElement('script');
            script.type = 'text/javascript';
            script.src = '$MANAGER_WIDGET/Common/API/TVKeyValue.js';
            head.appendChild(script);

            window.pframe.platform = 'smp';
            break;
        case 'tizen':
            window.pframe.platform = 'smp';
            window.pframe.subplatform = 'tizen';
            break;
        case 'lg':
            window.pframe.platform = 'lgn';
            break;
        case 'webos':
            window.pframe.platform = 'lgn';
            window.pframe.subplatform = 'webos';
            break;
        case 'philips':
            window.pframe.platform = 'phn';
            break;
        case 'panasonic':
            window.pframe.platform = 'pnc';
            break;
        case 'toshiba':
            window.pframe.platform = 'tsh';
            break;
        case 'sony':
            window.pframe.platform = 'sce';
            break;
        case 'hisense':
            window.pframe.platform = 'hcs';
            break;
        case 'infomir':
            window.pframe.platform = 'mag';
            break;
        case 'browser':
            window.pframe.platform = 'tzf';
            break;
        default:
            window.pframe.platform = 'std';
    }
})(document);
