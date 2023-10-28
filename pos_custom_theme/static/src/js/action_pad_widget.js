odoo.define('pos_custom_theme.ActionpadWidget', function (require) {
    'use strict';

    const ActionpadWidget = require('point_of_sale.ActionpadWidget');
    const Registries = require('point_of_sale.Registries');

    const PosThemeActionpadWidget = (ActionpadWidget) => class extends ActionpadWidget {

    };
    Registries.Component.extend(ActionpadWidget, PosThemeActionpadWidget);
    return ActionpadWidget;
});
