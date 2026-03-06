var express = require('express');
var router = express.Router();
let { roles } = require('../utils/roleData');
let { IncrementalId } = require('../utils/IncrementalIdHandler');

// GET all roles
router.get('/', function (req, res, next) {
    let result = roles.filter(function (e) {
        return !e.isDeleted;
    });
    res.send(result);
});

// GET role by ID
router.get('/:id', function (req, res, next) {
    let result = roles.find(function (e) {
        return !e.isDeleted && e.id == req.params.id;
    });
    if (result) {
        res.send(result);
    } else {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// CREATE role
router.post('/', function (req, res, next) {
    let { name, description } = req.body;

    if (!name) {
        return res.status(400).send({ message: "name is required" });
    }

    // Check unique name
    let existed = roles.find(function (e) {
        return !e.isDeleted && e.name === name;
    });
    if (existed) {
        return res.status(400).send({ message: "Role name already exists" });
    }

    let newRole = {
        id: IncrementalId(roles),
        name: name,
        description: description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    roles.push(newRole);
    res.send(newRole);
});

// UPDATE role
router.put('/:id', function (req, res, next) {
    let result = roles.find(function (e) {
        return !e.isDeleted && e.id == req.params.id;
    });
    if (result) {
        let body = req.body;

        // Check unique name if changed
        if (body.name && body.name !== result.name) {
            let existed = roles.find(function (e) {
                return !e.isDeleted && e.name === body.name && e.id !== result.id;
            });
            if (existed) {
                return res.status(400).send({ message: "Role name already exists" });
            }
            result.name = body.name;
        }

        if (body.description !== undefined) result.description = body.description;
        result.updatedAt = new Date().toISOString();
        res.send(result);
    } else {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// DELETE (soft delete)
router.delete('/:id', function (req, res, next) {
    let result = roles.find(function (e) {
        return !e.isDeleted && e.id == req.params.id;
    });
    if (result) {
        result.isDeleted = true;
        res.send(result);
    } else {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

module.exports = router;
