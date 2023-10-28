odoo.define('pos_custom_theme.product_info', function (require) {
    'use strict';

    const ProductInfoPopup = require('point_of_sale.ProductInfoPopup');
    const Registries = require('point_of_sale.Registries');
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');

    class ProductInfoEditPopup extends AbstractAwaitablePopup {

    };
    ProductInfoPopup.template = 'ProductInfoEditPopup';
    Registries.Component.add(ProductInfoEditPopup);
});