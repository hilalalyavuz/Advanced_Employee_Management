const { sign, decode, verify } = require("jsonwebtoken");
const connectToDatabase = require("../lib/database");
// const uid = () => {
//   const head = Date.now().toString(36);
//   const tail = Math.random().toString(36).substr(2);
//   return head + tail;
// }
// var md5 = require('md5');

//! admin should not add users. Added user must have operating authority on it
const addUser = async (req, res) => {
  const { User, UserRole, Role } = await connectToDatabase();
  const model = req.body;
  console.log("gelen body:", model);
  const user = await User.findOne({
    where: { Email: model.email, IsDeleted: false },
  });
  if (user) {
    res.status(400).send({
      message: "Email is in use",
      ok: false,
    });
  } else {
    const roles = await Role.findAll({
      attributes: ["Id"],
    }).map((t) => {
      return { id: t.Id };
    });
    const roleCheck = roles.find((w) => w.id == model.roleId);
    if (roleCheck) {
      const userResult = await User.create({
        Name: model.name,
        Surname: model.surname,
        Password: md5(model.password),
        Email: model.email,
        CompanyId: model.companyId,
      });
      const userRoleResult = await UserRole.create({
        UserId: userResult.dataValues.Id,
        RoleId: model.roleId,
      });
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
  deleteUser
};
