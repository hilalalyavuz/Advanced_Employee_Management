const { sign, decode, verify } = require("jsonwebtoken");
const connectToDatabase = require("../lib/database");
var md5 = require('md5');
var nodemailer = require("nodemailer");
const moment = require('moment');
const uid = () => {
  const head = Date.now().toString(36);
  const tail = Math.random().toString(36).substr(2);
  return head + tail;
}

const register = async (req, res) => {
  const { User, UserRole, Role, Company } = await connectToDatabase();
  const model = req.body;
  //* Checks if the user exist
  if (model.password !== model.passwordApprove) {
    //! Error
    res.status(400).send({
      message: "[REGISTER COMPLETE STAKEHOLDER ERROR]",
      data: { error: "password do not match!", ok: false },
    });
  } else {
    try {
      const uuid = uid();
    const companyResult = await Company.create({
      Name: model.companyName
    })
    const userResult = await User.create({
      Name: model.name,
      Surname: model.surname,
      Password: md5(model.password),
      Email: model.email,
      CompanyId: companyResult.dataValues.Id,
      EmailConfirmGuid: uuid
    });
    const userRoleResult = await UserRole.create({
      UserId: userResult.dataValues.Id,
      RoleId: 1,
    });

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
      to: model.email,
      subject: "Tebrikler",
      text:
        "Burada ki bağlantıyı kullanarak şifrenizi oluşturabilirsiniz http://localhost:3000/user/registerapprove/" +
        uuid,
    };
    //* Sends email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.render("login");

    } catch (error) {
      console.log("[USER REGISTER ERROR]",error.message)
      // res.render("notFound");

    }

  }
};

const registerComplete = async ( req, res) => {
  const { User, UserRole } = await connectToDatabase();
  console.log("register complete geldi.")
  const uuid = req.params.uuid;
  const isExist = await User.findOne({
    where: { EmailConfirmGuid: uuid, IsDeleted: false },
  });

  if(!isExist){
    res.redirect("/notFound");
  }else{
    await User.update({
      EmailConfirmGuid: '',
      ısEmailConfirmed: true
    },{ where: {Id: isExist.Id}});
    res.redirect('/login')
  }
}

const login = async (req, res) => {
  const { User, UserRole } = await connectToDatabase();
  const model = req.body;
  const user = await User.findOne({
    where: { Email: model.email, IsDeleted: false },
  });
  if (user == null) {
    res.render("register", );

  }
  if (user.Password !== md5(model.password)) {
    res.render("login");
  }

  const quarantineEndDate = user.QuarantineEndDate ? moment(user.QuarantineEndDate).utc():null;
  let difference;
  let stillInQuarantine = false;
  const today = moment().utc();
  if(user.InQuarantine){
    difference = moment.duration(quarantineEndDate.diff(today)).asDays();
    difference = Math.round(difference);
    stillInQuarantine = difference <= 0 ? false:true;
  }

  if(stillInQuarantine){
    await User.update({
      InQuarantine: false,
      QuarantineEndDate: null
    },{ where: {Id: user.Id}});
  }
  


  const userRole = await UserRole.findOne({
    where: { UserId: user.Id },
    attributes: ["RoleId"],
  });
    req.session.loggedinUser = true;
    req.session.usercode= user.Id;
    req.session.fullname= user.Name + " "+ user.Surname;
    req.session.email= user.Email;
    req.session.role= userRole.RoleId;
    req.session.company = user.CompanyId,
    req.session.quarantine = stillInQuarantine
    req.session.quarantineEndDate = stillInQuarantine ? difference:null
    console.log("logedin user:",user.Name + user.Surname)
    console.log("loggedin user:",userRole.RoleId)
    if(userRole.RoleId == 3){
      res.redirect("/admin")
    }else{
      res.redirect("/");
    }
  };
const update = async (req, res) => {
    const { User, UserRole } = await connectToDatabase();
    const model = req.body;
    console.log("model: ",model)
    if(model.Password && model.PasswordApprove){
      if((model.Password === model.PasswordApprove) && (model.Password != '')){
        await User.update({
          Name: model.Name,
          Surname: model.Surname,
          Password: md5(model.Password)
        }, {where: {Id: req.session.usercode}})
        };
      }else{
        await User.update({
          Name: model.Name,
          Surname: model.Surname,
        }, {where: {Id: req.session.usercode}})
      }
      req.session.fullname= model.Name + " "+ model.Surname;
      req.session.email= model.Email;
      res.redirect("/profile");
    }
    

module.exports = {
  update,
  register,
  login,
  registerComplete
};
