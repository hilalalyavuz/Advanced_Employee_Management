const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const nodemailer = require("nodemailer");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotalySecretKey");
const connectToDatabase = require("../lib/database");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
var md5 = require("md5");
const moment = require("moment");

const uid = () => {
  const head = Date.now().toString(36);
  const tail = Math.random().toString(36).substr(2);
  return head + tail;
};

router.get("/", async (req, res) => {
  console.log("role id:", typeof req.session.role);
  console.log("quarantine:", req.session.quarantine);
  if (req.session.loggedinUser) {
    res.render("index", {
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else if (req.session.loggedinUser && req.session.role == 3) {
    res.redirect("/admin");
  } else {
    res.render("login");
  }
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login", {
    loginn: req.session.loggedinUser,
    email: req.session.emailAddress,
    role: req.session.role,
    fullname: req.session.fullname,
    usercode: req.session.usercode,
    company: req.session.company,
    quarantine: req.session.quarantine,
    quarantineEndDate: req.session.quarantineEndDate,
  });
});

router.get("/ownerpanel", async (req, res) => {
  if (req.session.role == 2) {
    const { User, UserRole, Role, Company, sequelize } =
      await connectToDatabase(true);
    const users = await User.findAll({
      where: { IsDeleted: false, CompanyId: req.session.company },
      include: [
        {
          model: UserRole,
          include: {
            model: Role,
            attributes: ["Name"],
            required: true,
          },
          attributes: ["RoleId"],
          required: true,
        },
        {
          model: Company,
          attributes: ["Name"],
          required: true,
        },
      ],
      attributes: ["CompanyId", "Name", "Surname", "Email", "Id"],
    }).map((t) => {
      return {
        id: t.Id,
        companyId: t.CompanyId,
        name: t.Name,
        surname: t.Surname,
        email: t.Email,
        role: t.UserRoles[0].Role.Name,
        companyName: t.Company.Name,
        company: req.session.company,
      };
    });
    const deleteUsers = await sequelize
      .query(
        "select u.Name,u.Surname,u.email,u.id from user u inner join userrole ur on u.Id = ur.UserId  where u.CompanyId = (:company_id) and ur.RoleId = 1 and u.IsDeleted = 0",
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { company_id: req.session.company },
        }
      )
      .map((t) => {
        return {
          fullname: t.Name + " " + t.Surname,
          user_mail: t.email,
          user_id: t.id,
        };
      });
    const changeRoom = await sequelize
      .query(
        "select Name,Capacity,id from room where CompanyId = (:company_id) ",
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { company_id: req.session.company },
        }
      )
      .map((t) => {
        return {
          roomName: t.Name,
          capacity: t.Capacity,
          roomId: t.id,
        };
      });

    const rolesUsers = await sequelize
      .query(
        "select u.Name,u.Surname,u.email,u.id,r.name from user u inner join userrole ur on u.Id = ur.UserId inner join role r on ur.RoleId = r.Id where u.CompanyId = (:company_id) and ur.RoleId = 1 and u.IsDeleted = 0",
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { company_id: req.session.company },
        }
      )
      .map((t) => {
        return {
          fullname: t.Name + " " + t.Surname,
          user_role: t.name,
          user_id: t.id,
        };
      });

    const verifiedUsers = await sequelize
      .query(
        "select u.Name,u.Surname,u.email,u.id,r.name from user u inner join userrole ur on u.Id = ur.UserId inner join role r on ur.RoleId = r.Id where u.CompanyId = (:company_id) and ur.RoleId = 1 and u.IsDeleted = 0 and u.Isverified = 0",
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { company_id: req.session.company },
        }
      )
      .map((t) => {
        return {
          fullname: t.Name + " " + t.Surname,
          user_mail: t.email,
          user_id: t.id,
        };
      });

    res.render("ownerpanel", {
      users,
      deleteUsers,
      changeRoom,
      rolesUsers,
      verifiedUsers,
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else {
    res.render("notFound");
  }
});

