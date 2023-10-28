odoo.define('pos_custom_theme.ProductScreen', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');

    const PosThemeProductScreen = (ProductScreen) => class extends ProductScreen {
            constructor() {
                super(...arguments);
                this.state.theme = this.env.pos.config.themes
            }
        };
    Registries.Component.extend(ProductScreen, PosThemeProductScreen);
    return ProductScreen;
});