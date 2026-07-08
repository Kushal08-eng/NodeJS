const express = require("express");
const { handleGetAllUsers, handleGetUserById, handleUpdateUserById, handleDeleteUserById, handleCreateNewUser } = require("../controller/user");

const router = express.Router();

//REST Api

// router.get('/', handleGetAllUsers)
// router.post("/", handleCreateNewUser);

router.route("/")
    .get(handleGetAllUsers)
    .post(handleCreateNewUser);

router.
    route('/:id')
    .get(handleGetUserById)
    .patch(handleUpdateUserById)
    .delete(handleDeleteUserById)


module.exports = router;