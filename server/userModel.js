const { DataTypes } = require("sequelize");
const sequelize = require("./dbConfig");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      const hash = bcrypt.hashSync(value, 10);
      this.setDataValue("password", hash);
    },
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

// Static users data
User.createStaticUsers = async function () {
  const users = [
    {
      username: "admin",
      password: "1",
      first_name: "Егор",
      last_name: "Опивалов",
      gender: "male",
      birthdate: "2004-11-17",
    },
    {
      username: "user1",
      password: "password1",
      first_name: "Иван",
      last_name: "Иванов",
      gender: "male",
      birthdate: "1990-05-15",
    },
    {
      username: "user2",
      password: "password2",
      first_name: "Мария",
      last_name: "Петрова",
      gender: "female",
      birthdate: "1995-08-22",
    },
    {
      username: "user3",
      password: "password3",
      first_name: "Алексей",
      last_name: "Сидоров",
      gender: "male",
      birthdate: "1985-03-10",
    },
    {
      username: "user4",
      password: "password4",
      first_name: "Елена",
      last_name: "Смирнова",
      gender: "female",
      birthdate: "1992-11-30",
    },
  ];

  for (const userData of users) {
    const existingUser = await this.findOne({
      where: { username: userData.username },
    });
    if (!existingUser) {
      await this.create(userData);
    }
  }
};

module.exports = User;