// router.get("/chair", (req, res) => {
//   res.render("Chair"),
//     {
//       loginn: req.session.loggedinUser,
//       email: req.session.emailAddress,
//       role: req.session.role,
//       fullname: req.session.fullname,
//       usercode: req.session.usercode,
//       company: req.session.company,
//       quarantine: req.session.quarantine,
//       quarantineEndDate:req.session.quarantineEndDate,
//     };
// });

router.get("/index", (req, res) => {
  if (req.session.loggedinUser && req.session.role == 1) {
    res.render("index", {
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else if (req.session.loggedinUser && req.session.role == 2) {
    res.render("index", {
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else if (req.session.loggedinUser && req.session.role == 3) {
    res.redirect("admin");
  } else {
    res.render("login");
  }
});

router.get("/Profile", async (req, res) => {
  if (req.session.loggedinUser) {
    const { User, UserRole, Role, Company, sequelize } =
      await connectToDatabase(true);
    const users = await User.findAll({
      where: { IsDeleted: false, Id: req.session.usercode },
      include: [
        {
          model: UserRole,
          include: {
            model: Role,
            attributes: ["Name"],
            required: true,
          },
          attributes: ["RoleId"],
          required: true,
        },
        {
          model: Company,
          attributes: ["Name"],
          required: true,
        },
      ],
      attributes: ["CompanyId", "Name", "Surname", "Email", "Id"],
    }).map((t) => {
      return {
        id: t.Id,
        companyId: t.CompanyId,
        name: t.Name,
        surname: t.Surname,
        email: t.Email,
        role: t.UserRoles[0].Role.Name == 1 ? 1 : 0,
        companyName: t.Company.Name,
      };
    });

    const reservations = await sequelize
      .query(
        "SELECT re.dateFrom, re.isReserveOrSeat, ro.Name, re.Id FROM reservation re inner join room ro on re.room_id = ro.Id where re.user_id = (:id) and dateFrom >= (select CAST( NOW() AS Date )) and re.isReserveOrSeat = 0",
        {
          type: sequelize.QueryTypes.SELECT,

          replacements: { id: req.session.usercode },
        }
      )
      .map((t) => {
        return {
          reserveDate: t.dateFrom,
          isRoom: t.isReserveOrSeat == 0 ? true : false,
          rsvRoomName: t.Name,
          reserveId: t.Id,
        };
      });

    const seatReserve = await sequelize
      .query(
        "SELECT re.dateFrom, re.SeatNo , re.Id FROM reservation re where re.user_id = (:id) and dateFrom >= (select CAST( NOW() AS Date )) and re.isReserveOrSeat = 1",
        {
          type: sequelize.QueryTypes.SELECT,

          replacements: { id: req.session.usercode },
        }
      )
      .map((t) => {
        return {
          reserveDate: t.dateFrom,
          isRoom: t.isReserveOrSeat == 0 ? true : false,
          rsvSeatNo: t.SeatNo,
          reserveId: t.Id,
        };
      });

    res.render("profile", {
      users,
      reservations,
      seatReserve,
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      isEmployee: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
      role: req.session.role,
    });
  } else {
    res.render("login");
  }
});

router.get("/admin", async (req, res) => {
  if (req.session.role == 3) {
    const { User, UserRole, Role, Company } = await connectToDatabase();
    const users = await User.findAll({
      where: { IsDeleted: false },
      include: [
        {
          model: UserRole,
          include: {
            model: Role,
            attributes: ["Name"],
            required: true,
          },
          attributes: ["RoleId"],
          required: true,
        },
        {
          model: Company,
          attributes: ["Name"],
          required: true,
        },
      ],
      attributes: ["CompanyId", "Name", "Surname", "Email", "Id"],
    }).map((t) => {
      return {
        id: t.Id,
        companyId: t.CompanyId,
        name: t.Name,
        surname: t.Surname,
        email: t.Email,
        role: t.UserRoles[0].Role.Name,
        companyName: t.Company.Name,
      };
    });
    console.log(req.session.role);
    res.render("admin", {
      users,
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else {
    res.render("notFound");
  }
});

router.get("/user/delete/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase();
  if (req.session.role == 3) {
    const isUserExist = await User.findOne({
      where: { Id: id },
    });
    await User.update(
      {
        IsDeleted: true,
      },
      { where: { Id: id } }
    );
    await UserRole.destroy({
      where: { UserId: isUserExist.Id },
    });
  }
  res.redirect("/admin");
});

router.get("/setAdmin/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase();
  if (req.session.role == 3) {
    const isUserExist = await User.findOne({
      where: { Id: id },
    });
    await UserRole.update(
      {
        RoleId: 3,
      },
      { where: { UserId: id } }
    );
  }
  res.redirect("/admin");
});

router.get("/setOwner/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase();
  if (req.session.role == 3 || req.session.role == 2) {
    const isUserExist = await User.findOne({
      where: { Id: id },
    });
    await UserRole.update(
      {
        RoleId: 2,
      },
      { where: { UserId: id } }
    );
  }
  res.redirect("/admin");
});

router.get("/setEmployee/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase();
  if (req.session.role == 3 || req.session.role == 2) {
    const isUserExist = await User.findOne({
      where: { Id: id },
    });
    await UserRole.update(
      {
        RoleId: 1,
      },
      { where: { UserId: id } }
    );
  }
  res.redirect("/admin");
});

router.get("/room", (req, res) => {
  if (req.session.loggedinUser) {
    res.render("room", {
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else {
    res.render("notFound");
  }
});

router.get("/reserveroom/:id", async (req, res) => {
  const id = req.params.id;
  const user_idd = req.session.usercode;
  const { User, UserRole, sequelize, Reservation } = await connectToDatabase(
    true
  );
  const userResult = await Reservation.create({
    room_id: id,
    user_id: user_idd,
    seat_id: null,
    dateFrom: req.session.date,
    isReserveOrSeat: 0,
  });

  res.redirect("/profile");
});

router.post("/room", async (req, res) => {
  if (req.session.loggedinUser) {
    req.session.date = req.body.date;
    const { User, UserRole, Role, Company, sequelize } =
      await connectToDatabase(true);
    console.log(req.body.date);
    console.log(req.session.company);
    const rooms = await sequelize
      .query(
        "select Id,Name,Capacity from room where Id NOT IN (select re.room_id from reservation re inner join room r on re.room_id = r.Id where re.dateFrom = (:date) and r.CompanyId = (:id) and re.isReserveOrSeat = 0) and CompanyId = (:id)",
        {
          type: sequelize.QueryTypes.SELECT,

          replacements: { id: req.session.company, date: req.body.date },
        }
      )
      .map((t) => {
        return {
          room_id: t.Id,
          roomName: t.Name,
          roomCapacity: t.Capacity,
          reserveDate: req.body.date,
        };
      });
    console.log(rooms);
    res.render("Room", {
      rooms,
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else {
    res.render("login");
  }
});
router.get("/deleteduser/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase(true);
  await User.update(
    {
      IsDeleted: true,
    },
    { where: { Id: id } }
  );
  await UserRole.destroy({
    where: { UserId: id },
  });
  res.redirect("/ownerpanel");
});

router.post("/ownerAddRoom", async (req, res) => {
  model = req.body;
  const { Room, UserRole, sequelize, Reservation } = await connectToDatabase(
    true
  );
  const roomResult = await Room.create({
    Name: model.room_name,
    Capacity: model.room_capacity,
    CompanyId: req.session.company,
  });
  res.redirect("/ownerpanel");
});

router.post("/updaterooms/:id", async (req, res) => {
  model = req.body;
  const id = req.params.id;
  const { Room, sequelize } = await connectToDatabase();
  const isRoomExist = await Room.findOne({
    where: { Id: id },
  });
  if (model.room_capacity == "" && model.room_name != "") {
    await Room.update(
      {
        Name: model.room_name,
      },
      { where: { Id: id } }
    );
  } else if (model.room_capacity != "" && model.room_name == "") {
    await Room.update(
      {
        Capacity: model.room_capacity,
      },
      { where: { Id: id } }
    );
  } else if (model.room_capacity != "" && model.room_name != "") {
    await Room.update(
      {
        Name: model.room_name,
        Capacity: model.room_capacity,
      },
      { where: { Id: id } }
    );
  } else {
    res.redirect("/ownerpanel");
  }
  res.redirect("/ownerpanel");
});

router.get("/cancelreservation/:id", async (req, res) => {
  const id = req.params.id;
  const { Reservation } = await connectToDatabase();
  await Reservation.destroy({
    where: { Id: id },
  });
  res.redirect("/profile");
});
router.post("/adduserasowner", async (req, res) => {
  model = req.body;
  const { User, UserRole } = await connectToDatabase(true);
  const userResult = await User.create({
    Name: model.name,
    Surname: model.surname,
    Email: model.mail,
    Password: uid(),
    CompanyId: req.session.company,
    IsDeleted: 0,
    EmailConfirmGuid: uid(),
    ısEmailConfirmed: 0,
  });
  const userRoleResult = await UserRole.create({
    UserId: userResult.dataValues.Id,
    RoleId: 1,
  });
  res.redirect("/ownerpanel");
});

router.get("/setEmployeeOwner/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase();
  if (req.session.role == 3 || req.session.role == 2) {
    const isUserExist = await User.findOne({
      where: { Id: id },
    });
    await UserRole.update(
      {
        RoleId: 1,
      },
      { where: { UserId: id } }
    );
  }
  res.redirect("/ownerpanel");
});
router.get("/setOwnerOwner/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase();
  if (req.session.role == 3 || req.session.role == 2) {
    const isUserExist = await User.findOne({
      where: { Id: id },
    });
    await UserRole.update(
      {
        RoleId: 2,
      },
      { where: { UserId: id } }
    );
  }
  res.redirect("/ownerpanel");
});

router.post("/chair", async (req, res) => {
  const { User, UserRole, Company, Reservation, Seat } =
    await connectToDatabase(true);
  console.log("date:", req.body.date);
  const date = moment(req.body.date).add(3, "hours");
  let company = req.session.company;
  // console.log("date:",date)
  // console.log("company:",company)
  const chairArrays = [];
  let companyChairCount;
  // console.log("usercode:", req.session.usercode);
  const reservedSeats = await Reservation.findAll({
    where: {
      seat_id: {
        [Op.not]: null,
      },
      dateFrom: {
        [Op.gte]: date,
        [Op.lt]: moment(date).add(1, "days"),
      },
    },
    include: {
      model: Seat,
      where: {
        CompanyId: company,
      },
      attributes: ["Count"],
    },
  }).map((t) => {
    companyChairCount = t.Seat.dataValues.Count;
    return {
      SeatNo: t.SeatNo,
    };
  });

  if (!companyChairCount) {
    const chairCount = await Seat.findOne({
      where: {
        CompanyId: company,
      },
    });
    companyChairCount = chairCount.Count;
    console.log("chair count:", chairCount.Count);
  }

  let i = 0;
  while (i < companyChairCount) {
    console.log("girdi");
    let groupNo;
    if (companyChairCount - i >= 4) {
      groupNo = 4;
    } else {
      groupNo = companyChairCount - i;
    }
    let tmp = [];
    for (let m = 0; m < groupNo; m++) {
      const seatCheck = reservedSeats.find((w) => w.SeatNo == i + 1);
      if (seatCheck) {
        tmp.push({ SeatNo: i + 1, isReserved: true });
      } else {
        tmp.push({ SeatNo: i + 1, isReserved: false });
      }
      i++;
    }
    chairArrays.push(tmp);
  }

  console.log("chairArrays:", chairArrays);
  req.session.date = date;
  res.render("Chair", {
    loginn: req.session.loggedinUser,
    email: req.session.emailAddress,
    role: req.session.role,
    chairArrays,
    date: req.session.date,
    fullname: req.session.fullname,
    usercode: req.session.usercode,
    company: req.session.company,
    quarantine: req.session.quarantine,
    quarantineEndDate: req.session.quarantineEndDate,
  });
});

router.get("/reservechair/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole, Reservation, Seat } = await connectToDatabase();
  const seatId = await Seat.findOne({
    where: { CompanyId: req.session.company, IsDeleted: false },
  });
  const userResult = await Reservation.create({
    SeatNo: id,
    user_id: req.session.usercode,
    seat_id: seatId.Id,
    dateFrom: req.session.date,
    isReserveOrSeat: 1,
  });

  res.redirect("/profile");
});

router.get("/verifyuser/:id", async (req, res) => {
  const id = req.params.id;
  const { User } = await connectToDatabase();
  const users = await User.findOne({
    where: { Id: id },
  });
  console.log(users.Email);
  //* Creating transport to send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "snolldestek@gmail.com",
      pass: "snoll123",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  //* Create the mail body
  var mailOptions = {
    from: "snolldestek@gmail.com",
    to: users.Email,
    subject: "Tebrikler",
    text:
      "Burada ki bağlantıyı kullanarak şifrenizi oluşturabilirsiniz http://localhost:3000/verifyemployee/" +
      id,
  };
  //* Sends email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  res.redirect("/ownerpanel");
});

router.get("/verifyemployee/:id", async (req, res) => {
  const id = req.params.id;
  req.session.verUserId = id;

  res.render("setpassword"),
    {
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      chairs: chairArrays,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    };
});

router.post("/setnewpassword", async (req, res) => {
  model = req.body;
  if (model.password == model.confirmpass) {
    const { User, UserRole } = await connectToDatabase(true);
    const isUserExist = await User.findOne({
      where: { Id: req.session.verUserId },
    });
    await User.update(
      {
        Password: md5(model.password),
        IsVerified: 1,
      },
      { where: { Id: req.session.verUserId } }
    );
    res.redirect("/login");
  } else {
    console.log("notFound"); //! Buraya bir hata döndürme sayfası lazım önemli.
  }
  res.redirect("/successPage"); //Buraya da bir başarılı sayfası lazım.
});

router.get("/forgetPassword", (req, res) => {
  res.render("forgetPassword");
});

router.get("/markpositive/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole } = await connectToDatabase();
  const isUserExist = await User.findOne({
    where: { Id: id },
  });

  const quarantineEndDate = moment().add(14, "days");
  await User.update(
    {
      InQuarantine: true,
      QuarantineEndDate: quarantineEndDate,
    },
    { where: { Id: id } }
  );
  await Reservation.destroy({
    where: {
      dateFrom: {
        [Op.gte]: moment().utc(),
        [Op.lt]: moment().utc().add(14, "days"),
      },
    },
  });
  res.redirect("/ownerpanel");
});

router.get("/markcontact/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole, Reservation } = await connectToDatabase();
  const isUserExist = await User.findOne({
    where: { Id: id },
  });

  const quarantineEndDate = moment().add(7, "days");
  await User.update(
    {
      InQuarantine: true,
      QuarantineEndDate: quarantineEndDate,
    },
    { where: { Id: id } }
  );

  await Reservation.destroy({
    where: {
      dateFrom: {
        [Op.gte]: moment().utc(),
        [Op.lt]: moment().utc().add(7, "days"),
      },
    },
  });
  res.redirect("/ownerpanel");
});

router.post("/showReport", async (req, res) => {
  model = req.body;
  const { User, UserRole, sequelize } = await connectToDatabase(true);
  const showReport = await sequelize
    .query(
      "select distinct(u.Name), u.Surname, u.Email , u.Id from reservation r inner join user u on r.user_id = u.Id where r.dateFrom = (:datee) and r.room_id IN (select Id from room where CompanyId = (:company_id)) or r.seat_id IN (select Id from seat where CompanyId = (:company_id)) ",
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { datee: model.date, company_id: req.session.company },
      }
    )
    .map((t) => {
      return {
        fullname: t.Name + " " + t.Surname,
        user_mail: t.Email,
        user_id: t.Id,
        rsvDate: model.date,
      };
    });

  res.render("showReport", {
    showReport,
    loginn: req.session.loggedinUser,
    email: req.session.emailAddress,
    role: req.session.role,
    fullname: req.session.fullname,
    usercode: req.session.usercode,
    company: req.session.company,
    quarantine: req.session.quarantine,
    quarantineEndDate: req.session.quarantineEndDate,
  });
});

router.get("/dailyReport", (req, res) => {
  if (req.session.role == 2) {
    res.render("dailyReport", {
      loginn: req.session.loggedinUser,
      email: req.session.emailAddress,
      role: req.session.role,
      fullname: req.session.fullname,
      usercode: req.session.usercode,
      company: req.session.company,
      quarantine: req.session.quarantine,
      quarantineEndDate: req.session.quarantineEndDate,
    });
  } else {
    res.render("notFound");
  }
});

router.get("/notFound", (req, res) => {
  res.render("notFound");
});

router.get("/successPage", (req, res) => {
  res.render("successPage");
});

router.post("/setchair", async (req, res) => {
  let model = req.body;
  const { Seat } = await connectToDatabase();

  const seatId = await Seat.findOne({
    where: { CompanyId: req.session.company, IsDeleted: false },
  });
  if (seatId) {
    console.log("if ici");
    await Seat.update(
      {
        Count: model.chairCount,
      },
      { where: { Id: seatId.Id } }
    );
  } else {
    console.log("else ici");
    const seatResult = await Seat.create({
      CompanyId: req.session.company,
      Count: model.chairCount,
    });
  }

  res.redirect("/successPage"); //Buraya da bir başarılı sayfası lazım.
});

router.post("/forgetpassword", async (req, res) => {
  let model = req.body;
  const { User } = await connectToDatabase();

  const userId = await User.findOne({
    where: { Email: model.email, IsDeleted: false },
    attributes: ["Id"],
  });
  if (userId) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "snolldestek@gmail.com",
        pass: "snoll123",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    //* Create the mail body
    var mailOptions = {
      from: "snolldestek@gmail.com",
      to: model.email,
      subject: "Tebrikler",
      text:
        "Burada ki bağlantıyı kullanarak şifrenizi değiştirebilirsiniz http://localhost:3000/changepass/"+userId.Id
    };
    //* Sends email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

  } else {
    // Burada hata döndürmesi lazım
  }

  res.redirect("/successPage"); //Buraya da bir başarılı sayfası lazım.
});

router.get("/changepassed/:id", async (req, res) => {
  const id = req.params.id;
  const { User, UserRole, Reservation } = await connectToDatabase();
  const isUserExist = await User.findOne({
    where: { Id: id },
  });
  await User.update(
    {
      pass: true,
      QuarantineEndDate: quarantineEndDate,
    },
    { where: { Id: id } }
  );
  res.redirect("/successPage");
});

router.get("/changepass/:id", async (req, res) => {
  const id = req.params.id;
  req.session.changeuserid = id
  res.render("setzeropassword");
});

router.get("/setzeropassword", async (req, res) => {
  res.render("setzeropassword");
});

router.post("/setzeronewpassword", async (req, res) => {
  model = req.body;
  if (model.password == model.confirmpass) {
    const { User, UserRole } = await connectToDatabase(true);
    const isUserExist = await User.findOne({
      where: { Id: req.session.changeuserid },
    });
    await User.update(
      {
        Password: md5(model.password),
        IsVerified: 1,
      },
      { where: { Id: req.session.changeuserid } }
    );
    res.redirect("/successPage");
  } else {
    res.redirect("/setzeropassword"); //! Buraya bir hata döndürme sayfası lazım önemli.
  }
});

module.exports = router;
