odoo.define('pos_custom_theme.product_line_pop', function (require) {
    'use strict';

    const Registries = require('point_of_sale.Registries');
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');

    class ProductInfoEditPopup extends AbstractAwaitablePopup {

    };
    ProductInfoEditPopup.template = 'ProductInfoEditPopup';
    Registries.Component.add(ProductInfoEditPopup);
});