var express = require('express');
var router = express.Router();
let { categories } = require('../utils/categoryData');
let { data: products } = require('../utils/data');
let { IncrementalId } = require('../utils/IncrementalIdHandler');
let slugify = require('slugify');

// GET all categories
router.get('/', function (req, res, next) {
    let nameQ = req.query.name ? req.query.name : '';
    let result = categories.filter(function (e) {
        return (!e.isDeleted) && e.name.toLowerCase().includes(nameQ.toLowerCase());
    });
    res.send(result);
});

// GET by Slug
router.get('/slug/:slug', function (req, res, next) {
    let result = categories.find(function (e) {
        return (!e.isDeleted) && e.slug == req.params.slug;
    });
    if (result) {
        res.send(result);
    } else {
        res.status(404).send({
            message: "SLUG NOT FOUND"
        });
    }
});

// GET products by category ID
router.get('/:id/products', function (req, res, next) {
    let result = products.filter(function (p) {
        return (!p.isDeleted) && p.category && p.category.id == req.params.id;
    });
    res.send(result);
});

// GET by ID
router.get('/:id', function (req, res, next) {
    let result = categories.find(function (e) {
        return (!e.isDeleted) && e.id == req.params.id;
    });
    if (result) {
        res.send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

// CREATE
router.post('/', function (req, res, next) {
    let newCategory = {
        id: IncrementalId(categories),
        name: req.body.name,
        slug: req.body.slug || slugify(req.body.name, {
            replacement: '-',
            lower: true,
            locale: 'vi',
        }),
        image: req.body.image || '',
        creationAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    categories.push(newCategory);
    res.send(newCategory);
});

// EDIT
router.put('/:id', function (req, res, next) {
    let result = categories.find(function (e) {
        return (!e.isDeleted) && e.id == req.params.id;
    });
    if (result) {
        let body = req.body;
        if (body.name) result.name = body.name;
        if (body.slug) result.slug = body.slug;
        if (body.image) result.image = body.image;
        result.updatedAt = new Date().toISOString();
        res.send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

// DELETE
router.delete('/:id', function (req, res, next) {
    let result = categories.find(function (e) {
        return (!e.isDeleted) && e.id == req.params.id;
    });
    if (result) {
        result.isDeleted = true;
        res.send(result);
    } else {
        res.status(404).send({
            message: "ID NOT FOUND"
        });
    }
});

module.exports = router;
