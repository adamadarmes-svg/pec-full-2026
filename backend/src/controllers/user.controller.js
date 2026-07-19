const User = require("../models/User");

async function getUsers(req, res, next) {
  try {
    const usuarios = await User.find().sort({ nombre: 1 });
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const nuevo = await User.create(req.body);

    const { password, ...sinPassword } = nuevo.toObject();
    res.status(201).json(sinPassword);
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, getUser, createUser };
