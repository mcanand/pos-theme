odoo.define('pos_custom_theme.ReprintReceiptScreen', function (require) {
    'use strict';

    const ReprintReceiptScreen = require('point_of_sale.ReprintReceiptScreen');
    const Registries = require('point_of_sale.Registries');
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const { isConnectionError } = require('point_of_sale.utils');
    const useSelectEmployee = require('pos_hr.useSelectEmployee');

    const PosThemeReprintReceiptScreen = (ReprintReceiptScreen) => class extends ReprintReceiptScreen {
        constructor(){
//            this.props.fromProductScreen = false
            super(...arguments);
        }
        confirm() {
            if(this.props.fromProductScreen){
                this.showScreen('ProductScreen', {});
            }
            else{
                this.showScreen('TicketScreen', { reuseSavedUIState: true });
            }
        }
    }
    Registries.Component.extend(ReprintReceiptScreen, PosThemeReprintReceiptScreen);
    return ReprintReceiptScreen;
});