var express = require('express');
var router = express.Router();
let { users } = require('../utils/userData');
let { roles } = require('../utils/roleData');
let { IncrementalId } = require('../utils/IncrementalIdHandler');

// GET all users
router.get('/', function (req, res, next) {
    let result = users.filter(function (e) {
        return !e.isDeleted;
    }).map(function (e) {
        let role = roles.find(function (r) { return r.id == e.role; });
        return { ...e, role: role || e.role };
    });
    res.send(result);
});

// GET user by ID
router.get('/:id', function (req, res, next) {
    let result = users.find(function (e) {
        return !e.isDeleted && e.id == req.params.id;
    });
    if (result) {
        let role = roles.find(function (r) { return r.id == result.role; });
        res.send({ ...result, role: role || result.role });
    } else {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// CREATE user
router.post('/', function (req, res, next) {
    let { username, password, email, fullName, avatarUrl, role } = req.body;

    if (!username || !password || !email) {
        return res.status(400).send({ message: "username, password, email are required" });
    }

    // Check unique username
    let existedUsername = users.find(function (e) {
        return !e.isDeleted && e.username === username;
    });
    if (existedUsername) {
        return res.status(400).send({ message: "Username already exists" });
    }

    // Check unique email
    let existedEmail = users.find(function (e) {
        return !e.isDeleted && e.email === email;
    });
    if (existedEmail) {
        return res.status(400).send({ message: "Email already exists" });
    }

    let newUser = {
        id: IncrementalId(users),
        username: username,
        password: password,
        email: email,
        fullName: fullName || "",
        avatarUrl: avatarUrl || "https://i.sstatic.net/l60Hf.png",
        status: false,
        role: role || null,
        loginCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    res.send(newUser);
});

// UPDATE user
router.put('/:id', function (req, res, next) {
    let result = users.find(function (e) {
        return !e.isDeleted && e.id == req.params.id;
    });
    if (result) {
        let body = req.body;

        // Check unique username if changed
        if (body.username && body.username !== result.username) {
            let existed = users.find(function (e) {
                return !e.isDeleted && e.username === body.username && e.id !== result.id;
            });
            if (existed) {
                return res.status(400).send({ message: "Username already exists" });
            }
            result.username = body.username;
        }

        // Check unique email if changed
        if (body.email && body.email !== result.email) {
            let existed = users.find(function (e) {
                return !e.isDeleted && e.email === body.email && e.id !== result.id;
            });
            if (existed) {
                return res.status(400).send({ message: "Email already exists" });
            }
            result.email = body.email;
        }

        if (body.password) result.password = body.password;
        if (body.fullName !== undefined) result.fullName = body.fullName;
        if (body.avatarUrl !== undefined) result.avatarUrl = body.avatarUrl;
        if (body.status !== undefined) result.status = body.status;
        if (body.role !== undefined) result.role = body.role;
        if (body.loginCount !== undefined && body.loginCount >= 0) result.loginCount = body.loginCount;
        result.updatedAt = new Date().toISOString();
        res.send(result);
    } else {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// DELETE (soft delete)
router.delete('/:id', function (req, res, next) {
    let result = users.find(function (e) {
        return !e.isDeleted && e.id == req.params.id;
    });
    if (result) {
        result.isDeleted = true;
        res.send(result);
    } else {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// POST /enable - enable user by email & username
router.post('/enable', function (req, res, next) {
    let { email, username } = req.body;

    if (!email || !username) {
        return res.status(400).send({ message: "email and username are required" });
    }

    let result = users.find(function (e) {
        return !e.isDeleted && e.email === email && e.username === username;
    });

    if (result) {
        result.status = true;
        result.updatedAt = new Date().toISOString();
        res.send(result);
    } else {
        res.status(404).send({ message: "User not found or info incorrect" });
    }
});

// POST /disable - disable user by email & username
router.post('/disable', function (req, res, next) {
    let { email, username } = req.body;

    if (!email || !username) {
        return res.status(400).send({ message: "email and username are required" });
    }

    let result = users.find(function (e) {
        return !e.isDeleted && e.email === email && e.username === username;
    });

    if (result) {
        result.status = false;
        result.updatedAt = new Date().toISOString();
        res.send(result);
    } else {
        res.status(404).send({ message: "User not found or info incorrect" });
    }
});

module.exports = router;
