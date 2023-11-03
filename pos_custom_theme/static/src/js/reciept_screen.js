odoo.define('pos_custom_theme.ReceiptScreen', function (require) {
    'use strict';

    const { Printer } = require('point_of_sale.Printer');
    const { is_email } = require('web.utils');
    const { useRef, useContext } = owl.hooks;
    const { useErrorHandlers, onChangeOrder } = require('point_of_sale.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const ReceiptScreen = require('point_of_sale.ReceiptScreen');
    var ReceiptScreenInherit = (ReceiptScreen) => class extends ReceiptScreen{
        orderDone(){
            var res = super.orderDone(...arguments);
        }
    };
    Registries.Component.extend(ReceiptScreen, ReceiptScreenInherit);
    return ReceiptScreen
});