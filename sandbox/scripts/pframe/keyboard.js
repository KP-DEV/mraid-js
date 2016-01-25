(function (d) {
    var keyboard = {};

    keyboard.scheme = {};
    keyboard.subscribers = {
        any: []
    };

    keyboard.setVKScheme = function () {
        var platform = pframe.platform != null ? pframe.platform : 'tzf';
        var subplatform = pframe.subplatform != null ? pframe.subplatform : '';
        VK_PLAYPAUSE = 0;

        switch (platform) {
            case 'smp':
                if (pframe.subplatform !== 'tizen') {
                    var tvKey = new Common.API.TVKeyValue();

                    VK_ENTER = tvKey.KEY_ENTER;
                    VK_LEFT = tvKey.KEY_LEFT;
                    VK_UP = tvKey.KEY_UP;
                    VK_RIGHT = tvKey.KEY_RIGHT;
                    VK_DOWN = tvKey.KEY_DOWN;

                    VK_HID_BACK = tvKey.KEY_RETURN;
                    VK_BACK = tvKey.KEY_RETURN;
                    VK_EXIT = tvKey.KEY_EXIT;

                    VK_RED = tvKey.KEY_RED;
                    VK_GREEN = tvKey.KEY_GREEN;
                    VK_YELLOW = tvKey.KEY_YELLOW;
                    VK_BLUE = tvKey.KEY_BLUE;
                    VK_RW = tvKey.KEY_RW;
                    VK_REWIND = tvKey['KEY_REWIND_'] || 1080; // long rw press
                    VK_STOP = tvKey.KEY_STOP;
                    VK_PLAY = tvKey.KEY_PLAY;
                    VK_PAUSE = tvKey.KEY_PAUSE;
                    VK_FF = tvKey.KEY_FF;
                    VK_FAST_FWD = tvKey['KEY_FF_'] || 1078; // long ff press

                    VK_VOL_UP = tvKey.KEY_VOL_UP;
                    VK_VOL_DOWN = tvKey.KEY_VOL_DOWN;
                    VK_MUTE = tvKey.KEY_MUTE;

                    VK_HID_HOME = 36;
                    VK_HID_END = 35;
                    VK_HID_INSERT = 45;
                    VK_HID_DEL = 46;
                    VK_HID_ESC = 461;
                    VK_HID_CTRL = 17;
                    VK_HID_ALT = 18;
                    VK_HID_RT_ALT = 21;

                    VK_CAPS_LOCK = 20;
                    VK_SHIFT = 16;
                    VK_LANG_SEL = 229;

                    VK_0 = tvKey.KEY_0;
                    VK_1 = tvKey.KEY_1;
                    VK_2 = tvKey.KEY_2;
                    VK_3 = tvKey.KEY_3;
                    VK_4 = tvKey.KEY_4;
                    VK_5 = tvKey.KEY_5;
                    VK_6 = tvKey.KEY_6;
                    VK_7 = tvKey.KEY_7;
                    VK_8 = tvKey.KEY_8;
                    VK_9 = tvKey.KEY_9;

                    VK_NUMPAD_0 = 96;
                    VK_NUMPAD_1 = 97;
                    VK_NUMPAD_2 = 98;
                    VK_NUMPAD_3 = 99;
                    VK_NUMPAD_4 = 100;
                    VK_NUMPAD_5 = 101;
                    VK_NUMPAD_6 = 102;
                    VK_NUMPAD_7 = 103;
                    VK_NUMPAD_8 = 104;
                    VK_NUMPAD_9 = 105;

                    VK_GRAVE = 192;
                    VK_DASH = 189;
                    VK_EQUAL = 187;
                    VK_BACK_SLASH = 220;
                    VK_LEFT_BLACKET = 219;
                    VK_RIGHT_BLACKET = 221;
                    VK_SEMICOLON = 186;
                    VK_APOSTROPHE = 222;
                    VK_COMMA = 188;
                    VK_PERIOD = 190;
                    VK_SLASH = 191;
                    VK_SPACE_BAR = 32;
                } else { // tizen
                    VK_PLAYPAUSE = 10252;
                    VK_PLAY = 415;
                    VK_PAUSE = 19;
                    VK_STOP = 413;
                    VK_FF = 417;
                    VK_RW = 412;

                    VK_LEFT = 37;
                    VK_UP = 38;
                    VK_RIGHT = 39;
                    VK_DOWN = 40;

                    VK_HID_BACK = VK_BACK = 10009;
                    VK_ENTER = 13;

                    VK_VOL_UP = 447;
                    VK_VOL_DOWN = 448;
                    VK_MUTE = 449;
                    //VK_EXIT = 10182;

                    VK_0 = 48;
                    VK_1 = 49;
                    VK_2 = 50;
                    VK_3 = 51;
                    VK_4 = 52;
                    VK_5 = 53;
                    VK_6 = 54;
                    VK_7 = 55;
                    VK_8 = 56;
                    VK_9 = 57;
                }

                break;
            case 'lgn':
                VK_ENTER = 13;
                VK_LEFT = 37;
                VK_UP = 38;
                VK_RIGHT = 39;
                VK_DOWN = 40;

                VK_RED = 403;
                VK_GREEN = 404;
                VK_YELLOW = 405;
                VK_BLUE = 406;

                VK_RW = 412;
                VK_STOP = 413;
                VK_PLAY = 415;
                VK_PAUSE = 19;
                VK_FF = 417;
                VK_INFO = 457;
                VK_BACK = 461;
                VK_LGE_MAGIC_VOICE = 1015;

                VK_0 = 48;
                VK_1 = 49;
                VK_2 = 50;
                VK_3 = 51;
                VK_4 = 52;
                VK_5 = 53;
                VK_6 = 54;
                VK_7 = 55;
                VK_8 = 56;
                VK_9 = 57;
                break;
            case 'tzf': //pc browser
                //case 'pnc':
                VK_ENTER = 13;
                VK_LEFT = 37;
                VK_UP = 38;
                VK_RIGHT = 39;
                VK_DOWN = 40;

                VK_HID_BACK = 8;
                VK_HID_HOME = 36;
                VK_HID_ESC = 461;

                VK_RED = 403;
                VK_GREEN = 404;
                VK_YELLOW = 405;
                VK_BLUE = 406;

                VK_RW = 412;
                VK_STOP = 413;
                VK_PLAY = 415;
                VK_PAUSE = 19;
                VK_FF = 417;
                VK_INFO = 457;
                VK_BACK = 461;
                VK_LGE_MAGIC_VOICE = 1015;

                VK_HID_END = 35;
                VK_HID_INSERT = 45;
                VK_HID_DEL = 46;
                VK_HID_CTRL = 17;
                VK_HID_ALT = 18;
                VK_HID_RT_ALT = 21;

                VK_CAPS_LOCK = 20;
                VK_SHIFT = 16;
                VK_LANG_SEL = 229;

                VK_0 = 48;
                VK_1 = 49;
                VK_2 = 50;
                VK_3 = 51;
                VK_4 = 52;
                VK_5 = 53;
                VK_6 = 54;
                VK_7 = 55;
                VK_8 = 56;
                VK_9 = 57;

                VK_NUMPAD_0 = 96;
                VK_NUMPAD_1 = 97;
                VK_NUMPAD_2 = 98;
                VK_NUMPAD_3 = 99;
                VK_NUMPAD_4 = 100;
                VK_NUMPAD_5 = 101;
                VK_NUMPAD_6 = 102;
                VK_NUMPAD_7 = 103;
                VK_NUMPAD_8 = 104;
                VK_NUMPAD_9 = 105;

                VK_GRAVE = 192;
                VK_DASH = 189;
                VK_EQUAL = 187;
                VK_BACK_SLASH = 220;
                VK_LEFT_BLACKET = 219;
                VK_RIGHT_BLACKET = 221;
                VK_SEMICOLON = 186;
                VK_APOSTROPHE = 222;
                VK_COMMA = 188;
                VK_PERIOD = 190;
                VK_SLASH = 191;
                VK_SPACE_BAR = 32;

                /*VK_A = 65;
                 VK_B = 66;
                 VK_C = 67;
                 VK_D = 68;
                 VK_E = 69;
                 VK_F = 70;
                 VK_G = 71;
                 VK_H = 72;
                 VK_I = 73;
                 VK_J = 74;
                 VK_K = 75;
                 VK_L = 76;
                 VK_M = 77;
                 VK_N = 78;
                 VK_O = 79;
                 VK_P = 80;
                 VK_Q = 81;
                 VK_R = 82;
                 VK_S = 83;
                 VK_T = 84;
                 VK_U = 85;
                 VK_V = 86;
                 VK_W = 87;
                 VK_X = 88;
                 VK_Y = 89;
                 VK_Z = 90;*/

                VK_VOL_UP = 0;
                VK_VOL_DOWN = 0;
                break;
            default:
                break;
        }


        if (typeof VK_BACK_SPACE === 'undefined') {
            VK_BACK_SPACE = 0;
        }
        if (typeof VK_BACK === 'undefined') {
            VK_BACK = 0;
        }
        if (typeof VK_EXIT === 'undefined') {
            VK_EXIT = 0;
        }
        if (typeof VK_FF === 'undefined') {
            VK_FF = 0;
        }
        if (typeof VK_RW === 'undefined') {
            VK_RW = 0;
        }
        if (typeof VK_FAST_FWD === 'undefined') {
            VK_FAST_FWD = 0;
        }
        if (typeof VK_REWIND === 'undefined') {
            VK_REWIND = 0;
        }
        if (typeof VK_VOL_UP === 'undefined') {
            VK_VOL_UP = 0;
        }
        if (typeof VK_VOL_DOWN === 'undefined') {
            VK_VOL_DOWN = 0;
        }
        if (typeof VK_MUTE === 'undefined') {
            VK_MUTE = 0;
        }
        if (typeof VK_HID_BACK === 'undefined') {
            VK_HID_BACK = 0;
        }
    };
    keyboard.fireClick = function (el) {
        var event;

        if ('createEvent' in d) {
            event = d.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            el.dispatchEvent(event);
        } else if (el.fireEvent) {
            el.fireEvent('onclick');
        }
    };
    keyboard.wheelAction = function (e) {
        e.preventDefault();
        e = e || window.event;

        var delta = e.deltaY || e.detail || e.wheelDelta;
        radio('app.key.wheel').broadcast({
            event: e,
            delta: delta
        });
    };
    keyboard.setWheelAction = function () {
        d.onmousewheel = this.wheelAction;
    };

    keyboard._init = function () {
        this.setVKScheme();
        this.setWheelAction();
        radio('app.keyboard.off').subscribe(function () {
            keyboard.isOpen = false;
        });
        radio('app.keyboard.on').subscribe(function () {
            keyboard.isOpen = true;
        });
        keyboard.isOpen = true;
        d.addEventListener('keydown', function (e) {
            if (!keyboard.isOpen) {
                e.preventDefault();
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                return;
            }
            var keyCode = e.keyCode || e.which;
            try {
                switch (keyCode) {
                    case VK_UP:
                        e.preventDefault();
                        radio('app.nav.up').broadcast();
                        break;
                    case VK_DOWN:
                        e.preventDefault();
                        radio('app.nav.down').broadcast();
                        break;
                    case VK_RIGHT:
                        e.preventDefault();
                        radio('app.nav.right').broadcast();
                        break;
                    case VK_LEFT:
                        e.preventDefault();
                        radio('app.nav.left').broadcast();
                        break;
                    case VK_ENTER:
                        radio('app.nav.enter').broadcast();
                        break;
                    case VK_PLAY:
                        radio('app.key.play').broadcast();
                        break;
                    case VK_PAUSE:
                        radio('app.key.pause').broadcast();
                        break;
                    case VK_PLAYPAUSE:
                        radio('app.key.playpause').broadcast();
                        break;
                    case VK_STOP:
                        radio('app.key.stop').broadcast();
                        break;
                    case VK_REWIND:
                    case VK_RW:
                        radio('app.key.rew').broadcast();
                        break;
                    case VK_FAST_FWD:
                    case VK_FF:
                        radio('app.key.ff').broadcast();
                        break;
                    case VK_BACK_SPACE:
                    case VK_BACK:
                    case VK_HID_BACK:
                        e.preventDefault();

                        radio('app.nav.back').broadcast();
                        break;
                    case VK_EXIT:
                        e.preventDefault();

                        radio('app.close').broadcast();
                        break;
                    case VK_VOL_UP:
                        radio('app.key.volume.up').broadcast();
                        break;
                    case VK_VOL_DOWN:
                        radio('app.key.volume.down').broadcast();
                        break;
                    case VK_MUTE:
                        radio('app.key.volume.mute').broadcast();
                        break;
                    default:
                        radio('app.keydown').broadcast({keyCode: keyCode});
                        break;
                }
            } catch (e) {
                radio('app.keydown').broadcast({keyCode: keyCode});
            }
        });

        return this;
    };

    if (window.pframe == null) {
        window.pframe = {}
    }
    window.pframe.key = keyboard._init();
})(document);
