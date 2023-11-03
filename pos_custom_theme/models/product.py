from odoo import fields, models, api
from odoo.tools import format_amount


class ProductProduct(models.Model):
    _inherit = 'product.product'

    local_name = fields.Char()

    def search_custom_product(self, vals):
        products = self.env['product.product'].search([('name', 'ilike', vals.get('key')),('available_in_pos','=', True)])
        print([x.name for x in products])
        print(products.ids)
        return products.ids

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    local_name = fields.Char(compute="_compute_local_name", inverse="_set_local_name")

    @api.model_create_multi
    def create(self, vals_list):
        templates = super(ProductTemplate, self).create(vals_list)
        for template, vals in zip(templates, vals_list):
            related_vals = {}
            if vals.get('local_name'):
                related_vals['local_name'] = vals['local_name']
            if vals.get('tax_amount'):
                related_vals['tax_amount'] = vals['tax_amount']
            if related_vals:
                template.write(related_vals)
        return templates

    @api.depends_context('company')
    @api.depends('product_variant_ids', 'product_variant_ids.local_name')
    def _compute_local_name(self):
        for rec in self:
            # Depends on force_company context because standard_price is company_dependent
            # on the product_product
            unique_variants = rec.filtered(lambda template: len(template.product_variant_ids) == 1)
            for template in unique_variants:
                template.local_name = template.product_variant_ids.local_name
            for template in (rec - unique_variants):
                template.local_name = ''

    def _set_local_name(self):
        for template in self:
            if len(template.product_variant_ids) == 1:
                template.product_variant_ids.local_name = template.local_name
