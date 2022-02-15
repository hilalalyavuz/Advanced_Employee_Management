const { sign, decode, verify } = require("jsonwebtoken");
const connectToDatabase = require("../lib/database");

const addUser = async (req, res) => {
  const { User, UserRole, Role } = await connectToDatabase();
  if (req.session.role != 2) {
    res.redirect("/notFound");
  } else {
    const isUserExist = User.findOne({
      where: { Email: model.email, IsDeleted: false },
    });
    if (!isUserExist) {
      res.redirect("/notFound");
    } else {
      await UserRole.update({
        RoleId: model.role,
        where: { UserId: isUserExist.Id },
      });
      res.redirect("/admin");
    }
  }

  res.render("index", { users: users });
};

const assignRole = async (req, res) => {
  const { User, UserRole } = await connectToDatabase();
  const model = req.body;
  if (req.session.role != 3) {
    res.redirect("/notFound");
  } else {
    const isUserExist = User.findOne({
      where: { Email: model.email, IsDeleted: false },
    });
    if (!isUserExist) {
      res.redirect("/notFound");
    } else {
      await UserRole.update({
        RoleId: model.role,
        where: { UserId: isUserExist.Id },
      });
      res.redirect("/admin");
    }
  }
};

module.exports = {
  addUser,
  assignRole,
};
