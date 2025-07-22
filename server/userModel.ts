import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "./dbConfig";

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  gender: string;
  birthdate: Date;
  email?: string;
  role?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public first_name!: string;
  public last_name!: string;
  public gender!: string;
  public birthdate!: Date;
  public email?: string;
  public role?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        const hash = require("bcrypt").hashSync(value, 10);
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
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

export default User;
