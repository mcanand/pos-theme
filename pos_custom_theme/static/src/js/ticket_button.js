odoo.define('pos_custom_theme.TicketButton', function (require) {
    'use strict';

    const TicketButton = require('point_of_sale.TicketButton');
    const Registries = require('point_of_sale.Registries');
     const { useState } = owl.hooks;
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const { isConnectionError } = require('point_of_sale.utils');
    const useSelectEmployee = require('pos_hr.useSelectEmployee');

    const PosThemeTicketButton = (TicketButton) => class extends TicketButton {
        constructor() {
            super(...arguments);
        }
        get count() {
            if (this.env.pos) {
                var order_list = this.env.pos.get_order_list()
                var new_list = []
                for(var i=0; i<order_list.length;i++){
                    if(!order_list[i].backendId){
                       new_list.push(order_list[i])
                    }
                }
                return new_list.length
            } else {
                return 0;
            }
        }
    }
    Registries.Component.extend(TicketButton, PosThemeTicketButton);
    return TicketButton;
});