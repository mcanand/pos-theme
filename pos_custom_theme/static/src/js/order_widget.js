odoo.define('pos_custom_theme.order_widget', function (require) {
    'use strict';

    const OrderWidget = require('point_of_sale.OrderWidget');
    const Registries = require('point_of_sale.Registries');

    const PosThemeOrderWidget = (OrderWidget) => class extends OrderWidget {
        _updateSummary() {
            this.order.set_total_discount_amt()
            const freight_charge = this.order ? this.order.get_freight_charge() : 0;
            this.state.freight_charge = this.env.pos.format_currency(freight_charge);
            return super._updateSummary(...arguments);
//            const total = this.order ? this.order.get_total_with_tax() : 0;
//            const tax = this.order ? total - this.order.get_total_without_tax() : 0;
//            this.state.total = this.env.pos.format_currency(total);
//            this.state.tax = this.env.pos.format_currency(tax);
//            this.render();
        }
    };
    Registries.Component.extend(OrderWidget, PosThemeOrderWidget);
    return OrderWidget;
});